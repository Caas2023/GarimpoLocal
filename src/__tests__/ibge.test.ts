/**
 * Testes unitários para src/lib/ibge.ts
 *
 * Cobrem: getStates, getCitiesByState, validateLocation, getCityBySlug,
 *         formatCidadeNome, toSlug
 *
 * O módulo usa `cache` do React (React.cache para server components).
 * No ambiente Jest/Node fazemos mock do módulo 'react' para retornar
 * a função passada diretamente (identidade), sem cache.
 */

// Mock React.cache antes de qualquer import do módulo testado
jest.mock('react', () => ({
  cache: (fn: unknown) => fn,
}));

import {
  getStates,
  getCitiesByState,
  validateLocation,
  getCityBySlug,
  formatCidadeNome,
  toSlug,
} from '../lib/ibge';

// ---------------------------------------------------------------------------
// getStates
// ---------------------------------------------------------------------------
describe('getStates', () => {
  it('retorna array não vazio com todos os 27 estados', async () => {
    const states = await getStates();
    expect(states.length).toBe(27);
  });

  it('todos os estados têm sigla de 2 letras', async () => {
    const states = await getStates();
    for (const s of states) {
      expect(s.sigla).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('todos os estados têm ID IBGE positivo', async () => {
    const states = await getStates();
    for (const s of states) {
      expect(s.id).toBeGreaterThan(0);
    }
  });

  it('contém SP e RJ', async () => {
    const states = await getStates();
    const siglas = states.map((s) => s.sigla);
    expect(siglas).toContain('SP');
    expect(siglas).toContain('RJ');
  });

  it('não contém duplicatas por sigla', async () => {
    const states = await getStates();
    const siglas = states.map((s) => s.sigla);
    const unique = new Set(siglas);
    expect(unique.size).toBe(siglas.length);
  });
});

// ---------------------------------------------------------------------------
// getCitiesByState
// ---------------------------------------------------------------------------
describe('getCitiesByState', () => {
  it('retorna cidades de SP', async () => {
    const cities = await getCitiesByState('SP');
    expect(cities.length).toBeGreaterThan(0);
  });

  it('Guarulhos está em SP com ID IBGE correto', async () => {
    const cities = await getCitiesByState('SP');
    const gru = cities.find((c) => c.nome === 'guarulhos');
    expect(gru).toBeDefined();
    expect(gru!.id).toBe(3518800);
  });

  it('busca por sigla é case-insensitive (sp, Sp, SP)', async () => {
    const lower = await getCitiesByState('sp');
    const upper = await getCitiesByState('SP');
    const mixed = await getCitiesByState('Sp');
    expect(lower.length).toBe(upper.length);
    expect(mixed.length).toBe(upper.length);
  });

  it('retorna array vazio para estado inexistente', async () => {
    const cities = await getCitiesByState('XX');
    expect(cities).toEqual([]);
  });

  it('cidades têm nomeExibicao preenchido', async () => {
    const cities = await getCitiesByState('SP');
    for (const c of cities) {
      expect(c.nomeExibicao.length).toBeGreaterThan(0);
    }
  });

  it('cidades têm nome (slug) lowercase sem espaços', async () => {
    const cities = await getCitiesByState('SP');
    for (const c of cities) {
      expect(c.nome).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

// ---------------------------------------------------------------------------
// validateLocation
// ---------------------------------------------------------------------------
describe('validateLocation', () => {
  it('valida SP/guarulhos', async () => {
    expect(await validateLocation('SP', 'guarulhos')).toBe(true);
  });

  it('valida SC/florianopolis', async () => {
    expect(await validateLocation('SC', 'florianopolis')).toBe(true);
  });

  it('valida RJ/sao-goncalo', async () => {
    expect(await validateLocation('RJ', 'sao-goncalo')).toBe(true);
  });

  it('invalida estado fictício', async () => {
    expect(await validateLocation('ZZ', 'guarulhos')).toBe(false);
  });

  it('invalida cidade inexistente em SP', async () => {
    expect(await validateLocation('SP', 'cidade-que-nao-existe')).toBe(false);
  });

  it('invalida guarulhos em estado errado (RJ)', async () => {
    expect(await validateLocation('RJ', 'guarulhos')).toBe(false);
  });

  it('validação é case-insensitive para estado', async () => {
    expect(await validateLocation('sp', 'guarulhos')).toBe(true);
  });

  it('validação é case-insensitive para cidade', async () => {
    expect(await validateLocation('SP', 'GUARULHOS')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCityBySlug
// ---------------------------------------------------------------------------
describe('getCityBySlug', () => {
  it('encontra guarulhos em SP', async () => {
    const city = await getCityBySlug('SP', 'guarulhos');
    expect(city).toBeDefined();
    expect(city!.nomeExibicao).toBe('Guarulhos');
    expect(city!.id).toBe(3518800);
  });

  it('retorna undefined para cidade inexistente', async () => {
    const city = await getCityBySlug('SP', 'nao-existe');
    expect(city).toBeUndefined();
  });

  it('retorna undefined para estado inexistente', async () => {
    const city = await getCityBySlug('ZZ', 'guarulhos');
    expect(city).toBeUndefined();
  });

  it('encontra florianopolis em SC', async () => {
    const city = await getCityBySlug('SC', 'florianopolis');
    expect(city).toBeDefined();
    expect(city!.nomeExibicao).toBe('Florianópolis');
  });
});

// ---------------------------------------------------------------------------
// formatCidadeNome
// ---------------------------------------------------------------------------
describe('formatCidadeNome', () => {
  it('usa nomeExibicao da cidade quando disponível', async () => {
    const city = await getCityBySlug('SP', 'guarulhos');
    expect(formatCidadeNome('guarulhos', city)).toBe('Guarulhos');
  });

  it('fallback capitaliza slug com hífens', () => {
    expect(formatCidadeNome('sao-paulo')).toBe('Sao Paulo');
  });

  it('fallback com slug simples', () => {
    expect(formatCidadeNome('campinas')).toBe('Campinas');
  });

  it('usa nomeExibicao mesmo com acento (florianópolis)', async () => {
    const city = await getCityBySlug('SC', 'florianopolis');
    expect(formatCidadeNome('florianopolis', city)).toBe('Florianópolis');
  });
});

// ---------------------------------------------------------------------------
// toSlug
// ---------------------------------------------------------------------------
describe('toSlug', () => {
  it('converte texto simples para lowercase com hífen', () => {
    expect(toSlug('São Paulo')).toBe('sao-paulo');
  });

  it('remove acentos', () => {
    expect(toSlug('Florianópolis')).toBe('florianopolis');
    expect(toSlug('Guarulhos')).toBe('guarulhos');
  });

  it('remove caracteres especiais', () => {
    expect(toSlug('Belo Horizonte!')).toBe('belo-horizonte');
  });

  it('colapsa múltiplos hífens', () => {
    expect(toSlug('Rio  de  Janeiro')).toBe('rio-de-janeiro');
  });

  it('remove hífens nas bordas', () => {
    expect(toSlug(' Campinas ')).toBe('campinas');
  });

  it('slug já normalizado permanece igual', () => {
    expect(toSlug('guarulhos')).toBe('guarulhos');
    expect(toSlug('sao-paulo')).toBe('sao-paulo');
  });

  it('garante slug válido para rota URL', () => {
    const slug = toSlug('Mogi das Cruzes');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});
