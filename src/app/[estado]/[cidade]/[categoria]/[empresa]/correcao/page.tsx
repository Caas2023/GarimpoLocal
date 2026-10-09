import Link from 'next/link';
import type { Metadata } from 'next';
import { CorrecaoForm } from './CorrecaoForm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    estado: string;
    cidade: string;
    categoria: string;
    empresa: string;
  }>;
}

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estado, cidade, empresa } = await params;
  const name = empresa.replace(/-/g, ' ');
  const cityName = cidade.replace(/-/g, ' ');

  return {
    title: `Reivindicar ou Corrigir ${name} - Guarulhos Aberta`,
    description: `Formulário de correção ou reivindicação de propriedade para a empresa ${name} em ${cityName}, ${estado.toUpperCase()}.`,
  };
}

export default async function CorrecaoPage({ params }: Props) {
  const { estado, cidade, categoria, empresa } = await params;

  if (estado.length !== 2) {
    notFound();
  }

  const name = empresa.replace(/-/g, ' ');
  const cityName = cidade.replace(/-/g, ' ');
  const catName = categoria.replace(/-/g, ' ');

  const baseUrl = `/${estado}/${cidade}/${categoria}/${empresa}`;

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex space-x-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline text-[#005f73]">Início</Link>
          <span>/</span>
          <span className="uppercase text-[#005f73]">{estado}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{cityName}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{catName}</span>
          <span>/</span>
          <Link href={baseUrl} className="capitalize hover:underline text-[#005f73]">{name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Correção</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#005f73] mb-2">
            Atualizar Informações
          </h1>
          <p className="text-gray-600">
            Você está sugerindo uma atualização ou reivindicando a página para <strong className="capitalize text-gray-900">{name}</strong>.
          </p>
        </header>

        <CorrecaoForm baseUrl={baseUrl} companyName={name} />
      </div>
    </main>
  );
}