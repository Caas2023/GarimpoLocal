/**
 * Declarações para a camada legada CommonJS (`lib/`).
 *
 * Essa camada é executada diretamente pelo runtime Node/Vercel e não faz parte
 * do typecheck do Next.js (ver `exclude` em `tsconfig.json`). Estas declarações
 * permitem que módulos tipados em `src/` importem os utilitários legados via
 * alias `@legacy/*` sem perder a checagem de tipos.
 *
 * Ao migrar um módulo de `lib/` para `src/`, apague a declaração correspondente.
 */

declare module '@legacy/claim_submission' {
  /** Tipo canônico de reivindicação aceito pelo validador. */
  export type ClaimType = 'claim' | 'correction' | 'removal';

  /** Payload normalizado e validado, pronto para persistência. */
  export interface ProcessedClaim {
    id: string;
    status: 'pending_verification';
    submittedAt: string;
    locality: {
      municipalityId: string;
      municipalityName: string;
      stateCode: string;
      stateSlug: string;
      municipalitySlug: string;
    };
    company: {
      id: string;
      name: string;
      cnpj: string | null;
    };
    claimant: {
      name: string;
      email: string;
      phone: string | null;
    };
    claimType: ClaimType;
    details: string;
  }

  /**
   * Valida e normaliza uma reivindicação/correção.
   * Lança `TypeError` para payload inválido e `Error` para regra de negócio.
   */
  export function validateAndProcessClaim(payload: Record<string, unknown>): ProcessedClaim;

  /**
   * Valida um CNPJ pelos digitos verificadores.
   * Aceita com ou sem mascara (`00.000.000/0000-00` ou 14 digitos).
   */
  export function isValidCnpj(value: string): boolean;

  export const VALID_TYPES: ReadonlySet<string>;
}

declare module '@legacy/claim_store' {
  /** Resultado de uma persistência bem-sucedida. */
  export interface ClaimPersistence {
    key: string;
    provider: 'vercel-kv';
  }

  /**
   * Persiste a claim no Vercel KV.
   * Lança erro com `code` `PERSISTENCE_NOT_CONFIGURED` quando o KV não está
   * configurado — nunca resolve silenciosamente (fail-closed).
   */
  export function persistClaim(
    claim: unknown,
    env?: Record<string, string | undefined>,
    fetchImpl?: typeof fetch,
  ): Promise<ClaimPersistence>;
}
