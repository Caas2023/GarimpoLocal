import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CategoriaProps {
  params: Promise<{
    estado: string;
    cidade: string;
    categoria: string;
  }>;
}

// Mock data generator for layout representation (until API connects)
function getMockCompanies(cidade: string, categoria: string) {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `empresa-${i + 1}`,
    name: `Empresa Exemplo ${i + 1} de ${categoria.replace(/-/g, ' ')}`,
    slug: `empresa-exemplo-${i + 1}`,
    address: `Rua Exemplo ${i + 1}, Centro - ${cidade.replace(/-/g, ' ')}`,
    phone: `(11) 90000-000${i}`,
    status: i % 3 === 0 ? 'Fechado' : 'Aberto',
    verified: i % 2 === 0,
  }));
}

export const instant = false;

export default async function CategoriaPage({ params }: CategoriaProps) {
  const { estado, cidade, categoria } = await params;
  
  if (estado.length !== 2) {
    notFound();
  }

  const companies = getMockCompanies(cidade, categoria);

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
          <span className="capitalize">{cidade.replace(/-/g, ' ')}</span>
          <span aria-hidden="true">/</span>
          <span className="capitalize font-medium text-gray-700">{categoria.replace(/-/g, ' ')}</span>
        </nav>

        {/* Page Header */}
        <header className="border-b border-[#005f73]/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold capitalize text-[#005f73]">
            {categoria.replace(/-/g, ' ')} em {cidade.replace(/-/g, ' ')}
          </h1>
          <p className="mt-2 text-gray-600">
            Encontre os melhores serviços locais em {cidade.replace(/-/g, ' ')}, {estado.toUpperCase()}.
          </p>
        </header>

        {/* Action / Filter Bar */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded shadow-sm border border-gray-100">
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f77f00]">
              Mais Avaliados
            </button>
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f77f00]">
              Abertos Agora
            </button>
          </div>
          <p className="text-sm text-gray-500">{companies.length} resultados encontrados</p>
        </section>

        {/* Listings Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <article 
              key={company.id} 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow relative"
            >
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-[#005f73] line-clamp-2">
                    {company.name}
                  </h2>
                </div>
                
                <address className="text-sm text-gray-600 not-italic flex items-start gap-2">
                  <span aria-hidden="true">📍</span>
                  <span>{company.address}</span>
                </address>
                
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  {company.phone}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${company.status === 'Aberto' ? 'bg-[#2a9d8f]/15 text-[#2a9d8f]' : 'bg-red-100 text-red-700'}`}>
                    {company.status}
                  </span>
                  {company.verified && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-[#2a9d8f]/15 text-[#2a9d8f] flex items-center gap-1">
                      <span aria-hidden="true">✓</span> Verificado
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50">
                <Link 
                  href={`/${estado}/${cidade}/${categoria}/${company.slug}`}
                  className="block w-full py-2 px-4 text-center text-sm font-bold text-[#f77f00] border-2 border-[#f77f00] rounded hover:bg-[#f77f00] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f77f00]"
                >
                  Ver Detalhes
                </Link>
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
