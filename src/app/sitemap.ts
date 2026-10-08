import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://guarulhosaberta.com.br';

  // Nota: Em escala nacional (5.570 cidades, centenas de milhares de empresas), 
  // será necessário usar "generateSitemaps" (função do Next.js 13+) 
  // para dividir o sitemap (por exemplo, um sitemap de estados, cidades, e chuncks de 50.000 URLs).
  // Abaixo está a base estática do piloto de Guarulhos:

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sp/guarulhos`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    // Exemplo de uma categoria em destaque para o piloto
    {
      url: `${baseUrl}/sp/guarulhos/restaurantes`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    }
  ];
}
