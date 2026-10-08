import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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
  const name = empresa.replace(/-/g, ' ');
  const cityName = cidade.replace(/-/g, ' ');
  const catName = categoria.replace(/-/g, ' ');

  return {
    title: `${name} - ${catName} em ${cityName}, ${estado.toUpperCase()}`,
    description: `Encontre informações, telefone e endereço de ${name}, especialista em ${catName} localizado em ${cityName}, ${estado.toUpperCase()}.`,
    openGraph: {
      title: `${name} | Guarulhos Aberta`,
      description: `Informações de ${name} em ${cityName}, ${estado.toUpperCase()}.`,
      type: 'website',
    }
  };
}

export default async function EmpresaPage({ params }: LocalidadeProps) {
  const { estado, cidade, categoria, empresa } = await params;
  
  // Validation for UF length
  if (estado.length !== 2) {
    notFound();
  }

  const name = empresa.replace(/-/g, ' ');
  const cityName = cidade.replace(/-/g, ' ');
  const catName = categoria.replace(/-/g, ' ');

  // Schema.org LocalBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Exemplo Principal, 1000',
      addressLocality: cityName,
      addressRegion: estado.toUpperCase(),
      addressCountry: 'BR'
    },
    telephone: '+5511900000000',
    url: `https://guarulhosaberta.com.br/${estado}/${cidade}/${categoria}/${empresa}`
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
          <Link href="/" className="hover:underline text-[#005f73]">Início</Link>
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
            <h1 className="text-3xl font-bold text-gray-900 capitalize" style={{ color: '#005f73' }}>
              {name}
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium tracking-wide">
              MOCK/VERIFICADO
            </span>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p className="flex items-center">
              <span className="mr-2" style={{ color: '#f77f00' }}>📍</span>
              Av. Exemplo Principal, 1000 - {cityName}, {estado.toUpperCase()}
            </p>
            <p className="flex items-center">
              <span className="mr-2" style={{ color: '#f77f00' }}>📞</span>
              (11) 90000-0000
            </p>
          </div>
        </header>

        {/* Content Tabs mock (Guarulhos Aberta specifics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sobre nós</h2>
            <p className="text-gray-600 leading-relaxed">
              *Nota explicativa:* Sistema estruturado no padrão definido de escala nacional. 
              Cidade acessada: {cityName}.
              Esta página atende às diretrizes do diretório (fundo marfim, azul-petróleo, laranja-tangerina).
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Horário</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between"><span>Segunda - Sexta</span> <span className="font-medium">08:00 - 18:00</span></li>
              <li className="flex justify-between"><span>Sábado</span> <span className="font-medium">08:00 - 12:00</span></li>
              <li className="flex justify-between text-red-500"><span>Domingo</span> <span>Fechado</span></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
