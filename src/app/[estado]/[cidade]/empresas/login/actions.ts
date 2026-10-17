'use server';

import { z } from 'zod';

export type LoginState = {
  success: boolean;
  error: string | null;
};

const emailSchema = z.email();

/**
 * Login de empresa.
 *
 * Não existe autenticação implementada (Fase 3 pendente): sem hashing, sem
 * armazenamento de credenciais e sem sessão.
 *
 * A versão anterior aceitava um par de credenciais fixo no código-fonte
 * (`teste@empresa.com` / `123456`) como atalho de login válido. Como o cadastro
 * nunca gravava conta alguma, esse par era a **única** forma de entrar — uma
 * credencial de backdoor effectively pública. Removido.
 *
 * Sem backend de autenticação, a action falha explicitamente.
 */
export async function submitLoginEmpresa(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const senha = String(formData.get('senha') ?? '');

  if (!email || !senha) {
    return { success: false, error: 'Preencha o e-mail e a senha.' };
  }

  if (!emailSchema.safeParse(email).success) {
    return { success: false, error: 'Informe um e-mail válido.' };
  }

  return {
    success: false,
    error: 'O acesso por senha ainda não está disponível. Nenhuma conta foi autenticada.',
  };
}
