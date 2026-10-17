/**
 * Ponte tipada entre o formulário de correção (Next.js/TypeScript) e a camada
 * legada de reivindicação (CommonJS em `lib/`).
 *
 * Responsabilidades:
 *  - Traduzir os campos em português do formulário para o payload canônico do
 *    validador (`claimantName`, `claimType`, ...).
 *  - Normalizar erros em categorias acionáveis, para que a UI nunca exiba
 *    "sucesso" quando nada foi gravado.
 *
 * A validação em si (CNPJ com dígito verificador, padrão de e-mail/telefone,
 * limites de tamanho, sanitização de HTML e verificação do código IBGE)
 * vive em `lib/claim_submission.js` — esta camada não a duplica.
 */

import {
  validateAndProcessClaim,
  type ClaimType,
  type ProcessedClaim,
} from '@legacy/claim_submission';
import { persistClaim, type ClaimPersistence } from '@legacy/claim_store';

/** Opções do `<select name="tipo">` do formulário. */
export const CORRECAO_TIPOS = ['reivindicar', 'corrigir_dados', 'reportar_fechado'] as const;

export type CorrecaoTipo = (typeof CORRECAO_TIPOS)[number];

/** Mapeia a opção do formulário para o tipo canônico do validador. */
const TIPO_MAP: Record<CorrecaoTipo, ClaimType> = {
  reivindicar: 'claim',
  corrigir_dados: 'correction',
  reportar_fechado: 'removal',
};

/** Identidade da empresa, resolvida a partir do catálogo (nunca inferida do slug). */
export interface ClaimCompanyRef {
  id: string;
  name: string;
  municipalityId: string;
  municipalityName: string;
}

/** Resultado discriminado: ou a claim foi persistida, ou há um erro acionável. */
export type ClaimResult =
  | { ok: true; claim: ProcessedClaim; persistence: ClaimPersistence }
  | { ok: false; kind: 'validation' | 'persistence' | 'unexpected'; message: string };

function isCorrecaoTipo(value: string): value is CorrecaoTipo {
  return (CORRECAO_TIPOS as readonly string[]).includes(value);
}

/** Erros de persistência que significam "infra fora do ar", não "dado inválido". */
function isPersistenceError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const code = (err as { code?: unknown }).code;
  return code === 'PERSISTENCE_NOT_CONFIGURED' || code === 'PERSISTENCE_WRITE_FAILED';
}

/**
 * Valida e persiste uma solicitação de correção/reivindicação.
 *
 * Nunca resolve com sucesso se a persistência falhar: nesse caso retorna
 * `{ ok: false }` com instrução ao usuário, em vez de exibir sucesso falso.
 */
export async function submitClaim(input: {
  tipo: string;
  nome: string;
  email: string;
  descricao: string;
  company: ClaimCompanyRef;
}): Promise<ClaimResult> {
  if (!isCorrecaoTipo(input.tipo)) {
    return { ok: false, kind: 'validation', message: 'Selecione um tipo de solicitação válido.' };
  }

  let claim: ProcessedClaim;
  try {
    claim = validateAndProcessClaim({
      companyId: input.company.id,
      companyName: input.company.name,
      municipalityId: input.company.municipalityId,
      claimType: TIPO_MAP[input.tipo],
      claimantName: input.nome,
      claimantEmail: input.email,
      details: input.descricao,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Dados inválidos.';
    return { ok: false, kind: 'validation', message };
  }

  try {
    const persistence = await persistClaim(claim);
    return { ok: true, claim, persistence };
  } catch (err) {
    if (isPersistenceError(err)) {
      return {
        ok: false,
        kind: 'persistence',
        message:
          'O serviço de recebimento está temporariamente indisponível. Sua solicitação NÃO foi gravada — tente novamente mais tarde.',
      };
    }
    return {
      ok: false,
      kind: 'unexpected',
      message: 'Não foi possível registrar sua solicitação. Tente novamente mais tarde.',
    };
  }
}
