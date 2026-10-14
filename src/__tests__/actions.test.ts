import { submitCadastroEmpresa } from '../app/[estado]/[cidade]/empresas/cadastro/actions';
import { submitCorrection } from '../app/[estado]/[cidade]/[categoria]/[empresa]/correcao/actions';

describe('Server Actions Validation and Execution', () => {
  describe('submitCadastroEmpresa', () => {
    it('retorna erro se campos obrigatórios estiverem faltando', async () => {
      const formData = new FormData();
      formData.set('cnpj', '');
      formData.set('email', '');
      formData.set('senha', '');

      const result = await submitCadastroEmpresa({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('obrigatórios');
    });

    it('retorna erro se a senha tiver menos de 6 caracteres', async () => {
      const formData = new FormData();
      formData.set('cnpj', '12345678000199');
      formData.set('email', 'teste@empresa.com');
      formData.set('senha', '12345');
      formData.set('termos', 'on');

      const result = await submitCadastroEmpresa({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('6 caracteres');
    });

    it('retorna erro se os termos não forem aceitos', async () => {
      const formData = new FormData();
      formData.set('cnpj', '12345678000199');
      formData.set('email', 'teste@empresa.com');
      formData.set('senha', 'senhaSegura123');
      // termos not set

      const result = await submitCadastroEmpresa({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('termos');
    });

    it('cadastra com sucesso quando todos os dados são válidos', async () => {
      const formData = new FormData();
      formData.set('cnpj', '12345678000199');
      formData.set('email', 'teste@empresa.com');
      formData.set('senha', 'senhaSegura123');
      formData.set('termos', 'on');

      const result = await submitCadastroEmpresa({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(true);
      expect(result.message).toContain('sucesso');
    });
  });

  describe('submitCorrection', () => {
    it('retorna erro se faltar algum campo na correção', async () => {
      const formData = new FormData();
      formData.set('nome', '');
      formData.set('email', '');
      formData.set('descricao', '');
      formData.set('tipo', '');

      const result = await submitCorrection({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('obrigatórios');
    });

    it('envia correção com sucesso quando preenchido corretamente', async () => {
      const formData = new FormData();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'correcao_dados');

      const result = await submitCorrection({ success: false, error: null, message: null }, formData);
      expect(result.success).toBe(true);
      expect(result.message).toContain('sucesso');
    });
  });
});
