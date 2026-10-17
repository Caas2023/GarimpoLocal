/**
 * Testes unitários — src/lib/auth.ts
 *
 * Monta DB e bcryptjs como mocks para testar a lógica de validação,
 * hashing e controle de acesso sem exigir banco real ou cookies.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ─── Mock: next/headers (iron-session depende dele) ──────────────────────
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue(new Map() as never),
}));

// ─── Mock: iron-session ──────────────────────────────────────────────────
const mockSession = { userId: '', email: '', name: '', save: jest.fn(), destroy: jest.fn() };
jest.mock('iron-session', () => ({
  getIronSession: jest.fn().mockResolvedValue(mockSession as never),
}));

// ─── Mock: @/db ──────────────────────────────────────────────────────────
let mockIsDatabaseConfigured = true;
const mockSelectChain = {
  from: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
};
const mockInsert = { values: jest.fn().mockResolvedValue(undefined as never) };
const mockDb = {
  select: jest.fn(() => mockSelectChain),
  insert: jest.fn(() => mockInsert),
};

jest.mock('@/db', () => ({
  isDatabaseConfigured: jest.fn(() => mockIsDatabaseConfigured),
  getDb: jest.fn(() => mockDb),
}));

// ─── Mock: @/db/schema ───────────────────────────────────────────────────
jest.mock('@/db/schema', () => ({
  users: { id: 'id', email: 'email', name: 'name', passwordHash: 'password_hash' },
}));

// ─── Mock: drizzle-orm (eq) ──────────────────────────────────────────────
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col: unknown, val: unknown) => ({ col, val })),
}));

// ─── Importar depois dos mocks ────────────────────────────────────────────
import { hashSenha, verificarSenha, registrarUsuario, loginUsuario } from '@/lib/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────
function configureSelectResult(rows: unknown[]) {
  mockSelectChain.limit.mockResolvedValue(rows as never);
  mockSelectChain.where.mockReturnValue(mockSelectChain);
  mockSelectChain.from.mockReturnValue(mockSelectChain);
}

// ─── Testes ───────────────────────────────────────────────────────────────

describe('hashSenha / verificarSenha', () => {
  it('hash é diferente da senha em claro', async () => {
    const hash = await hashSenha('minha-senha-secreta');
    expect(hash).not.toBe('minha-senha-secreta');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('verificarSenha retorna true para senha correta', async () => {
    const hash = await hashSenha('senha-certa');
    expect(await verificarSenha('senha-certa', hash)).toBe(true);
  });

  it('verificarSenha retorna false para senha errada', async () => {
    const hash = await hashSenha('senha-certa');
    expect(await verificarSenha('senha-errada', hash)).toBe(false);
  });
});

describe('registrarUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDatabaseConfigured = true;
    mockSelectChain.limit = jest.fn();
    mockSelectChain.where = jest.fn().mockReturnValue(mockSelectChain);
    mockSelectChain.from = jest.fn().mockReturnValue(mockSelectChain);
    mockDb.select.mockReturnValue(mockSelectChain);
    mockDb.insert.mockReturnValue(mockInsert);
    mockInsert.values = jest.fn().mockResolvedValue(undefined as never);
  });

  it('rejeita e-mail inválido', async () => {
    const result = await registrarUsuario({ email: 'nao-é-email', senha: 'senha-valida-123' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('email_invalido');
  });

  it('rejeita senha curta', async () => {
    const result = await registrarUsuario({ email: 'a@b.com', senha: '123' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('senha_curta');
  });

  it('retorna banco_indisponivel quando DB não configurado', async () => {
    mockIsDatabaseConfigured = false;
    const result = await registrarUsuario({ email: 'a@b.com', senha: 'senha-valida-ok' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('banco_indisponivel');
  });

  it('rejeita e-mail duplicado', async () => {
    configureSelectResult([{ id: 'existing-id' }]);
    const result = await registrarUsuario({ email: 'dup@b.com', senha: 'senha-valida-ok' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('email_ja_cadastrado');
  });

  it('registra com sucesso e retorna ok=true', async () => {
    configureSelectResult([]); // sem duplicata
    const result = await registrarUsuario({ email: 'novo@b.com', senha: 'senha-valida-ok', nome: 'Carlos' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.email).toBe('novo@b.com');
      expect(result.name).toBe('Carlos');
      expect(result.userId).toBeTruthy();
    }
    expect(mockInsert.values).toHaveBeenCalledTimes(1);
    const insertArg = mockInsert.values.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.passwordHash).toBeDefined();
    // Nunca armazena a senha em claro
    expect(insertArg.passwordHash).not.toBe('senha-valida-ok');
  });
});

describe('loginUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDatabaseConfigured = true;
    mockSelectChain.limit = jest.fn();
    mockSelectChain.where = jest.fn().mockReturnValue(mockSelectChain);
    mockSelectChain.from = jest.fn().mockReturnValue(mockSelectChain);
    mockDb.select.mockReturnValue(mockSelectChain);
  });

  it('rejeita e-mail inválido', async () => {
    const result = await loginUsuario({ email: 'invalido', senha: 'qualquer-senha-ok' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('email_invalido');
  });

  it('rejeita senha curta', async () => {
    const result = await loginUsuario({ email: 'a@b.com', senha: 'abc' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('senha_curta');
  });

  it('retorna banco_indisponivel quando DB não configurado', async () => {
    mockIsDatabaseConfigured = false;
    const result = await loginUsuario({ email: 'a@b.com', senha: 'senha-valida-ok' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('banco_indisponivel');
  });

  it('retorna credenciais_invalidas quando usuário não existe', async () => {
    configureSelectResult([]);
    const result = await loginUsuario({ email: 'nao@existe.com', senha: 'qualquer-senha' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('credenciais_invalidas');
  });

  it('retorna credenciais_invalidas quando senha está errada', async () => {
    const hash = await hashSenha('senha-correta-ok');
    configureSelectResult([{ id: 'u1', email: 'u@b.com', name: 'User', passwordHash: hash }]);
    const result = await loginUsuario({ email: 'u@b.com', senha: 'senha-errada-xx' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.erro).toBe('credenciais_invalidas');
  });

  it('retorna ok=true com credenciais válidas', async () => {
    const hash = await hashSenha('senha-correta-ok');
    configureSelectResult([{ id: 'u1', email: 'u@b.com', name: 'User', passwordHash: hash }]);
    const result = await loginUsuario({ email: 'u@b.com', senha: 'senha-correta-ok' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.email).toBe('u@b.com');
      expect(result.userId).toBe('u1');
    }
  });

  it('normaliza e-mail para lowercase antes de consultar', async () => {
    const hash = await hashSenha('senha-ok-maiusculo');
    configureSelectResult([{ id: 'u2', email: 'u@b.com', name: null, passwordHash: hash }]);
    const result = await loginUsuario({ email: 'U@B.COM', senha: 'senha-ok-maiusculo' });
    expect(result.ok).toBe(true);
  });
});
