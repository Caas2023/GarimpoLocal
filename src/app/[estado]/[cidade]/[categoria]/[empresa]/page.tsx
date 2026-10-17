import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';
import { findCompany } from '@/lib/catalog';

interface LocalidadeProps {
  params: Promise<{
    estado: string;
    cidade: string;
    categoria: string;
    empresa: string;
  }>;
}

export const instant = false;

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: LocalidadeProps): Promise<Metadata> {
  const { estado, cidade, categoria, empresa } = await params;
  const city = await getCityBySlug(estado, cidade);
  const company = city ? findCompany(String(city.id), categoria, empresa) : undefined;
  if (!company) return { title: 'Empresa não encontrada' };
  return {
    title: `${company.name} em ${formatCidadeNome(cidade, city)}`,
    description: `${company.name}: informações verificáveis, contato e fonte do cadastro.`,
  };
}

export default async function EmpresaPage({ params }: LocalidadeProps) {
  const { estado, cidade, categoria, empresa } = await params;
  const city = await getCityBySlug(estado, cidade);
  const company = city ? findCompany(String(city.id), categoria, empresa) : undefined;
  if (!city || !company) notFound();
  const name = company.name;
  const cityName = formatCidadeNome(cidade, city);
  const catName = company.category_label;

  // Schema.org LocalBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: name,
    address: company.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: company.address,
          addressLocality: cityName,
          addressRegion: estado.toUpperCase(),
          addressCountry: 'BR',
        }
      : undefined,
    telephone: company.phone || undefined,
    url: company.website || undefined,
  };

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb based on the architecture requirement */}
        <nav className="text-sm text-gray-500 flex space-x-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline text-[#005f73]">
            Início
          </Link>
          <span>/</span>
          <span className="uppercase text-[#005f73]">{estado}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{cityName}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{catName}</span>
        </nav>

        {/* Company Header */}
        <header className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between border-b pb-6 mb-6">
            <h1
              className="text-3xl font-bold text-gray-900 capitalize"
              style={{ color: '#005f73' }}
            >
              {name}
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium tracking-wide">
              MOCK/VERIFICADO
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
            <div className="space-y-4 text-gray-600">
              <p className="flex items-center">
                <span className="mr-2" style={{ color: '#f77f00' }}>
                  📍
                </span>
                {company.address
                  ? `${company.address} - ${cityName}, ${estado.toUpperCase()}`
                  : `Localidade: ${cityName}, ${estado.toUpperCase()}`}
              </p>
              <p className="flex items-center">
                <span className="mr-2" style={{ color: '#f77f00' }}>
                  📞
                </span>
                {company.phone || 'Telefone não informado na fonte'}
              </p>
            </div>

            <Link
              href={`/${estado}/${cidade}/${categoria}/${empresa}/correcao`}
              className="inline-flex items-center text-[#f77f00] hover:text-orange-600 font-medium text-sm border border-[#f77f00] hover:border-orange-600 rounded-md px-4 py-2 transition-colors"
            >
              ✎ Sugerir Correção / Reivindicar
            </Link>
          </div>
        </header>

        {/* Content Tabs mock (Guarulhos Aberta specifics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sobre nós</h2>
            {company.website ? (
              <a
                href={company.website}
                rel="nofollow noopener noreferrer"
                className="text-[#005f73] underline"
              >
                Site oficial
              </a>
            ) : (
              'Site não informado na fonte'
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Horário</h2>
            <p className="text-sm text-gray-600">Horários não informados na fonte.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
