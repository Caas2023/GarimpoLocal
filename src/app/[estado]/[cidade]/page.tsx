import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';
import { getCategorySummary } from '@/lib/catalog';

interface CidadeProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export const instant = false;

export default async function CidadePage({ params }: CidadeProps) {
  const { estado, cidade } = await params;
  const city = await getCityBySlug(estado, cidade);
  if (!city) notFound();

  const cityName = formatCidadeNome(cidade, city);
  const categories = getCategorySummary(String(city.id));
  const totalCompanies = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 font-sans text-gray-800 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <nav aria-label="Breadcrumb" className="flex space-x-2 text-sm text-gray-500">
          <Link href="/" className="rounded hover:text-[#005f73] focus:outline-none focus:ring-2 focus:ring-[#f77f00]">Início</Link>
          <span aria-hidden="true">/</span>
          <span className="uppercase">{estado}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-700">{cityName}</span>
        </nav>

        <header className="flex flex-col justify-between gap-4 border-b border-[#005f73]/20 pb-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f77f00]">Diretório local verificável</p>
            <h1 className="text-3xl font-bold text-[#005f73] md:text-5xl">Empresas em {cityName}</h1>
            <p className="mt-2 max-w-2xl text-gray-600">Explore {totalCompanies.toLocaleString('pt-BR')} registros com origem OpenStreetMap e cobertura limitada ao que foi mapeado.</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/${estado}/${cidade}/empresas/login`} className="rounded-md border border-[#005f73] px-4 py-2 text-sm font-semibold text-[#005f73] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-[#005f73]">Login</Link>
            <Link href={`/${estado}/${cidade}/empresas/cadastro`} className="rounded-md bg-[#f77f00] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#f77f00]">Cadastrar empresa</Link>
          </div>
        </header>

        <section aria-labelledby="categories-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="categories-heading" className="text-2xl font-bold text-[#005f73]">Explore por categoria</h2>
            <span className="text-sm text-gray-500">{categories.length} categorias catalogadas</span>
          </div>
          {categories.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-600">Ainda não há empresas catalogadas nesta localidade.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category.slug} href={`/${estado}/${cidade}/${category.slug}`} className="group rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#f77f00]">
                  <h3 className="font-bold text-gray-800 group-hover:text-[#005f73]">{category.label}</h3>
                  <p className="mt-2 text-sm text-gray-500">{category.count.toLocaleString('pt-BR')} registros</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
