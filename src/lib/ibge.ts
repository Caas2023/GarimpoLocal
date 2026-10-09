import { cache } from 'react';

export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;
  estado_id: number;
}

// Básico: Mock de estados (Expandir para requisição de API IBGE quando necessário)
const states: State[] = [
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  // Outros estados...
];

// Guarulhos IBGE ID: 3518803
const cities: City[] = [
  { id: 3518803, nome: 'guarulhos', estado_id: 35 },
];

export const getStates = cache(async (): Promise<State[]> => {
  return states;
});

export const getCitiesByState = cache(async (estadoSigla: string): Promise<City[]> => {
  const state = states.find(s => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return [];
  return cities.filter(c => c.estado_id === state.id);
});

export const validateLocation = cache(async (estadoSigla: string, cidadeNome: string): Promise<boolean> => {
  const state = states.find(s => s.sigla.toUpperCase() === estadoSigla.toUpperCase());
  if (!state) return false;
  return cities.some(c => c.estado_id === state.id && c.nome.toLowerCase() === cidadeNome.toLowerCase());
});
