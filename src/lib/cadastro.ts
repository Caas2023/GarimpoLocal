/**
 * Validação do cadastro de empresa.
 *
 * Reusa `isValidCnpj` de `lib/claim_submission.js` — fonte única da verdade
 * para o dígito verificador de CNPJ, já coberta pelos testes legados em
 * `test/claim.test.js`. Este módulo apenas adapta o formato e as mensagens.
 *
 * Limite de propósito: valida **forma**, não existência do CNPJ na Receita
 * Federal. Confirmar a situação cadastral exige consulta à Receita, que não
 * está disponível aqui — a verificação de titularidade permanece um passo
 * posterior, com confirmação por e-mail.
 */

import { z } from 'zod';
import { isValidCnpj } from '@legacy/claim_submission';

/** Mínima de entropy aceita para senha de conta. */
export const MIN_SENHA = 8;

const CNPJ_MASK = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

export interface CadastroInput {
  cnpj: string;
  email: string;
  senha: string;
  termos: boolean;
}

export type CadastroErro =
  | 'cnpj_ausente'
  | 'cnpj_invalido'
  | 'email_ausente'
  | 'email_invalido'
  | 'senha_ausente'
  | 'senha_curta'
  | 'senha_fraca'
  | 'termos';

export type CadastroValidacao =
  { ok: true; cnpj: string; email: string } | { ok: false; erro: CadastroErro; mensagem: string };

const emailSchema = z.email();

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida os dados do formulário de cadastro.
 * Nunca lança: devolve um resultado discriminado para a action formatar.
 */
export function validarCadastro(input: Partial<CadastroInput>): CadastroValidacao {
  const cnpjBruto = (input.cnpj ?? '').trim();
  if (!cnpjBruto) {
    return { ok: false, erro: 'cnpj_ausente', mensagem: 'Informe o CNPJ da empresa.' };
  }
  if (!CNPJ_MASK.test(cnpjBruto)) {
    return {
      ok: false,
      erro: 'cnpj_invalido',
      mensagem: 'CNPJ inválido. Use o formato 00.000.000/0000-00.',
    };
  }
  const cnpj = onlyDigits(cnpjBruto);
  if (!isValidCnpj(cnpj)) {
    return {
      ok: false,
      erro: 'cnpj_invalido',
      mensagem: 'CNPJ inválido: os dígitos verificadores não conferem.',
    };
  }

  const emailBruto = (input.email ?? '').trim();
  if (!emailBruto) {
    return { ok: false, erro: 'email_ausente', mensagem: 'Informe o e-mail de contato.' };
  }
  const email = emailBruto.toLowerCase();
  if (!emailSchema.safeParse(email).success) {
    return { ok: false, erro: 'email_invalido', mensagem: 'Informe um e-mail válido.' };
  }

  const senha = input.senha ?? '';
  if (!senha) {
    return { ok: false, erro: 'senha_ausente', mensagem: 'Informe uma senha.' };
  }
  if (senha.length < MIN_SENHA) {
    return {
      ok: false,
      erro: 'senha_curta',
      mensagem: `A senha deve conter no mínimo ${MIN_SENHA} caracteres.`,
    };
  }
  if (!/[a-zA-Z]/.test(senha) || !/\d/.test(senha)) {
    return {
      ok: false,
      erro: 'senha_fraca',
      mensagem: 'A senha deve combinar letras e números.',
    };
  }

  if (!input.termos) {
    return {
      ok: false,
      erro: 'termos',
      mensagem: 'Você deve aceitar os termos de uso.',
    };
  }

  return { ok: true, cnpj, email };
}
