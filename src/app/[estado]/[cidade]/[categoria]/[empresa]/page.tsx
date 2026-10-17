import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';
import { findCompany } from '@/lib/catalog';
import {
  getBadgeInfo,
  getProvenanceInfo,
  buildLocalBusinessJsonLd,
} from '@/lib/company-page';

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
  const cityName = formatCidadeNome(cidade, city);
  return {
    title: `${company.name} em ${cityName}`,
    description: `${company.name}: informações verificáveis, contato e fonte do cadastro em ${cityName}.`,
  };
}

export default async function EmpresaPage({ params }: LocalidadeProps) {
  const { estado, cidade, categoria, empresa } = await params;
  const city = await getCityBySlug(estado, cidade);
  const company = city ? findCompany(String(city.id), categoria, empresa) : undefined;
  if (!city || !company) notFound();

  const cityName = formatCidadeNome(cidade, city);
  const catName = company.category_label;
  const badge = getBadgeInfo(company.source);
  const provenance = getProvenanceInfo(company.source);
  const jsonLd = buildLocalBusinessJsonLd(company, cityName, estado);

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex flex-wrap gap-x-2 items-center" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline text-[#005f73]">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${estado}`} className="hover:underline text-[#005f73] uppercase">
            {estado}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${estado}/${cidade}`} className="hover:underline text-[#005f73] capitalize">
            {cityName}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${estado}/${cidade}/${categoria}`} className="hover:underline text-[#005f73] capitalize">
            {catName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">{company.name}</span>
        </nav>

        {/* Company Header */}
        <header className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <div className="flex items-start justify-between border-b pb-6 mb-6 gap-4">
            <h1
              className="text-3xl font-bold capitalize leading-tight"
              style={{ color: '#005f73' }}
            >
              {company.name}
            </h1>

            {/* Badge dinâmico baseado na fonte real */}
            <span
              className={[
                'px-3 py-1 rounded-full text-sm font-medium tracking-wide whitespace-nowrap shrink-0',
                badge.variant === 'verificado'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600',
              ].join(' ')}
              title={badge.label}
            >
              {badge.variant === 'verificado' ? '✓ ' : ''}
              {badge.label}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
            <div className="space-y-3 text-gray-600">
              {/* Endereço */}
              <p className="flex items-start gap-2">
                <span style={{ color: '#f77f00' }} aria-hidden="true">📍</span>
                <span>
                  {company.address
                    ? `${company.address} — ${cityName}, ${estado.toUpperCase()}`
                    : `${cityName}, ${estado.toUpperCase()}`}
                </span>
              </p>

              {/* Telefone */}
              <p className="flex items-center gap-2">
                <span style={{ color: '#f77f00' }} aria-hidden="true">📞</span>
                {company.phone
                  ? <a href={`tel:${company.phone.replace(/\D/g, '')}`} className="hover:underline">{company.phone}</a>
                  : <span className="text-gray-400">Telefone não informado na fonte</span>
                }
              </p>

              {/* WhatsApp */}
              {company.whatsapp && (
                <p className="flex items-center gap-2">
                  <span style={{ color: '#f77f00' }} aria-hidden="true">💬</span>
                  <a
                    href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                    rel="nofollow noopener noreferrer"
                    className="text-[#005f73] hover:underline"
                  >
                    WhatsApp
                  </a>
                </p>
              )}
            </div>

            <Link
              href={`/${estado}/${cidade}/${categoria}/${empresa}/correcao`}
              className="inline-flex items-center text-[#f77f00] hover:text-orange-600 font-medium text-sm border border-[#f77f00] hover:border-orange-600 rounded-md px-4 py-2 transition-colors"
            >
              ✎ Sugerir Correção / Reivindicar
            </Link>
          </div>
        </header>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-8 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Informações</h2>

            {company.website ? (
              <p>
                <a
                  href={company.website}
                  rel="nofollow noopener noreferrer"
                  className="text-[#005f73] underline break-all"
                >
                  Site oficial
                </a>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Site não informado na fonte.</p>
            )}

            {company.email && (
              <p>
                <a
                  href={`mailto:${company.email}`}
                  className="text-[#005f73] underline"
                >
                  {company.email}
                </a>
              </p>
            )}

            {company.neighbourhood && (
              <p className="text-sm text-gray-600">
                Bairro: <span className="font-medium">{company.neighbourhood}</span>
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Horários</h2>
            <p className="text-sm text-gray-400">Horários não informados na fonte.</p>
          </div>
        </div>

        {/* Proveniência — obrigatória ODbL para dados OSM */}
        <footer className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-xs text-gray-500 space-y-1">
          <p>
            <strong>Fonte dos dados:</strong>{' '}
            {provenance.licenseUrl ? (
              <>
                {provenance.attribution} •{' '}
                <a
                  href={provenance.licenseUrl}
                  rel="nofollow noopener noreferrer"
                  className="underline hover:text-[#005f73]"
                >
                  Licença {provenance.license}
                </a>
              </>
            ) : (
              provenance.attribution
            )}
          </p>
          <p>
            Informações sujeitas a alteração. Dados obtidos de fontes públicas e não verificados pessoalmente.{' '}
            <Link href={`/${estado}/${cidade}/${categoria}/${empresa}/correcao`} className="underline hover:text-[#005f73]">
              Sugira uma correção.
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
