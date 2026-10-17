'use server';

import { submitClaim, CORRECAO_TIPOS, type CorrecaoTipo } from '@/lib/claim';

export type ActionState = {
  success: boolean;
  message: string | null;
  error: string | null;
  /** Identificador da claim persistida, disponível apenas em caso de sucesso. */
  claimId?: string;
  /**
   * Valores enviados, devolvidos em caso de falha.
   *
   * O React reseta os campos do formulário após uma Server Action. Sem devolver
   * o que foi digitado, uma descrição longa seria perdida justamente no cenário
   * de erro — que é o caminho comum enquanto a persistência não está
   * configurada.
   */
  values?: { tipo: string; nome: string; email: string; descricao: string };
};

const initialState: ActionState = { success: false, message: null, error: null };

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitCorrection(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tipo = readString(formData, 'tipo');
  const nome = readString(formData, 'nome');
  const email = readString(formData, 'email');
  const descricao = readString(formData, 'descricao');

  // Preservado para devolver ao formulário caso a submissão falhe.
  const values = { tipo, nome, email, descricao };

  // Identidade da empresa e do município, enviada como campo oculto pelo
  // servidor. O cliente poderia forjar esses valores, então a action apenas os
  // repassa ao validador, que revalida o IBGE contra o catálogo de localidades.
  const companyId = readString(formData, 'companyId');
  const companyName = readString(formData, 'companyName');
  const municipalityId = readString(formData, 'municipalityId');
  const municipalityName = readString(formData, 'municipalityName');

  if (!companyId || !companyName || !municipalityId || !municipalityName) {
    // Contexto ausente: a página não conseguiu montar o formulário.
    return {
      ...initialState,
      error: 'Não foi possível identificar a empresa. Recarregue a página e tente novamente.',
    };
  }

  if (!CORRECAO_TIPOS.includes(tipo as CorrecaoTipo)) {
    return { ...initialState, error: 'Selecione o tipo de solicitação.', values };
  }

  if (!nome || !email || !descricao) {
    return { ...initialState, error: 'Preencha nome, e-mail e descrição.', values };
  }

  const result = await submitClaim({
    tipo,
    nome,
    email,
    descricao,
    company: { id: companyId, name: companyName, municipalityId, municipalityName },
  });

  if (!result.ok) {
    // Fail-closed: nada foi gravado, então a UI não pode报告显示 sucesso.
    return { ...initialState, error: result.message, values };
  }

  return {
    success: true,
    error: null,
    claimId: result.claim.id,
    message:
      'Solicitação registrada. Ela entra na fila de verificação e o resultado será enviado por e-mail.',
  };
}
