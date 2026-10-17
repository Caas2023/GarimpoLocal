import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';

interface LoginPageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { estado, cidade } = await params;
  const city = await getCityBySlug(estado, cidade);
  const cityName = formatCidadeNome(cidade, city);
  return {
    title: `Acesso da empresa — ${cityName}`,
    description: `Área de acesso da empresa no diretório de ${cityName}, ${estado.toUpperCase()}.`,
  };
}

export default async function LoginEmpresaPage({ params }: LoginPageProps) {
  const { estado, cidade } = await params;
  const city = await getCityBySlug(estado, cidade);
  const cityName = formatCidadeNome(cidade, city);
  const baseUrl = `/${estado}/${cidade}`;
  const cadastroUrl = `/${estado}/${cidade}/empresas/cadastro`;

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 flex space-x-2">
          <Link
            href="/"
            className="hover:underline text-[#005f73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00] rounded"
          >
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={baseUrl}
            className="hover:underline text-[#005f73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00] rounded"
          >
            {cityName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-700">Login</span>
        </nav>

        <header className="border-b border-[#005f73]/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#005f73]">Acesso da Empresa</h1>
          <p className="mt-2 text-gray-600 text-lg">Painel do diretório para {cityName}.</p>
        </header>

        {/* O login por senha ainda não existe. Preferimos informar isso a exibir
            um formulário que nunca conseguiria autenticar ninguém. */}
        <section
          className="bg-white rounded-lg shadow-sm border-l-4 border-[#f77f00] p-6"
          role="status"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ainda não disponível</h2>
          <p className="text-gray-700 mb-4">
            O acesso por senha está em desenvolvimento. Nenhuma conta pode ser criada ou acessada
            neste momento.
          </p>
          <p className="text-gray-700 mb-4">
            Enquanto isso, você já pode <strong>sugerir correções e reivindicar a página</strong> de
            qualquer empresa do diretório — a página de cada empresa tem o link
            <em> Sugerir Correção / Reivindicar</em>.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={baseUrl}
              className="inline-block bg-[#005f73] text-white px-6 py-3 rounded-md font-semibold transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-[#005f73]"
            >
              Ver empresas de {cityName}
            </Link>
            <Link
              href={cadastroUrl}
              className="px-6 py-3 rounded-md font-medium text-gray-700 border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Sobre o cadastro de empresas
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
