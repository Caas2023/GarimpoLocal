import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategorySummary, getCompaniesByCategory } from '@/lib/catalog';
import { buildCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Guarulhos Aberta — Diretório Empresarial',
  description:
    'Diretório de empresas de Guarulhos com dados verificáveis do OpenStreetMap. Arquitetura pronta para as 5.570 cidades brasileiras.',
  alternates: { canonical: buildCanonicalUrl('/') },
  openGraph: {
    title: 'Guarulhos Aberta — Diretório Empresarial',
    description:
      'Empresas de Guarulhos com fonte, licença e mecanismo de correção. Piloto de diretório nacional.',
    type: 'website',
    locale: 'pt_BR',
    url: buildCanonicalUrl('/'),
  },
};

/** Código IBGE de Guarulhos/SP — piloto. */
const GUARULHOS_IBGE = '3518800';
const ESTADO = 'sp';
const CIDADE = 'guarulhos';

/** Número de categorias a exibir na grade da homepage. */
const MAX_CATS = 12;

/** Número de empresas de destaque por categoria. */
const DESTAQUE_POR_CAT = 1;

export default function Home() {
  const allCategories = getCategorySummary(GUARULHOS_IBGE);
  const topCategories = allCategories.slice(0, MAX_CATS);

  // Seleciona uma empresa real de destaque por categoria (primeira do catálogo).
  const destaques = topCategories
    .map((cat) => {
      const companies = getCompaniesByCategory(GUARULHOS_IBGE, cat.slug);
      return companies.slice(0, DESTAQUE_POR_CAT).map((c) => ({
        name: c.name,
        slug: c.slug,
        category: cat.slug,
        categoryLabel: cat.label,
        address: c.address || null,
        neighbourhood: c.neighbourhood || null,
      }));
    })
    .flat()
    .slice(0, 6); // até 6 cards de destaque

  const totalEmpresas = allCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <main className="min-h-screen bg-[#FFFFF0] text-gray-800 font-sans">
      {/* Hero */}
      <header className="w-full bg-[#005f73] text-white px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Guarulhos Aberta
        </h1>
        <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto mb-6">
          Diretório empresarial de Guarulhos com fonte verificável.
          Arquitetura pronta para as 5.570 cidades brasileiras.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm text-cyan-100">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
          {totalEmpresas.toLocaleString('pt-BR')} empresas · OpenStreetMap · ODbL 1.0 ·{' '}
          {allCategories.length} categorias
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {/* Categorias */}
        <section aria-labelledby="categorias-titulo">
          <div className="flex items-baseline justify-between mb-6">
            <h2
              id="categorias-titulo"
              className="text-2xl font-bold"
              style={{ color: '#EE9B00' }}
            >
              Categorias em Guarulhos
            </h2>
            <Link
              href={`/${ESTADO}/${CIDADE}`}
              className="text-sm text-[#005f73] hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="list">
            {topCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${ESTADO}/${CIDADE}/${cat.slug}`}
                  className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#005f73] transition-all focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
                >
                  <span className="font-semibold text-[#005f73] text-sm leading-tight">
                    {cat.label}
                  </span>
                  <span className="mt-1 text-xs text-gray-400">
                    {cat.count} {cat.count === 1 ? 'empresa' : 'empresas'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {allCategories.length > MAX_CATS && (
            <p className="mt-4 text-sm text-gray-500">
              + {allCategories.length - MAX_CATS} outras categorias disponíveis em{' '}
              <Link href={`/${ESTADO}/${CIDADE}`} className="text-[#005f73] hover:underline">
                Guarulhos
              </Link>
              .
            </p>
          )}
        </section>

        {/* Empresas de destaque */}
        {destaques.length > 0 && (
          <section aria-labelledby="destaques-titulo">
            <h2
              id="destaques-titulo"
              className="text-2xl font-bold mb-6"
              style={{ color: '#EE9B00' }}
            >
              Empresas no Catálogo
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" role="list">
              {destaques.map((company) => (
                <li key={`${company.category}-${company.slug}`}>
                  <Link
                    href={`/${ESTADO}/${CIDADE}/${company.category}/${company.slug}`}
                    className="block p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#005f73] transition-all focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
                  >
                    <h3
                      className="font-semibold text-base leading-snug capitalize"
                      style={{ color: '#005f73' }}
                    >
                      {company.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{company.categoryLabel}</p>
                    {company.neighbourhood && (
                      <p className="text-xs text-gray-400 mt-0.5">{company.neighbourhood}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Arquitetura nacional */}
        <section
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-3"
          aria-labelledby="nacional-titulo"
        >
          <h2 id="nacional-titulo" className="text-lg font-bold text-gray-800">
            Arquitetura Nacional
          </h2>
          <p className="text-sm text-gray-600">
            Guarulhos é a cidade-piloto. Cada rota usa{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">/estado/cidade/categoria/empresa</code>{' '}
            com IDs IBGE como identificadores — sem constantes hardcoded por cidade. O modelo está pronto
            para as aproximadamente 5.570 cidades brasileiras.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>
              5.571 municípios carregados do catálogo IBGE (
              <code className="bg-gray-100 px-1 rounded text-xs">src/lib/data/municipalities.json</code>
              )
            </li>
            <li>1.502 empresas de Guarulhos via OpenStreetMap/ODbL</li>
            <li>Sitemap, canonical e Open Graph nacionais por localidade</li>
            <li>Reivindicação/correção com validação IBGE e protocolo rastreável</li>
          </ul>
          <Link
            href={`/${ESTADO}/${CIDADE}`}
            className="inline-block mt-2 text-sm font-medium text-[#005f73] hover:underline"
          >
            Explorar Guarulhos →
          </Link>
        </section>

        {/* Compliance */}
        <footer className="border-t border-gray-200 pt-6 text-xs text-gray-400 space-y-1">
          <p>
            Dados via{' '}
            <a
              href="https://www.openstreetmap.org/"
              rel="nofollow noopener noreferrer"
              className="underline hover:text-[#005f73]"
            >
              OpenStreetMap
            </a>{' '}
            © Contribuidores do OpenStreetMap ·{' '}
            <a
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              rel="nofollow noopener noreferrer"
              className="underline hover:text-[#005f73]"
            >
              Licença ODbL 1.0
            </a>
            . Cobertura limitada ao que foi mapeado; dados não verificados pessoalmente.
          </p>
          <p>
            Não afiliado ao Google. Dados Google só entram via API oficial autorizada. Sem raspagem.
          </p>
        </footer>
      </div>
    </main>
  );
}
