import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';

interface CadastroPageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: CadastroPageProps): Promise<Metadata> {
  const { estado, cidade } = await params;
  const city = await getCityBySlug(estado, cidade);
  const cityName = formatCidadeNome(cidade, city);
  return {
    title: `Cadastro de empresa — ${cityName}`,
    description: `Cadastre sua empresa no diretório de ${cityName}, ${estado.toUpperCase()}.`,
  };
}

export default async function CadastroEmpresaPage({ params }: CadastroPageProps) {
  const { estado, cidade } = await params;
  const city = await getCityBySlug(estado, cidade);
  const cityName = formatCidadeNome(cidade, city);
  const baseUrl = `/${estado}/${cidade}`;
  const loginUrl = `/${estado}/${cidade}/empresas/login`;

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">
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
          <span className="font-medium text-gray-700">Cadastro de Empresas</span>
        </nav>

        <header className="border-b border-[#005f73]/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#005f73]">Cadastro de Empresa</h1>
          <p className="mt-2 text-gray-600 text-lg">
            Adicione seu negócio ao diretório de {cityName}.
          </p>
        </header>

        {/* O cadastro de contas ainda não existe. Exibir um formulário aqui
            criaria a promessa de uma conta que não pode ser criada. */}
        <section
          className="bg-white rounded-lg shadow-sm border-l-4 border-[#f77f00] p-6"
          role="status"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ainda não disponível</h2>
          <p className="text-gray-700 mb-4">
            A criação de contas está em desenvolvimento. Nenhuma conta pode ser criada neste
            momento.
          </p>
          <p className="text-gray-700 mb-4">
            O caminho que já funciona é a <strong>reivindicação de página</strong>: se a sua empresa
            já aparece no diretório, abra a página dela e use{' '}
            <em>Sugerir Correção / Reivindicar</em>. A solicitação entra em fila de verificação e
            você recebe o resultado por e-mail.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={baseUrl}
              className="inline-block bg-[#005f73] text-white px-6 py-3 rounded-md font-semibold transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-[#005f73]"
            >
              Ver empresas de {cityName}
            </Link>
            <Link
              href={loginUrl}
              className="px-6 py-3 rounded-md font-medium text-gray-700 border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Sobre o acesso por senha
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
