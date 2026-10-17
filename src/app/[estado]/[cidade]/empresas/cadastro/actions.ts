'use server';

import { validarCadastro } from '@/lib/cadastro';

export type CadastroState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

/**
 * Cadastro de empresa.
 *
 * A Fase 3 (conta do usuário) ainda **não está implementada**: não há hashing
 * de senha, nem armazenamento de credenciais, nem sessão. Publicar um
 * "sucesso" aqui criaria contas que não existem e prometeria verificação por
 * e-mail que nunca é enviada — o mesmo defeito que existia na rota de correção.
 *
 * Até a Fase 3 existir, a action valida a entrada com rigor e depois falha de
 * forma explícita, dizendo ao usuário que nada foi criado.
 */
export async function submitCadastroEmpresa(
  _prevState: CadastroState,
  formData: FormData,
): Promise<CadastroState> {
  const validacao = validarCadastro({
    cnpj: String(formData.get('cnpj') ?? ''),
    email: String(formData.get('email') ?? ''),
    senha: String(formData.get('senha') ?? ''),
    termos: formData.get('termos') !== null,
  });

  if (!validacao.ok) {
    return { success: false, error: validacao.mensagem, message: null };
  }

  // Entrada válida, mas não há onde persistir a conta ainda.
  return {
    success: false,
    error:
      'O cadastro de contas ainda não está disponível. Nenhuma conta foi criada — use o formulário de sugestão de correção enquanto isso.',
    message: null,
  };
}
