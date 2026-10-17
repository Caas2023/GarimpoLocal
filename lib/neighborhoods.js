'use strict';

/**
 * lib/neighborhoods.js
 *
 * Mapeamento e normalização canônica de bairros e distritos por código IBGE.
 * - Suporta qualquer um dos ~5.570 municípios brasileiros (particionamento por IBGE 7 dígitos).
 * - Cidade-piloto Guarulhos (3518800) totalmente mapeada com nomes canônicos e zonas.
 * - Expansão inteligente de abreviações brasileiras (Jd., Vl., Pq., Res., Cj., etc.).
 * - Fallback seguro e resiliente para cidades sem catálogo prévio (sem quebras de execução).
 */

const neighborhoodsData = require('../data/neighborhoods.json');

const IBGE_MUNICIPALITY_ID_PATTERN = /^\d{7}$/;

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(text) {
  if (!text) return '';
  const smallWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em']);
  return text
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && smallWords.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/**
 * Expande abreviações usuais em nomes de logradouros e bairros brasileiros.
 */
function expandAbbreviations(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let clean = raw.trim();

  const rules = [
    { pattern: /\bjd\.?\s+/gi, replace: 'jardim ' },
    { pattern: /\bvl\.?\s+/gi, replace: 'vila ' },
    { pattern: /\bpq\.?\s+/gi, replace: 'parque ' },
    { pattern: /\bres\.?\s+/gi, replace: 'residencial ' },
    { pattern: /\bcj\.?\s+/gi, replace: 'conjunto ' },
    { pattern: /\bsto\.?\s+/gi, replace: 'santo ' },
    { pattern: /\bsta\.?\s+/gi, replace: 'santa ' },
    { pattern: /\bb\.?\s+/gi, replace: 'bairro ' },
    { pattern: /\bav\.?\s+/gi, replace: 'avenida ' },
    { pattern: /\br\.?\s+/gi, replace: 'rua ' },
  ];

  for (const { pattern, replace } of rules) {
    clean = clean.replace(pattern, replace);
  }

  return clean.replace(/\s+/g, ' ').trim();
}

// Map estruturado de bairros por código IBGE
const neighborhoodsByMunicipality = new Map();

for (const [ibge, list] of Object.entries(neighborhoodsData)) {
  if (IBGE_MUNICIPALITY_ID_PATTERN.test(ibge) && Array.isArray(list)) {
    const validatedList = list.map((item) =>
      Object.freeze({
        slug: slugify(item.slug || item.name),
        name: sanitize(item.name),
        zone: sanitize(item.zone || 'Geral'),
        aliases: Object.freeze(
          (Array.isArray(item.aliases) ? item.aliases : []).map((a) =>
            slugify(expandAbbreviations(String(a))),
          ),
        ),
      }),
    );
    neighborhoodsByMunicipality.set(ibge, Object.freeze(validatedList));
  }
}

function getNeighborhoodsByMunicipalityId(municipalityId) {
  const muniId = String(municipalityId || '').trim();
  if (!muniId || !IBGE_MUNICIPALITY_ID_PATTERN.test(muniId)) {
    return [];
  }
  return neighborhoodsByMunicipality.get(muniId) || [];
}

function getNeighborhoodBySlug(municipalityId, slug) {
  if (!slug || typeof slug !== 'string') return null;
  const targetSlug = slugify(expandAbbreviations(slug));
  const list = getNeighborhoodsByMunicipalityId(municipalityId);
  for (const item of list) {
    if (item.slug === targetSlug || item.aliases.includes(targetSlug)) {
      return item;
    }
  }
  return null;
}

/**
 * Normaliza uma string de bairro/distrito associada a um município IBGE.
 *
 * @param {string} rawNeighbourhood - Nome do bairro bruto (ex.: "Vl Galvao", "Jd. Maia", "Cumbica")
 * @param {string} municipalityId - Código IBGE de 7 dígitos do município
 * @returns {Object} { slug: string, name: string, canonical: boolean, zone?: string }
 */
function normalizeNeighborhood(rawNeighbourhood, municipalityId) {
  const cleaned = sanitize(rawNeighbourhood || '');
  if (!cleaned) {
    return {
      slug: '',
      name: '',
      canonical: false,
    };
  }

  const muniId = String(municipalityId || '').trim();
  const canonicalList = getNeighborhoodsByMunicipalityId(muniId);

  const expanded = expandAbbreviations(cleaned);
  const targetSlug = slugify(expanded);
  const directSlug = slugify(cleaned);

  // 1. Tenta correspondência no catálogo canônico do município
  if (canonicalList.length > 0) {
    for (const item of canonicalList) {
      if (item.slug === targetSlug || item.slug === directSlug) {
        return {
          slug: item.slug,
          name: item.name,
          zone: item.zone,
          canonical: true,
        };
      }
      if (item.aliases.includes(targetSlug) || item.aliases.includes(directSlug)) {
        return {
          slug: item.slug,
          name: item.name,
          zone: item.zone,
          canonical: true,
        };
      }
    }
  }

  // 2. Fallback não catalogado: formata e retorna seguro
  const formattedName = titleCase(expanded);
  return {
    slug: targetSlug || directSlug || 'bairro',
    name: formattedName,
    canonical: false,
  };
}

function listAvailableMunicipalitiesWithNeighborhoods() {
  return Array.from(neighborhoodsByMunicipality.keys());
}

module.exports = {
  getNeighborhoodsByMunicipalityId,
  getNeighborhoodBySlug,
  normalizeNeighborhood,
  expandAbbreviations,
  listAvailableMunicipalitiesWithNeighborhoods,
  slugify,
  sanitize,
};
