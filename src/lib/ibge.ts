import { cache } from 'react';

export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;      // slug-friendly (lowercase, sem acento)
  nomeExibicao: string; // nome formatado para exibição
  estado_id: number;
}

/**
 * Mock de estados para desenvolvimento/piloto.
 * Em produção, substituir por requisição à API IBGE ou tabela de banco.
 * IDs IBGE oficiais: https://servicodados.ibge.gov.br/api/v1/localidades/estados
 */
const states: State[] = [
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
];

/**
 * Cidades ativas no piloto.
 * nome: slug usado na rota (lowercase, normalizado).
 * nomeExibicao: nome para o usuário.
 * ID IBGE oficial.
 */
const cities: City[] = [
  // SP
  { id: 3518800, nome: 'guarulhos',     nomeExibicao: 'Guarulhos',     estado_id: 35 },
  { id: 3550308, nome: 'sao-paulo',     nomeExibicao: 'São Paulo',     estado_id: 35 },
  { id: 3509502, nome: 'campinas',      nomeExibicao: 'Campinas',      estado_id: 35 },
  // RJ
  { id: 3304557, nome: 'rio-de-janeiro', nomeExibicao: 'Rio de Janeiro', estado_id: 33 },
  { id: 3301009, nome: 'sao-goncalo',   nomeExibicao: 'São Gonçalo',   estado_id: 33 },
  // SC
  { id: 4205407, nome: 'florianopolis', nomeExibicao: 'Florianópolis', estado_id: 42 },
  // MG
  { id: 3106200, nome: 'belo-horizonte', nomeExibicao: 'Belo Horizonte', estado_id: 31 },
  // DF
  { id: 5300108, nome: 'brasilia',      nomeExibicao: 'Brasília',      estado_id: 53 },
];

/** Retorna todos os estados cadastrados. */
export const getStates = cache(async (): Promise<State[]> => {
  return states;
});

/** Retorna cidades ativas de um estado pela sigla UF (case-insensitive). */
export const getCitiesByState = cache(async (estadoSigla: string): Promise<City[]> => {
  const state = states.find(s => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return [];
  return cities.filter(c => c.estado_id === state.id);
});

/**
 * Valida se o par (UF, slug-cidade) é uma localidade cadastrada.
 * Usado nas rotas dinâmicas para retornar notFound() quando inválido.
 */
export const validateLocation = cache(async (estadoSigla: string, cidadeSlug: string): Promise<boolean> => {
  const state = states.find(s => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return false;
  return cities.some(c => c.estado_id === state.id && c.nome.toLowerCase() === cidadeSlug.toLowerCase());
});

/**
 * Retorna a cidade pelo par (UF, slug).
 * Retorna undefined se não encontrada.
 */
export const getCityBySlug = cache(async (estadoSigla: string, cidadeSlug: string): Promise<City | undefined> => {
  const state = states.find(s => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return undefined;
  return cities.find(c => c.estado_id === state.id && c.nome.toLowerCase() === cidadeSlug.toLowerCase());
});

/**
 * Retorna o nome de exibição da cidade pelo slug.
 * Fallback: capitaliza o slug se não encontrado.
 */
export function formatCidadeNome(slug: string, cidade?: City): string {
  if (cidade?.nomeExibicao) return cidade.nomeExibicao;
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Normaliza um texto para slug de rota:
 * lowercase, remove acentos, troca espaços por hífen, remove chars inválidos.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
