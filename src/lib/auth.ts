/**
 * Camada de autenticação — Guarulhos Aberta
 *
 * Responsabilidades:
 *   - Hash e verificação de senha via bcryptjs (custo 12)
 *   - Gestão de sessão via iron-session (cookie httpOnly, SameSite=Lax)
 *   - Registro e login com validação de formato
 *
 * Dependências propositalmente mínimas: bcryptjs (pure-JS, sem binding nativo)
 * e iron-session (cookie cifrado, sem JWT externo).
 *
 * Nunca retorna o hash para o cliente. Nunca loga senhas em claro.
 */

import bcrypt from 'bcryptjs';
import { getIronSession, type IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getDb, isDatabaseConfigured } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── Configuração da sessão ────────────────────────────────────────────────

const SESSION_COOKIE = 'ga_session';

/**
 * Chave mínima de 32 caracteres exigida pelo iron-session.
 * Deve ser gerada com `openssl rand -base64 32` e armazenada em:
 *   Vercel  → Environment Variable SESSION_SECRET
 *   local   → .env.local (jamais no Git)
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET não configurado ou muito curto (mínimo 32 caracteres). ' +
        'Gere com: openssl rand -base64 32',
    );
  }
  return secret;
}

export interface SessionData {
  userId: string;
  email: string;
  name?: string;
}

/** Retorna a sessão do cookie httpOnly (server-side only). */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    cookieName: SESSION_COOKIE,
    password: getSessionSecret(),
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    },
  });
}

// ─── Hashing ───────────────────────────────────────────────────────────────

const BCRYPT_COST = 12;

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, BCRYPT_COST);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

// ─── Validação de entrada ──────────────────────────────────────────────────

const emailSchema = z.string().email();

export interface AuthInput {
  email: string;
  senha: string;
  nome?: string;
}

export type AuthErro =
  | 'email_invalido'
  | 'senha_curta'
  | 'email_ja_cadastrado'
  | 'credenciais_invalidas'
  | 'banco_indisponivel'
  | 'sessao_indisponivel';

export type AuthResultado =
  | { ok: true; userId: string; email: string; name?: string }
  | { ok: false; erro: AuthErro; mensagem: string };

function validarEntrada(input: AuthInput): { ok: true } | { ok: false; erro: AuthErro; mensagem: string } {
  const emailResult = emailSchema.safeParse(input.email?.trim());
  if (!emailResult.success) {
    return { ok: false, erro: 'email_invalido', mensagem: 'E-mail inválido.' };
  }
  if (!input.senha || input.senha.length < 8) {
    return { ok: false, erro: 'senha_curta', mensagem: 'Senha deve ter pelo menos 8 caracteres.' };
  }
  return { ok: true };
}

// ─── Registro ─────────────────────────────────────────────────────────────

export async function registrarUsuario(input: AuthInput): Promise<AuthResultado> {
  const validacao = validarEntrada(input);
  if (!validacao.ok) return validacao;

  if (!isDatabaseConfigured()) {
    return { ok: false, erro: 'banco_indisponivel', mensagem: 'Banco de dados não configurado.' };
  }

  const db = getDb();
  const email = input.email.trim().toLowerCase();

  // Verificar duplicata
  const existente = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existente.length > 0) {
    return { ok: false, erro: 'email_ja_cadastrado', mensagem: 'E-mail já cadastrado.' };
  }

  const passwordHash = await hashSenha(input.senha);
  const id = crypto.randomUUID();

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name: input.nome?.trim() || null,
  });

  return { ok: true, userId: id, email, name: input.nome?.trim() };
}

// ─── Login ────────────────────────────────────────────────────────────────

export async function loginUsuario(input: AuthInput): Promise<AuthResultado> {
  const validacao = validarEntrada(input);
  if (!validacao.ok) return validacao;

  if (!isDatabaseConfigured()) {
    return { ok: false, erro: 'banco_indisponivel', mensagem: 'Banco de dados não configurado.' };
  }

  const db = getDb();
  const email = input.email.trim().toLowerCase();

  const [usuario] = await db
    .select({ id: users.id, email: users.email, name: users.name, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Tempo constante: sempre roda bcrypt mesmo quando usuário não existe
  const hashParaComparar = usuario?.passwordHash ?? '$2b$12$invalidhashjustfortimingggggggggggggggggg';
  const senhaCorreta = await bcrypt.compare(input.senha, hashParaComparar);

  if (!usuario || !senhaCorreta) {
    return { ok: false, erro: 'credenciais_invalidas', mensagem: 'E-mail ou senha inválidos.' };
  }

  return { ok: true, userId: usuario.id, email: usuario.email, name: usuario.name ?? undefined };
}

// ─── Logout ────────────────────────────────────────────────────────────────

export async function logoutUsuario(): Promise<void> {
  try {
    const session = await getSession();
    session.destroy();
    await session.save();
  } catch {
    // Silencioso — sessão pode já estar ausente
  }
}
