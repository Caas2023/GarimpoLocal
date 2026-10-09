import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CidadeProps {
  params: Promise<{
    estado: string;
    cidade: string;
  }>;
}

// Mock categories generator
function getMockCategories() {
  return [
    { id: 'alimentacao', label: 'Alimentação', icon: '🍽️', count: 124 },
    { id: 'beleza', label: 'Beleza & Estética', icon: '💇‍♀️', count: 85 },
    { id: 'veiculos', label: 'Veículos', icon: '🚗', count: 56 },
    { id: 'saude', label: 'Saúde', icon: '⚕️', count: 92 },
    { id: 'tecnologia', label: 'Tecnologia', icon: '💻', count: 34 },
    { id: 'construcao', label: 'Construção', icon: '🏗️', count: 71 },
  ];
}

export const instant = false;

export default async function CidadePage({ params }: CidadeProps) {
  const { estado, cidade } = await params;
  
  if (estado.length !== 2) {
    notFound();
  }

  const categories = getMockCategories();
  const formatCidade = cidade.replace(/-/g, ' ');

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Nav Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 flex space-x-2">
          <Link href="/" className="hover:text-[#005f73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00] rounded">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <span className="uppercase">{estado}</span>
          <span aria-hidden="true">/</span>
          <span className="capitalize font-medium text-gray-700">{formatCidade}</span>
        </nav>

        {/* Page Header */}
        <header className="border-b border-[#005f73]/20 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold capitalize text-[#005f73]">
              {formatCidade}
            </h1>
            <p className="mt-2 text-gray-600 text-lg">
              Explore empresas e serviços em {formatCidade}, {estado.toUpperCase()}.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm font-medium text-gray-500">
              Base nacional piloto local
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link 
                href={`/${estado}/${cidade}/empresas/login`}
                className="text-[#005f73] border border-[#005f73] px-4 py-2 rounded-md text-sm font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#005f73]"
              >
                Login
              </Link>
              <Link 
                href={`/${estado}/${cidade}/empresas/cadastro`}
                className="bg-[#f77f00] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
              >
                Cadastrar Empresa
              </Link>
            </div>
          </div>
        </header>

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold text-[#005f73] mb-6">Explore por Categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                href={`/${estado}/${cidade}/${cat.id}`}
                className="group bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f77f00]"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-4xl" aria-hidden="true">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-[#005f73] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-sm text-gray-500">{cat.count} listings</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
