import companiesData from '../../data/companies.json';
import { toSlug } from './ibge';

export interface CatalogCompany {
  id: number;
  name: string;
  slug: string;
  category: string;
  category_label: string;
  address: string;
  neighbourhood: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  ibge: string;
  source: string;
  source_license: string;
  lat: number;
  lng: number;
}

const companies = companiesData as CatalogCompany[];

/** O catálogo é somente leitura: cada registro mantém fonte e localidade. */
export function getCompaniesByLocality(municipalityId: string): CatalogCompany[] {
  return companies.filter((company) => company.ibge === municipalityId);
}

export function getCompaniesByCategory(
  municipalityId: string,
  categorySlug: string,
): CatalogCompany[] {
  return getCompaniesByLocality(municipalityId).filter(
    (company) => company.category === categorySlug,
  );
}

export function findCompany(
  municipalityId: string,
  categorySlug: string,
  companySlug: string,
): CatalogCompany | undefined {
  return getCompaniesByCategory(municipalityId, categorySlug).find(
    (company) => company.slug === companySlug || toSlug(company.name) === companySlug,
  );
}

export function getCategorySummary(municipalityId: string) {
  const summary = new Map<string, { slug: string; label: string; count: number }>();
  for (const company of getCompaniesByLocality(municipalityId)) {
    const current = summary.get(company.category) ?? {
      slug: company.category,
      label: company.category_label,
      count: 0,
    };
    current.count += 1;
    summary.set(company.category, current);
  }
  return [...summary.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
