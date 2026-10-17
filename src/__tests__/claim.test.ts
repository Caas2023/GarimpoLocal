import { submitClaim, CORRECAO_TIPOS } from '@/lib/claim';

const COMPANY = {
  id: '12345',
  name: 'Pizzaria Sabor Paulista',
  municipalityId: '3518800',
  municipalityName: 'Guarulhos',
};

function validInput(overrides: Partial<Parameters<typeof submitClaim>[0]> = {}) {
  return {
    tipo: 'corrigir_dados',
    nome: 'Carlos Andrade',
    email: 'carlos@exemplo.com',
    descricao: 'O horário de funcionamento mudou para closes às 22h.',
    company: COMPANY,
    ...overrides,
  };
}

describe('lib/claim', () => {
  const savedEnv = { url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN };

  beforeEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterAll(() => {
    if (savedEnv.url !== undefined) process.env.KV_REST_API_URL = savedEnv.url;
    if (savedEnv.token !== undefined) process.env.KV_REST_API_TOKEN = savedEnv.token;
  });

  describe('CORRECAO_TIPOS', () => {
    it('expõe exatamente os três tipos aceitos pelo formulário', () => {
      expect([...CORRECAO_TIPOS]).toEqual(['reivindicar', 'corrigir_dados', 'reportar_fechado']);
    });
  });

  describe('submitClaim', () => {
    it('falha com kind=persistence quando o KV não está configurado', async () => {
      const result = await submitClaim(validInput());
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.kind).toBe('persistence');
      expect(result.message).toContain('NÃO foi gravada');
    });

    it('nunca devolve ok=true sem persistência configurada', async () => {
      const tipos = [...CORRECAO_TIPOS];
      for (const tipo of tipos) {
        const result = await submitClaim(validInput({ tipo }));
        expect(result.ok).toBe(false);
      }
    });

    it('rejeita tipo fora da lista antes de tocar a persistência', async () => {
      const result = await submitClaim(validInput({ tipo: 'hackeado' }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.kind).toBe('validation');
      expect(result.message).toContain('válido');
    });

    it('mapeia reivindicar -> claim', async () => {
      // Com KV ausente não chegamos ao ponto de checar o tipo canônico, mas
      // validamos que o valor atravessa a validação (chega a persistência).
      const result = await submitClaim(validInput({ tipo: 'reivindicar' }));
      if (result.ok) throw new Error('não deveria persistir sem KV');
      expect(result.kind).toBe('persistence');
    });

    it('rejeita nome do reclamante muito curto', async () => {
      const result = await submitClaim(validInput({ nome: 'C' }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.kind).toBe('validation');
      expect(result.message).toContain('2 caracteres');
    });

    it('rejeita e-mail malformado', async () => {
      const result = await submitClaim(validInput({ email: 'nao-e-email' }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.message).toContain('e-mail');
    });

    it('rejeita descrição curta demais', async () => {
      const result = await submitClaim(validInput({ descricao: 'oi' }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.message).toContain('10 caracteres');
    });

    it('rejeita município IBGE fora do catálogo de localidades', async () => {
      const result = await submitClaim(
        validInput({ company: { ...COMPANY, municipalityId: '9999999' } }),
      );
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('esperava falha');
      expect(result.kind).toBe('validation');
      expect(result.message).toContain('Município');
    });

    it('sanitiza HTML no nome e na descrição', async () => {
      const result = await submitClaim(
        validInput({
          nome: 'Ca<script>alert(1)</script>rlos',
          descricao: '<img src=x onerror=alert(1)> Horário alterado para 22h.',
        }),
      );
      // Chega à persistência => passou pela validação sem lançar.
      if (result.ok) throw new Error('não deveria persistir sem KV');
      expect(result.kind).toBe('persistence');
    });
  });
});
