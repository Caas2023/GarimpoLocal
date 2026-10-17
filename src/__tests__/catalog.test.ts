import {
  getCompaniesByLocality,
  getCompaniesByCategory,
  findCompany,
  getCategorySummary,
} from '@/lib/catalog';

describe('catalog', () => {
  const GUARULHOS_IBGE = '3518800';

  describe('getCompaniesByLocality', () => {
    it('returns companies for Guarulhos', () => {
      const companies = getCompaniesByLocality(GUARULHOS_IBGE);
      expect(companies.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown locality', () => {
      const companies = getCompaniesByLocality('9999999');
      expect(companies).toEqual([]);
    });

    it('returns empty array for invalid IBGE code', () => {
      const companies = getCompaniesByLocality('invalid');
      expect(companies).toEqual([]);
    });

    it('all companies have required fields', () => {
      const companies = getCompaniesByLocality(GUARULHOS_IBGE);
      for (const company of companies) {
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
        expect(company).toHaveProperty('slug');
        expect(company).toHaveProperty('category');
        expect(company).toHaveProperty('ibge');
        expect(company.ibge).toBe(GUARULHOS_IBGE);
      }
    });
  });

  describe('getCompaniesByCategory', () => {
    it('returns companies filtered by category', () => {
      const companies = getCompaniesByCategory(GUARULHOS_IBGE, 'alimentacao');
      expect(companies.length).toBeGreaterThan(0);
      for (const company of companies) {
        expect(company.category).toBe('alimentacao');
      }
    });

    it('returns empty array for unknown category', () => {
      const companies = getCompaniesByCategory(GUARULHOS_IBGE, 'categoria-inexistente');
      expect(companies).toEqual([]);
    });

    it('returns empty array for unknown locality', () => {
      const companies = getCompaniesByCategory('9999999', 'alimentacao');
      expect(companies).toEqual([]);
    });
  });

  describe('findCompany', () => {
    it('finds company by slug', () => {
      const companies = getCompaniesByLocality(GUARULHOS_IBGE);
      if (companies.length > 0) {
        const first = companies[0];
        const found = findCompany(GUARULHOS_IBGE, first.category, first.slug);
        expect(found).toBeDefined();
        expect(found?.name).toBe(first.name);
      }
    });

    it('finds company by name slugified', () => {
      const companies = getCompaniesByLocality(GUARULHOS_IBGE);
      if (companies.length > 0) {
        const first = companies[0];
        const nameSlug = first.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const found = findCompany(GUARULHOS_IBGE, first.category, nameSlug);
        expect(found).toBeDefined();
      }
    });

    it('returns undefined for non-existent company', () => {
      const found = findCompany(GUARULHOS_IBGE, 'alimentacao', 'empresa-inexistente-xyz');
      expect(found).toBeUndefined();
    });

    it('returns undefined for unknown locality', () => {
      const found = findCompany('9999999', 'alimentacao', 'some-slug');
      expect(found).toBeUndefined();
    });
  });

  describe('getCategorySummary', () => {
    it('returns category summary for Guarulhos', () => {
      const summary = getCategorySummary(GUARULHOS_IBGE);
      expect(summary.length).toBeGreaterThan(0);
    });

    it('summary has correct structure', () => {
      const summary = getCategorySummary(GUARULHOS_IBGE);
      for (const item of summary) {
        expect(item).toHaveProperty('slug');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('count');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBeGreaterThan(0);
      }
    });

    it('summary is sorted by label', () => {
      const summary = getCategorySummary(GUARULHOS_IBGE);
      const labels = summary.map((s) => s.label);
      const sorted = [...labels].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      expect(labels).toEqual(sorted);
    });

    it('returns empty array for unknown locality', () => {
      const summary = getCategorySummary('9999999');
      expect(summary).toEqual([]);
    });

    it('total count matches companies in locality', () => {
      const companies = getCompaniesByLocality(GUARULHOS_IBGE);
      const summary = getCategorySummary(GUARULHOS_IBGE);
      const totalFromSummary = summary.reduce((sum, s) => sum + s.count, 0);
      expect(totalFromSummary).toBe(companies.length);
    });
  });
});
