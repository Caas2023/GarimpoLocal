import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';
import { getCompaniesByCategory } from '@/lib/catalog';
import { buildCanonicalUrl, buildLocalityPath } from '@/lib/seo';

interface CategoriaProps {
  params: Promise<{ estado: string; cidade: string; categoria: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: CategoriaProps): Promise<Metadata> {
  const { estado, cidade, categoria } = await params;
  const city = await getCityBySlug(estado, cidade);
  const cityName = formatCidadeNome(cidade, city);
  const categoryName = categoria.replace(/-/g, ' ');
  const canonicalPath = `${buildLocalityPath(estado, cidade)}/${categoria}`;
  return {
    title: `${categoryName} em ${cityName}`,
    description: `Empresas de ${categoryName} em ${cityName}, ${estado.toUpperCase()}, com fonte e cobertura informadas.`,
    alternates: { canonical: buildCanonicalUrl(canonicalPath) },
    openGraph: {
      title: `${categoryName} em ${cityName}`,
      description: `Empresas mapeadas de ${categoryName} em ${cityName}, com fonte e cobertura informadas.`,
      url: buildCanonicalUrl(canonicalPath),
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

export default async function CategoriaPage({ params }: CategoriaProps) {
  const { estado, cidade, categoria } = await params;
  const city = await getCityBySlug(estado, cidade);
  if (!city) notFound();

  const cityName = formatCidadeNome(cidade, city);
  const companies = getCompaniesByCategory(String(city.id), categoria);
  if (companies.length === 0) notFound();
  const categoryName = companies[0].category_label;

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 font-sans text-gray-800 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="rounded hover:text-[#005f73] focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
          >
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${estado}/${cidade}`} className="hover:text-[#005f73]">
            {cityName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-700">{categoryName}</span>
        </nav>
        <header className="border-b border-[#005f73]/20 pb-5">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f77f00]">
            Catálogo aberto · ODbL
          </p>
          <h1 className="text-3xl font-bold capitalize text-[#005f73] md:text-4xl">
            {categoryName} em {cityName}
          </h1>
          <p className="mt-2 text-gray-600">
            {companies.length.toLocaleString('pt-BR')} registros mapeados. O catálogo não representa
            todas as empresas da cidade.
          </p>
        </header>
        <section
          aria-label={`Empresas de ${categoryName}`}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {companies.map((company) => (
            <article
              key={`${company.id}`}
              className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex-1">
                <h2 className="line-clamp-2 text-lg font-bold text-[#005f73]">{company.name}</h2>
                {company.address && (
                  <address className="mt-3 text-sm not-italic text-gray-600">
                    {company.address}
                  </address>
                )}
                {company.neighbourhood && (
                  <p className="mt-2 text-sm text-gray-500">Bairro: {company.neighbourhood}</p>
                )}
                {company.phone && <p className="mt-2 text-sm text-gray-600">{company.phone}</p>}
                <p className="mt-4 text-xs text-gray-500">
                  Fonte: {company.source} · {company.source_license}
                </p>
              </div>
              <Link
                href={`/${estado}/${cidade}/${categoria}/${company.slug}`}
                className="mt-5 block rounded-md border-2 border-[#f77f00] px-4 py-2 text-center text-sm font-bold text-[#f77f00] hover:bg-[#f77f00] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
              >
                Ver detalhes
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
