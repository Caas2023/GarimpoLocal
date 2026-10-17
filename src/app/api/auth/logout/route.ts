/**
 * POST /api/auth/logout
 *
 * Destrói a sessão e limpa o cookie.
 * Sempre retorna 200 — idempotente por design.
 */

import { NextResponse } from 'next/server';
import { logoutUsuario } from '@/lib/auth';

export async function POST() {
  await logoutUsuario();
  return NextResponse.json({ ok: true });
}
