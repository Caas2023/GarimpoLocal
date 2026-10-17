/**
 * Lógica de apresentação da página individual de empresa.
 *
 * Separa regras de negócio (badge, schema, proveniência) do componente React,
 * permitindo teste unitário sem renderização DOM.
 *
 * Fontes suportadas:
 *   - "osm" / "openstreetmap": OpenStreetMap; licença ODbL obrigatória.
 *   - "google_places" / "google": Google Places API oficial.
 *   - qualquer outro valor: exibido como não-verificado.
 */

import type { CatalogCompany } from './catalog';

export type BadgeVariant = 'verificado' | 'nao-verificado';

export interface BadgeInfo {
  label: string;
  variant: BadgeVariant;
}

export interface ProvenanceInfo {
  source: string;        // nome amigável da fonte
  license: string;       // licença aplicável
  licenseUrl: string;    // URL da licença
  attribution: string;   // texto de atribuição exigido
}

export interface CompanyJsonLd {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: 'BR';
  };
  telephone?: string;
  url?: string;
  sameAs?: string;
}

/** Fontes OSM reconhecidas */
const OSM_SOURCES = new Set(['osm', 'openstreetmap', 'open_street_map']);
/** Fontes Google reconhecidas */
const GOOGLE_SOURCES = new Set(['google', 'google_places', 'google-places']);

/**
 * Retorna badge de verificação baseado na fonte real do registro.
 * Badge "verificado" significa que o dado vem de uma fonte pública rastreável,
 * não que o estabelecimento foi visitado pessoalmente.
 */
export function getBadgeInfo(source: string | undefined | null): BadgeInfo {
  const s = (source ?? '').toLowerCase().trim();

  if (OSM_SOURCES.has(s)) {
    return { label: 'Fonte: OpenStreetMap', variant: 'verificado' };
  }
  if (GOOGLE_SOURCES.has(s)) {
    return { label: 'Fonte: Google Places', variant: 'verificado' };
  }
  return { label: 'Fonte não verificada', variant: 'nao-verificado' };
}

/**
 * Retorna informações de proveniência (fonte, licença e atribuição) para
 * exibição obrigatória na página individual.
 */
export function getProvenanceInfo(source: string | undefined | null): ProvenanceInfo {
  const s = (source ?? '').toLowerCase().trim();

  if (OSM_SOURCES.has(s)) {
    return {
      source: 'OpenStreetMap',
      license: 'ODbL 1.0',
      licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
      attribution: '© Contribuidores do OpenStreetMap',
    };
  }
  if (GOOGLE_SOURCES.has(s)) {
    return {
      source: 'Google Places',
      license: 'Termos Google',
      licenseUrl: 'https://cloud.google.com/maps-platform/terms',
      attribution: 'Dados de lugares © Google',
    };
  }
  return {
    source: source || 'Desconhecida',
    license: 'Desconhecida',
    licenseUrl: '',
    attribution: 'Fonte não identificada',
  };
}

/**
 * Gera o objeto JSON-LD `LocalBusiness` para a página individual.
 * Campos opcionais são emitidos somente quando presentes no catálogo,
 * evitando schema com valores vazios.
 *
 * `sameAs` só é incluído para fontes verificáveis com ID externo rastreável.
 */
export function buildLocalBusinessJsonLd(
  company: CatalogCompany,
  cityName: string,
  stateSlug: string,
): CompanyJsonLd {
  const jsonLd: CompanyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
  };

  if (company.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: cityName,
      addressRegion: stateSlug.toUpperCase(),
      addressCountry: 'BR',
    };
  }

  if (company.phone) {
    jsonLd.telephone = company.phone;
  }

  if (company.website) {
    jsonLd.url = company.website;
  }

  // sameAs: somente para OSM com ID externo rastreável.
  const sourceLC = (company.source ?? '').toLowerCase().trim();
  if (OSM_SOURCES.has(sourceLC) && company.id) {
    // Convenção OSM para nós/ways: não há URL canônica universal por ID interno
    // do catálogo; omitimos sameAs para evitar URLs inválidas.
    // Quando o catálogo incluir o campo `osm_id` (ex: node/12345), usar:
    //   jsonLd.sameAs = `https://www.openstreetmap.org/node/${company.osm_id}`;
  }

  return jsonLd;
}
