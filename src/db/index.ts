import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Cliente do banco (Neon serverless / Postgres via HTTP).
 *
 * A conexão é **preguiçosa**: o cliente do Neon só é criado na primeira
 * chamada a `getDb()`. Antes, `neon(process.env.DATABASE_URL!)` rodava no
 * import do módulo, com asserção não-nula — qualquer rota que importasse `db`
 * derrubaria em tempo de execução quando `DATABASE_URL` não estivesse definida
 * (por exemplo em `next build`, em testes ou em preview sem a variável).
 *
 * Além disso, `getDb()` lança um erro explícito informando qual variável
 * falta, em vez de propagar uma falha de conexão obscura do driver.
 */

export type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | null = null;

/** Indica se as credenciais do banco estão disponíveis no ambiente. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Retorna o cliente Drizzle, criando-o na primeira chamada.
 * Lança se `DATABASE_URL` não estiver configurada.
 */
export function getDb(): Database {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL não configurada. Defina a variável de ambiente para habilitar o acesso ao banco.',
    );
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}

/**
 * Igual a `getDb()`, mas devolve `null` em vez de lançar.
 * Útil em rotas que degradam para o catálogo estático quando o banco não existe.
 */
export function tryGetDb(): Database | null {
  if (!isDatabaseConfigured()) return null;
  try {
    return getDb();
  } catch {
    return null;
  }
}
