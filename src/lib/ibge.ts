import { cache } from 'react';
// municipalities.json é gerado por scripts/fetch-ibge-municipalities.js
// e contém os 5.571 municípios brasileiros (fonte: IBGE API pública).
// Para atualizar o catálogo: node scripts/fetch-ibge-municipalities.js
import municipalitiesData from './data/municipalities.json';

export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;        // slug-friendly (lowercase, sem acento) para uso em rotas
  nomeExibicao: string; // nome formatado para exibição ao usuário
  estado_id: number;
}

/** Interface interna do JSON gerado pelo script IBGE. */
interface RawMunicipality {
  id: number;
  nome: string;
  nomeExibicao: string;
  estado_id: number;
  estado_sigla: string;
}

interface MunicipalitiesFile {
  _meta: { fonte: string; data_carga: string; total: number; licenca: string };
  municipios: RawMunicipality[];
}

/**
 * Lista de estados brasileiros com IDs IBGE oficiais.
 * Fonte: https://servicodados.ibge.gov.br/api/v1/localidades/estados
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
 * Catálogo completo de municípios brasileiros carregado do JSON gerado
 * em build-time. Suporta as ~5.571 cidades sem reescrita estrutural.
 */
const allCities: City[] = (municipalitiesData as MunicipalitiesFile).municipios.map(
  (m: RawMunicipality): City => ({
    id:           m.id,
    nome:         m.nome,
    nomeExibicao: m.nomeExibicao,
    estado_id:    m.estado_id,
  }),
);

/** Retorna todos os estados brasileiros. */
export const getStates = cache(async (): Promise<State[]> => {
  return states;
});

/** Retorna todas as cidades de um estado pela sigla UF (case-insensitive). */
export const getCitiesByState = cache(async (estadoSigla: string): Promise<City[]> => {
  const state = states.find((s) => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return [];
  return allCities.filter((c) => c.estado_id === state.id);
});

/**
 * Valida se o par (UF, slug-cidade) é uma localidade cadastrada no catálogo IBGE.
 * Usado nas rotas dinâmicas para retornar notFound() quando inválido.
 */
export const validateLocation = cache(
  async (estadoSigla: string, cidadeSlug: string): Promise<boolean> => {
    const state = states.find((s) => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
    if (!state) return false;
    return allCities.some(
      (c) => c.estado_id === state.id && c.nome.toLowerCase() === cidadeSlug.toLowerCase(),
    );
  },
);

/**
 * Retorna a cidade pelo par (UF, slug).
 * Retorna undefined se não encontrada.
 */
export const getCityBySlug = cache(
  async (estadoSigla: string, cidadeSlug: string): Promise<City | undefined> => {
    const state = states.find((s) => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
    if (!state) return undefined;
    return allCities.find(
      (c) => c.estado_id === state.id && c.nome.toLowerCase() === cidadeSlug.toLowerCase(),
    );
  },
);

/**
 * Retorna o nome de exibição da cidade pelo slug.
 * Fallback: capitaliza o slug se não encontrado.
 */
export function formatCidadeNome(slug: string, cidade?: City): string {
  if (cidade?.nomeExibicao) return cidade.nomeExibicao;
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Retorna metadados do catálogo (fonte, data de carga, total de municípios).
 * Útil para exibição de proveniência e conformidade.
 */
export function getCatalogMeta() {
  return (municipalitiesData as MunicipalitiesFile)._meta;
}
