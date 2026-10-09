import { LoginForm } from './LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login de Empresa | Diretório Guarulhos Aberta',
  description: 'Acesse o painel da sua empresa no portal Guarulhos Aberta.'
};

interface LoginPageProps {
  params: Promise<{
    estado: string;
    cidade: string;
  }>;
}

export const instant = false;

export default async function LoginEmpresaPage({ params }: LoginPageProps) {
  const { estado, cidade } = await params;
  
  const baseUrl = `/${estado}/${cidade}`;
  const cadastroUrl = `/${estado}/${cidade}/empresas/cadastro`;
  
  const formatCidade = cidade.replace(/-/g, ' ');

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto space-y-8">
        
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
          <span className="font-medium text-gray-700">Login</span>
        </nav>

        <header className="border-b border-[#005f73]/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#005f73]">
            Acesso da Empresa
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Login gerenciado por {formatCidade}.
          </p>
        </header>

        <section>
          <LoginForm baseUrl={baseUrl} cadastroUrl={cadastroUrl} />
        </section>

      </div>
    </main>
  );
}
