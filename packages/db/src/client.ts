import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export interface CreateDbClientOptions {
  url: string;
  max?: number;
}

export function createDbClient(opts: CreateDbClientOptions): {
  db: DbClient;
  sql: ReturnType<typeof postgres>;
} {
  const sql = postgres(opts.url, { max: opts.max ?? 10 });
  const db = drizzle(sql, { schema });
  return { db, sql };
}
