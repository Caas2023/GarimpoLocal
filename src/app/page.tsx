import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center flex-start bg-[#FFFFF0] text-gray-800 font-sans">
      <header className="w-full max-w-4xl pt-12 pb-6 border-b border-gray-200 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: '#005f73' }}>
          Guarulhos Aberta
        </h1>
        <p className="text-lg text-gray-500">
          O portal empresarial de Guarulhos e modelo para qualquer cidade do Brasil.
        </p>
      </header>

      <section className="w-full max-w-4xl py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#EE9B00' }}>
            Explore a cidade-piloto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/sp/guarulhos/alimentacao/pizzaria-sabor-paulista"
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg" style={{ color: '#005f73' }}>
                Pizzaria Sabor Paulista
              </h3>
              <p className="text-sm text-gray-500">São Paulo &gt; Guarulhos &gt; Alimentação</p>
            </Link>
            <Link
              href="/sp/guarulhos/veiculos/oficina-centro"
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg" style={{ color: '#005f73' }}>
                Oficina Centro
              </h3>
              <p className="text-sm text-gray-500">São Paulo &gt; Guarulhos &gt; Veículos</p>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#EE9B00' }}>
            Prova de Escala Nacional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/rj/sao-goncalo/beleza/salao-das-flores"
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg" style={{ color: '#005f73' }}>
                Salão das Flores
              </h3>
              <p className="text-sm text-gray-500">Rio de Janeiro &gt; São Gonçalo &gt; Beleza</p>
            </Link>
            <Link
              href="/sc/florianopolis/tecnologia/tech-solutions"
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg" style={{ color: '#005f73' }}>
                Tech Solutions
              </h3>
              <p className="text-sm text-gray-500">
                Santa Catarina &gt; Florianópolis &gt; Tecnologia
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
