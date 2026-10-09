import { CadastroForm } from './CadastroForm';
import Link from 'next/link';

export const metadata = {
  title: 'Cadastro de Empresa | Diretório Guarulhos Aberta',
  description: 'Cadastre sua empresa no portal Guarulhos Aberta e ganhe mais visibilidade.'
};

interface CadastroPageProps {
  params: Promise<{
    estado: string;
    cidade: string;
  }>;
}

export const instant = false;

export default async function CadastroEmpresaPage({ params }: CadastroPageProps) {
  const { estado, cidade } = await params;
  
  const baseUrl = `/${estado}/${cidade}`;
  const loginUrl = `/${estado}/${cidade}/empresas/login`;
  
  const formatCidade = cidade.replace(/-/g, ' ');

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Nav Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 flex space-x-2">
          <Link href="/" className="hover:text-[#005f73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00] rounded">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={baseUrl} className="capitalize hover:text-[#005f73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00] rounded">
            {formatCidade}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-gray-700">Cadastro de Empresas</span>
        </nav>

        <header className="border-b border-[#005f73]/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#005f73]">
            Cadastro de Empresa
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Crie sua conta gratuitamente e adicione seu negócio em {formatCidade}.
          </p>
        </header>

        <section>
          <CadastroForm baseUrl={baseUrl} loginUrl={loginUrl} />
        </section>

      </div>
    </main>
  );
}
