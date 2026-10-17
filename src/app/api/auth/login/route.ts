/**
 * POST /api/auth/login
 *
 * Body JSON: { email: string, senha: string }
 *
 * Sucesso (200): { ok: true, email, name? }
 * Falha (400/401/503): { ok: false, erro: string, mensagem: string }
 *
 * Em sucesso: cria cookie de sessão httpOnly (iron-session).
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginUsuario, getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; senha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: 'payload_invalido', mensagem: 'JSON inválido.' }, { status: 400 });
  }

  const result = await loginUsuario({ email: body.email ?? '', senha: body.senha ?? '' });

  if (!result.ok) {
    const status = result.erro === 'banco_indisponivel' ? 503 : 401;
    return NextResponse.json(result, { status });
  }

  // Salvar sessão no cookie httpOnly
  try {
    const session = await getSession();
    session.userId = result.userId;
    session.email = result.email;
    session.name = result.name;
    await session.save();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, erro: 'sessao_indisponivel', mensagem: msg },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, email: result.email, name: result.name ?? null });
}
