'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getNeighborhoodsByMunicipalityId,
  getNeighborhoodBySlug,
  normalizeNeighborhood,
  expandAbbreviations,
} = require('../lib/neighborhoods');
const { getCategories, getCategoryBySlug, resolveCategory } = require('../lib/categories');
const {
  normalizeCompany,
  saveCompany,
  listCompanies,
  resetMemoryStore,
} = require('../lib/company_store');

const GUARULHOS = '3518800';

test.beforeEach(() => resetMemoryStore());

test('catálogo de categorias é nacional e não depende de Guarulhos', () => {
  const categories = getCategories();
  assert.ok(categories.length >= 30);
  assert.ok(getCategoryBySlug('logistica'));
  assert.equal(resolveCategory('motoboy').slug, 'logistica');
  assert.equal(resolveCategory('Jd. Maia').slug, 'outros');
});

test('normaliza aliases e abreviações de bairros de Guarulhos', () => {
  assert.ok(getNeighborhoodsByMunicipalityId(GUARULHOS).length >= 40);
  assert.equal(expandAbbreviations('Jd. Maia'), 'jardim Maia');
  assert.deepEqual(normalizeNeighborhood('Vl. Galvao', GUARULHOS), {
    slug: 'vila-galvao',
    name: 'Vila Galvão',
    zone: 'Oeste',
    canonical: true,
  });
  assert.equal(getNeighborhoodBySlug(GUARULHOS, 'vila-galvao').name, 'Vila Galvão');
  assert.equal(getNeighborhoodBySlug(GUARULHOS, 'Vl. Galvão').name, 'Vila Galvão');
});

test('mantém fallback de bairro não catalogado sem quebrar a busca nacional', () => {
  const result = normalizeNeighborhood('Jardim Novo Horizonte', GUARULHOS);
  assert.equal(result.canonical, false);
  assert.equal(result.slug, 'jardim-novo-horizonte');
  assert.equal(normalizeNeighborhood('Centro', '3304557').canonical, false);
});

test('buildOverpassQuery aplica bairro sem aceitar regex arbitrária', () => {
  const { buildOverpassQuery } = require('../lib/osm_importer');
  const locality = {
    municipalityId: GUARULHOS,
    stateId: '35',
    stateCode: 'SP',
    stateSlug: 'sp',
    municipalityName: 'Guarulhos',
    municipalitySlug: 'guarulhos',
  };
  const query = buildOverpassQuery(locality, { neighbourhood: 'Vila Galvão' });
  assert.match(query, /addr:suburb/);
  assert.match(query, /Vila Galvão/);
});
test('normaliza empresas com slug de bairro e filtra por bairro', async () => {
  const company = normalizeCompany({
    id: 42,
    name: 'Empresa Vila Galvão',
    municipalityId: GUARULHOS,
    category: 'logistica',
    neighbourhood: 'Vl. Galvao',
  });
  assert.equal(company.neighbourhood, 'Vila Galvão');
  assert.equal(company.neighbourhoodSlug, 'vila-galvao');

  await saveCompany({
    id: 42,
    name: 'Empresa Vila Galvão',
    municipalityId: GUARULHOS,
    category: 'logistica',
    neighbourhood: 'Vl. Galvao',
  });
  await saveCompany({
    id: 43,
    name: 'Empresa Centro',
    municipalityId: GUARULHOS,
    category: 'logistica',
    neighbourhood: 'Centro',
  });

  const results = await listCompanies(GUARULHOS, { neighbourhoodSlug: 'vila-galvao' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 42);
});

test('categorias e bairros preservam IDs IBGE no modelo', () => {
  const normalized = normalizeCompany({
    id: 7,
    name: 'Empresa Nacional',
    municipalityId: '3304557',
    category: 'servicos',
    neighbourhood: 'Centro',
  });
  assert.equal(normalized.municipalityId, '3304557');
  assert.equal(normalized.ibge, '3304557');
  assert.equal(normalized.neighbourhoodSlug, 'centro');
});
