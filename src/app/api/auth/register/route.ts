/**
 * POST /api/auth/register
 *
 * Body JSON: { email: string, senha: string, nome?: string }
 *
 * Sucesso (201): { ok: true, email }
 * Falha (400/409/503): { ok: false, erro: string, mensagem: string }
 *
 * Em sucesso: cria cookie de sessão httpOnly (iron-session) — login automático.
 */

import { NextRequest, NextResponse } from 'next/server';
import { registrarUsuario, getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; senha?: string; nome?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: 'payload_invalido', mensagem: 'JSON inválido.' }, { status: 400 });
  }

  const result = await registrarUsuario({
    email: body.email ?? '',
    senha: body.senha ?? '',
    nome: body.nome,
  });

  if (!result.ok) {
    const status =
      result.erro === 'banco_indisponivel' ? 503
      : result.erro === 'email_ja_cadastrado' ? 409
      : 400;
    return NextResponse.json(result, { status });
  }

  // Login automático após registro
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

  return NextResponse.json({ ok: true, email: result.email }, { status: 201 });
}
