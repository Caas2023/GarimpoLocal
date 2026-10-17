/**
 * Testes unitários para src/lib/company-page.ts
 *
 * Cobre: getBadgeInfo, getProvenanceInfo, buildLocalBusinessJsonLd.
 * Não depende de DOM, fetch ou Next.js — roda puro com Jest/ts-jest.
 */

import {
  getBadgeInfo,
  getProvenanceInfo,
  buildLocalBusinessJsonLd,
} from '@/lib/company-page';
import type { CatalogCompany } from '@/lib/catalog';

// Empresa OSM mínima para testes
const OSM_COMPANY: CatalogCompany = {
  id: 1,
  name: 'Auto Center Guarulhos',
  slug: 'auto-center-guarulhos',
  category: 'auto-servicos',
  category_label: 'Auto Serviços',
  address: 'Rua das Palmeiras, 100',
  neighbourhood: 'Centro',
  city: 'guarulhos',
  state: 'sp',
  phone: '+55 11 98765-4321',
  whatsapp: '',
  website: 'https://autocentergru.com.br',
  email: '',
  ibge: '3518800',
  source: 'osm',
  source_license: 'ODbL',
  lat: -23.46,
  lng: -46.53,
};

// Empresa sem fonte
const UNKNOWN_COMPANY: CatalogCompany = {
  ...OSM_COMPANY,
  id: 2,
  source: '',
  source_license: '',
};

// ─────────────────────────────────────────────
// getBadgeInfo
// ─────────────────────────────────────────────
describe('getBadgeInfo', () => {
  it('retorna "verificado" para fonte "osm"', () => {
    const badge = getBadgeInfo('osm');
    expect(badge.variant).toBe('verificado');
    expect(badge.label).toContain('OpenStreetMap');
  });

  it('retorna "verificado" para variantes de OSM (case-insensitive)', () => {
    expect(getBadgeInfo('OpenStreetMap').variant).toBe('verificado');
    expect(getBadgeInfo('OPENSTREETMAP').variant).toBe('verificado');
    expect(getBadgeInfo('open_street_map').variant).toBe('verificado');
  });

  it('retorna "verificado" para fonte "google_places"', () => {
    const badge = getBadgeInfo('google_places');
    expect(badge.variant).toBe('verificado');
    expect(badge.label).toContain('Google');
  });

  it('retorna "nao-verificado" para fonte vazia', () => {
    expect(getBadgeInfo('').variant).toBe('nao-verificado');
    expect(getBadgeInfo(undefined).variant).toBe('nao-verificado');
    expect(getBadgeInfo(null).variant).toBe('nao-verificado');
  });

  it('retorna "nao-verificado" para fonte desconhecida', () => {
    expect(getBadgeInfo('manual').variant).toBe('nao-verificado');
    expect(getBadgeInfo('importacao_interna').variant).toBe('nao-verificado');
  });
});

// ─────────────────────────────────────────────
// getProvenanceInfo
// ─────────────────────────────────────────────
describe('getProvenanceInfo', () => {
  it('retorna proveniência OSM com licença ODbL', () => {
    const prov = getProvenanceInfo('osm');
    expect(prov.source).toBe('OpenStreetMap');
    expect(prov.license).toBe('ODbL 1.0');
    expect(prov.licenseUrl).toContain('opendatacommons.org');
    expect(prov.attribution).toContain('OpenStreetMap');
  });

  it('retorna proveniência Google Places', () => {
    const prov = getProvenanceInfo('google');
    expect(prov.source).toBe('Google Places');
    expect(prov.licenseUrl).toContain('google.com');
  });

  it('preserva valor original para fonte desconhecida', () => {
    const prov = getProvenanceInfo('fonte_customizada');
    expect(prov.source).toBe('fonte_customizada');
    expect(prov.license).toBe('Desconhecida');
  });

  it('trata undefined como desconhecida', () => {
    const prov = getProvenanceInfo(undefined);
    expect(prov.source).toBe('Desconhecida');
  });
});

// ─────────────────────────────────────────────
// buildLocalBusinessJsonLd
// ─────────────────────────────────────────────
describe('buildLocalBusinessJsonLd', () => {
  it('gera JSON-LD com contexto e tipo corretos', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('LocalBusiness');
  });

  it('inclui nome da empresa', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd.name).toBe('Auto Center Guarulhos');
  });

  it('inclui endereço quando presente', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd.address).toBeDefined();
    expect(jsonLd.address?.streetAddress).toBe('Rua das Palmeiras, 100');
    expect(jsonLd.address?.addressLocality).toBe('Guarulhos');
    expect(jsonLd.address?.addressRegion).toBe('SP');
    expect(jsonLd.address?.addressCountry).toBe('BR');
  });

  it('inclui telefone quando presente', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd.telephone).toBe('+55 11 98765-4321');
  });

  it('inclui website quando presente', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd.url).toBe('https://autocentergru.com.br');
  });

  it('omite endereço quando ausente', () => {
    const company: CatalogCompany = { ...OSM_COMPANY, address: '' };
    const jsonLd = buildLocalBusinessJsonLd(company, 'Guarulhos', 'sp');
    expect(jsonLd.address).toBeUndefined();
  });

  it('omite telefone quando ausente', () => {
    const company: CatalogCompany = { ...OSM_COMPANY, phone: '' };
    const jsonLd = buildLocalBusinessJsonLd(company, 'Guarulhos', 'sp');
    expect(jsonLd.telephone).toBeUndefined();
  });

  it('omite url quando ausente', () => {
    const company: CatalogCompany = { ...OSM_COMPANY, website: '' };
    const jsonLd = buildLocalBusinessJsonLd(company, 'Guarulhos', 'sp');
    expect(jsonLd.url).toBeUndefined();
  });

  it('não inclui campos inválidos para empresa sem fonte', () => {
    const jsonLd = buildLocalBusinessJsonLd(UNKNOWN_COMPANY, 'Guarulhos', 'sp');
    // JSON-LD ainda é válido — apenas sem sameAs ou url
    expect(jsonLd['@type']).toBe('LocalBusiness');
  });

  it('estado é emitido em maiúsculas independente da entrada', () => {
    const jsonLd = buildLocalBusinessJsonLd(OSM_COMPANY, 'Guarulhos', 'sp');
    expect(jsonLd.address?.addressRegion).toBe('SP');
  });
});
