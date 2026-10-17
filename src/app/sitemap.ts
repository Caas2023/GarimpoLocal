import type { MetadataRoute } from 'next';
import { getStates, getCitiesByState } from '@/lib/ibge';
import { getCategorySummary } from '@/lib/catalog';

const baseUrl = 'https://guarulhosaberta.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getStates();
  const cities = (await Promise.all(states.map((state) => getCitiesByState(state.sigla)))).flat();
  const cityUrls = cities.flatMap((city) => {
    const state = states.find((item) => item.id === city.estado_id);
    if (!state) return [];
    const cityPath = `/${state.sigla.toLowerCase()}/${city.nome}`;
    const categories = getCategorySummary(String(city.id));
    return [
      { url: `${baseUrl}${cityPath}`, changeFrequency: 'daily' as const, priority: 0.8 },
      ...categories.map((category) => ({
        url: `${baseUrl}${cityPath}/${category.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ];
  });

  return [{ url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 }, ...cityUrls];
}
