'use strict';

/**
 * lib/categories.js
 *
 * Catálogo canônico de categorias empresariais em âmbito nacional.
 * - Suporta busca semântica por palavras-chave em pt-BR.
 * - Slugs normalizados e estáveis para rotas nacionais: /:uf/:municipio/:categoria
 * - Totalmente compatível com a arquitetura dos ~5.570 municípios brasileiros.
 */

const categoriesData = require('../data/categories.json');

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

function slugifyCategory(text) {
  if (!text || typeof text !== 'string') return 'geral';
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'geral'
  );
}

const validatedCategories = Object.freeze(
  categoriesData.map((cat) =>
    Object.freeze({
      slug: slugifyCategory(cat.slug),
      label: sanitize(cat.label),
      description: sanitize(cat.description || ''),
      icon: sanitize(cat.icon || 'briefcase'),
      keywords: Object.freeze(
        (Array.isArray(cat.keywords) ? cat.keywords : []).map((k) => slugifyCategory(String(k))),
      ),
    }),
  ),
);

const categoriesBySlug = new Map(validatedCategories.map((c) => [c.slug, c]));

// Mapeamento de sinônimos/aliases comuns
const CATEGORY_ALIASES = {
  alimentacao: 'alimentacao',
  comida: 'alimentacao',
  gastronomia: 'alimentacao',
  lanchonete: 'alimentacao',
  padaria: 'alimentacao',
  pizzaria: 'alimentacao',
  restaurante: 'restaurantes',
  bar: 'bares',
  choperia: 'bares',
  pub: 'bares',
  mercado: 'mercados',
  supermercado: 'supermercados',
  atacadao: 'supermercados',
  clinica: 'saude',
  medico: 'saude',
  dentista: 'saude',
  salao: 'beleza',
  barbearia: 'beleza',
  estetica: 'beleza',
  roupas: 'moda',
  calcados: 'moda',
  informatica: 'tecnologia',
  software: 'tecnologia',
  escola: 'educacao',
  faculdade: 'educacao',
  academia: 'esportes',
  banco: 'financas',
  oficina: 'automoveis',
  mecanica: 'automoveis',
  posto: 'postos',
  combustivel: 'postos',
  motofrete: 'logistica',
  motoboy: 'logistica',
  entregas: 'logistica',
  transportadora: 'logistica',
  advogado: 'advocacia',
  juridico: 'advocacia',
  contador: 'contabilidade',
  hotel: 'hoteis',
  pousada: 'hoteis',
  veterinaria: 'pet',
  farmacia: 'farmacias',
  drogaria: 'farmacias',
  oculos: 'otica',
  seguro: 'seguros',
  corretora: 'seguros',
  imovel: 'imobiliarias',
  imoveis: 'imobiliarias',
  construcao: 'construcao',
  grafica: 'graficas',
  festas: 'eventos',
  viagens: 'turismo',
  shopping: 'shopping',
};

function getCategories() {
  return validatedCategories;
}

function getCategoryBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const clean = slugifyCategory(slug);
  return categoriesBySlug.get(clean) || null;
}

function resolveCategory(input) {
  if (!input || typeof input !== 'string') {
    return categoriesBySlug.get('outros');
  }
  const clean = slugifyCategory(input);
  if (categoriesBySlug.has(clean)) {
    return categoriesBySlug.get(clean);
  }
  if (CATEGORY_ALIASES[clean] && categoriesBySlug.has(CATEGORY_ALIASES[clean])) {
    return categoriesBySlug.get(CATEGORY_ALIASES[clean]);
  }
  for (const cat of validatedCategories) {
    if (cat.keywords.includes(clean)) {
      return cat;
    }
  }
  return (
    categoriesBySlug.get('outros') || {
      slug: clean,
      label: sanitize(input),
      description: '',
      icon: 'briefcase',
      keywords: [],
    }
  );
}

function getCategoryLabelsMap() {
  const map = {};
  for (const cat of validatedCategories) {
    map[cat.slug] = cat.label;
  }
  return map;
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  resolveCategory,
  slugifyCategory,
  getCategoryLabelsMap,
  categories: validatedCategories,
};
