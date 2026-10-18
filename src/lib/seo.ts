const DEFAULT_SITE_URL = 'https://garimpolocal.vercel.app';

/**
 * Builds canonical URLs from the national route contract.
 * The host is configurable so the pilot can move to a definitive domain
 * without changing locality, category, or company data.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function buildCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function buildLocalityPath(estado: string, cidade: string): string {
  return `/${estado.toLowerCase()}/${cidade.toLowerCase()}`;
}
