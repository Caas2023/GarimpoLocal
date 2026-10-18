import { buildCanonicalUrl, buildLocalityPath, getSiteUrl } from '@/lib/seo';

describe('seo helpers', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('normalizes the configured site URL without trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://directory.example/';
    expect(getSiteUrl()).toBe('https://directory.example');
  });

  it('builds national locality paths without a city-specific constant', () => {
    expect(buildLocalityPath('SP', 'sao-paulo')).toBe('/sp/sao-paulo');
    expect(buildLocalityPath('MG', 'Belo-Horizonte')).toBe('/mg/belo-horizonte');
  });

  it('builds absolute canonical URLs for route paths', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://directory.example';
    expect(buildCanonicalUrl('/sp/guarulhos/servicos/empresa')).toBe(
      'https://directory.example/sp/guarulhos/servicos/empresa',
    );
  });
});
