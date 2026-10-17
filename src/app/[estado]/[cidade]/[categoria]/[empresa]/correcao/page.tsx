import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, formatCidadeNome } from '@/lib/ibge';
import { findCompany } from '@/lib/catalog';
import { CorrecaoForm } from './CorrecaoForm';

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
  const { estado, cidade, categoria, empresa } = await params;
  const city = await getCityBySlug(estado, cidade);
  const company = city ? findCompany(String(city.id), categoria, empresa) : undefined;

  if (!city || !company) {
    return { title: 'Empresa não encontrada' };
  }

  const cityName = formatCidadeNome(cidade, city);
  return {
    title: `Reivindicar ou corrigir ${company.name} — ${cityName}`,
    description: `Sugerir correção de dados ou reivindicar a página de ${company.name} em ${cityName}, ${estado.toUpperCase()}. As alterações passam por verificação antes de publicação.`,
  };
}

export default async function CorrecaoPage({ params }: Props) {
  const { estado, cidade, categoria, empresa } = await params;

  const city = await getCityBySlug(estado, cidade);
  // A cidade precisa existir no catálogo IBGE antes de procurar a empresa.
  if (!city) notFound();

  // A empresa precisa existir no catálogo. Sem isso, `/sp/guarulhos/x/y/correcao`
  // renderizaria um formulário de reivindicação para uma empresa inexistente.
  const company = findCompany(String(city.id), categoria, empresa);
  if (!company) notFound();

  const cityName = formatCidadeNome(cidade, city);
  const catName = company.category_label;
  const baseUrl = `/${estado}/${cidade}/${categoria}/${empresa}`;

  return (
    <main className="min-h-screen bg-[#FFFFF0] p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex space-x-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline text-[#005f73]">
            Início
          </Link>
          <span>/</span>
          <span className="uppercase text-[#005f73]">{estado}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{cityName}</span>
          <span>/</span>
          <span className="capitalize text-[#005f73]">{catName}</span>
          <span>/</span>
          <Link href={baseUrl} className="capitalize hover:underline text-[#005f73]">
            {company.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Correção</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#005f73] mb-2">Atualizar Informações</h1>
          <p className="text-gray-600">
            Você está sugerindo uma atualização ou reivindicando a página de{' '}
            <strong className="capitalize text-gray-900">{company.name}</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            As sugestões passam por verificação antes de alterarem o cadastro. Os dados atuais vêm
            do OpenStreetMap sob licença ODbL 1.0.
          </p>
        </header>

        <CorrecaoForm
          baseUrl={baseUrl}
          company={{
            id: String(company.id),
            name: company.name,
            municipalityId: String(city.id),
            municipalityName: cityName,
          }}
        />
      </div>
    </main>
  );
}
