import { submitCadastroEmpresa } from '../app/[estado]/[cidade]/empresas/cadastro/actions';
import { submitLoginEmpresa } from '../app/[estado]/[cidade]/empresas/login/actions';
import { submitCorrection } from '../app/[estado]/[cidade]/[categoria]/[empresa]/correcao/actions';

const INITIAL = { success: false, error: null, message: null };

/** CNPJ válido de exemplo: 11.222.333/0001-81 */
const CNPJ = '11.222.333/0001-81';

function cadastroFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set('cnpj', CNPJ);
  formData.set('email', 'contato@empresa.com.br');
  formData.set('senha', 'senha123');
  formData.set('termos', 'on');
  for (const [k, v] of Object.entries(overrides)) formData.set(k, v);
  return formData;
}

/** Identidade da empresa enviada como campo oculto pela página de correção. */
function claimContext() {
  const formData = new FormData();
  formData.set('companyId', '12345');
  formData.set('companyName', 'Pizzaria Sabor Paulista');
  formData.set('municipalityId', '3518800');
  formData.set('municipalityName', 'Guarulhos');
  return formData;
}

describe('Server Actions', () => {
  describe('submitCadastroEmpresa', () => {
    it('rejeita entrada vazia com mensagem de campo obrigatório', async () => {
      const result = await submitCadastroEmpresa(
        INITIAL,
        cadastroFormData({ cnpj: '', email: '' }),
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejeita CNPJ com dígitos verificadores inválidos', async () => {
      const result = await submitCadastroEmpresa(
        INITIAL,
        cadastroFormData({ cnpj: '11.222.333/0001-99' }),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('dígitos verificadores');
    });

    it('rejeita senha com menos de 8 caracteres', async () => {
      const result = await submitCadastroEmpresa(INITIAL, cadastroFormData({ senha: 'ab1' }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('8 caracteres');
    });

    it('rejeita senha sem combinação de letras e números', async () => {
      const result = await submitCadastroEmpresa(INITIAL, cadastroFormData({ senha: '12345678' }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('letras e números');
    });

    it('exige aceite dos termos', async () => {
      const formData = cadastroFormData();
      formData.delete('termos');
      const result = await submitCadastroEmpresa(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('termos');
    });

    it('NÃO reporta sucesso: não há onde criar a conta ainda', async () => {
      const result = await submitCadastroEmpresa(INITIAL, cadastroFormData());

      // Regressão: a implementação anterior devolvia success:true sem gravar
      // nada, prometendo uma conta e um e-mail de confirmação que nunca existiram.
      expect(result.success).toBe(false);
      expect(result.message).toBeNull();
      expect(result.error).toContain('Nenhuma conta foi criada');
    });
  });

  describe('submitLoginEmpresa', () => {
    it('exige e-mail e senha', async () => {
      const formData = new FormData();
      formData.set('email', '');
      formData.set('senha', '');
      const result = await submitLoginEmpresa({ success: false, error: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Preencha');
    });

    it('recusa e-mail malformado', async () => {
      const formData = new FormData();
      formData.set('email', 'nao-e-email');
      formData.set('senha', 'qualquer');
      const result = await submitLoginEmpresa({ success: false, error: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('e-mail válido');
    });

    it('NÃO aceita a credencial fixa que existia no código-fonte', async () => {
      // Regressão de segurança: `teste@empresa.com` / `123456` era aceito como
      // login válido. Como o cadastro não criava conta alguma, esse par era a
      // única forma de entrar — uma backdoor effectively pública.
      const formData = new FormData();
      formData.set('email', 'teste@empresa.com');
      formData.set('senha', '123456');

      const result = await submitLoginEmpresa({ success: false, error: null }, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('ainda não está disponível');
    });

    it('nunca autentica sem backend de autenticação', async () => {
      const credenciais = [
        ['admin@empresa.com', 'admin123'],
        ['teste@empresa.com', '123456'],
        ['contato@empresa.com.br', 'senha123'],
      ];
      for (const [email, senha] of credenciais) {
        const formData = new FormData();
        formData.set('email', email);
        formData.set('senha', senha);
        const result = await submitLoginEmpresa({ success: false, error: null }, formData);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('submitCorrection', () => {
    let savedEnv: { url?: string; token?: string };

    beforeEach(() => {
      // Comportamento determinístico: sem KV configurado, a persistência deve
      // falhar e a action NÃO pode reportar sucesso.
      savedEnv = {
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      };
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
    });

    afterEach(() => {
      if (savedEnv.url === undefined) delete process.env.KV_REST_API_URL;
      else process.env.KV_REST_API_URL = savedEnv.url;
      if (savedEnv.token === undefined) delete process.env.KV_REST_API_TOKEN;
      else process.env.KV_REST_API_TOKEN = savedEnv.token;
    });

    it('retorna erro se faltar algum campo do formulário', async () => {
      const formData = claimContext();
      formData.set('nome', '');
      formData.set('email', '');
      formData.set('descricao', '');
      formData.set('tipo', '');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna erro se o contexto da empresa estiver ausente', async () => {
      const formData = new FormData();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('identificar a empresa');
    });

    it('retorna erro para tipo de solicitação desconhecido', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'tipo_inexistente');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('tipo');
    });

    it('NÃO reporta sucesso quando a persistência falha (fail-closed)', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);

      // Regressão: a implementação anterior descartava os dados e devolvia
      // success:true mesmo sem gravar nada em lugar nenhum.
      expect(result.success).toBe(false);
      expect(result.message).toBeNull();
      expect(result.error).toContain('NÃO foi gravada');
    });

    it('propaga erro de validação do e-mail inválido', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'email-invalido');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('e-mail');
    });

    it('propaga erro para município IBGE inexistente', async () => {
      const formData = claimContext();
      formData.set('municipalityId', '9999999');
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'Correção de horário de funcionamento.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('propaga erro quando a descrição tem menos de 10 caracteres', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'curta');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('10 caracteres');
    });
  });
  describe('preservação dos dados digitados', () => {
    let savedEnv: { url?: string; token?: string };

    beforeEach(() => {
      savedEnv = {
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      };
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
    });

    afterEach(() => {
      if (savedEnv.url === undefined) delete process.env.KV_REST_API_URL;
      else process.env.KV_REST_API_URL = savedEnv.url;
      if (savedEnv.token === undefined) delete process.env.KV_REST_API_TOKEN;
      else process.env.KV_REST_API_TOKEN = savedEnv.token;
    });

    /**
     * Regressão de UX: o React reseta os campos do formulário após a Server
     * Action. Sem devolver os valores, a descrição digitada pelo usuário era
     * perdida justamente no caminho de erro de persistência.
     */
    it('devolve os valores digitados quando a persistência falha', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'O horario mudou: agora fecha as 22h.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);

      expect(result.success).toBe(false);
      expect(result.values).toEqual({
        tipo: 'corrigir_dados',
        nome: 'Carlos Andrade',
        email: 'carlos@exemplo.com',
        descricao: 'O horario mudou: agora fecha as 22h.',
      });
    });

    it('devolve os valores também quando a validação falha', async () => {
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'email-invalido');
      formData.set('descricao', 'Texto válido com mais de dez caracteres.');
      formData.set('tipo', 'reivindicar');

      const result = await submitCorrection(INITIAL, formData);

      expect(result.success).toBe(false);
      expect(result.values?.email).toBe('email-invalido');
      expect(result.values?.descricao).toBe('Texto válido com mais de dez caracteres.');
      expect(result.values?.tipo).toBe('reivindicar');
    });

    it('não devolve valores quando a claim é persistida com sucesso', async () => {
      // Sem KV não há caminho de sucesso; o teste garante que o campo `values`
      // só aparece no caminho de erro.
      const formData = claimContext();
      formData.set('nome', 'Carlos Andrade');
      formData.set('email', 'carlos@exemplo.com');
      formData.set('descricao', 'O horario mudou: agora fecha as 22h.');
      formData.set('tipo', 'corrigir_dados');

      const result = await submitCorrection(INITIAL, formData);
      expect(result.success).toBe(false);
      expect(result.values).toBeDefined();
    });
  });
});
