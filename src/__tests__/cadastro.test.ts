import { validarCadastro, onlyDigits, MIN_SENHA } from '@/lib/cadastro';

/** CNPJ válido de exemplo: 11.222.333/0001-81 */
const CNPJ_VALIDO = '11.222.333/0001-81';

describe('lib/cadastro', () => {
  describe('onlyDigits', () => {
    it('remove tudo que não for dígito', () => {
      expect(onlyDigits('11.222.333/0001-81')).toBe('11222333000181');
    });

    it('devolve string vazia para entrada sem dígitos', () => {
      expect(onlyDigits('abc')).toBe('');
    });
  });

  describe('validarCadastro', () => {
    const base = {
      cnpj: CNPJ_VALIDO,
      email: 'contato@empresa.com.br',
      senha: 'senha123',
      termos: true,
    };

    it('aceita entrada completamente válida', () => {
      const r = validarCadastro(base);
      expect(r.ok).toBe(true);
      if (!r.ok) throw new Error('esperava sucesso');
      expect(r.cnpj).toBe('11222333000181');
      expect(r.email).toBe('contato@empresa.com.br');
    });

    it('normaliza o e-mail para minúsculas', () => {
      const r = validarCadastro({ ...base, email: 'CONTATO@Empresa.COM.BR' });
      expect(r.ok).toBe(true);
      if (!r.ok) throw new Error('esperava sucesso');
      expect(r.email).toBe('contato@empresa.com.br');
    });

    it('rejeita CNPJ ausente', () => {
      const r = validarCadastro({ ...base, cnpj: '' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('cnpj_ausente');
    });

    it('rejeita CNPJ com formato errado', () => {
      const r = validarCadastro({ ...base, cnpj: '123' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('cnpj_invalido');
      expect(r.mensagem).toContain('00.000.000/0000-00');
    });

    it('rejeita CNPJ com dígitos verificadores incorretos', () => {
      const r = validarCadastro({ ...base, cnpj: '11.222.333/0001-99' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('cnpj_invalido');
      expect(r.mensagem).toContain('dígitos verificadores');
    });

    it('rejeita sequência repetida de dígitos no CNPJ', () => {
      const r = validarCadastro({ ...base, cnpj: '11111111111111' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('cnpj_invalido');
    });

    it('rejeita e-mail ausente', () => {
      const r = validarCadastro({ ...base, email: '' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('email_ausente');
    });

    it('rejeita e-mail malformado', () => {
      const r = validarCadastro({ ...base, email: 'nao-e-email' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('email_invalido');
    });

    it('rejeita senha ausente', () => {
      const r = validarCadastro({ ...base, senha: '' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('senha_ausente');
    });

    it('rejeita senha abaixo do mínimo', () => {
      const r = validarCadastro({ ...base, senha: 'ab1' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('senha_curta');
      expect(r.mensagem).toContain(String(MIN_SENHA));
    });

    it('rejeita senha só com letras', () => {
      const r = validarCadastro({ ...base, senha: 'senhasemnumero' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('senha_fraca');
    });

    it('rejeita senha só com números', () => {
      const r = validarCadastro({ ...base, senha: '12345678' });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('senha_fraca');
    });

    it('exige aceite dos termos', () => {
      const r = validarCadastro({ ...base, termos: false });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('termos');
    });

    it('valida o CNPJ antes de e-mail e senha', () => {
      // Entrada ruim em tudo: o primeiro erro reportado é o de CNPJ.
      const r = validarCadastro({ cnpj: 'x', email: 'y', senha: 'z', termos: false });
      expect(r.ok).toBe(false);
      if (r.ok) throw new Error('esperava falha');
      expect(r.erro).toBe('cnpj_invalido');
    });
  });
});
