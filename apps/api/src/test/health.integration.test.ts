import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { runMigrations } from '@mango/db';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
import type { Config } from '../config.js';

let pg: StartedPostgreSqlContainer;
let app: FastifyInstance;

beforeAll(async () => {
  pg = await new PostgreSqlContainer('postgres:16-alpine').start();
  await runMigrations(pg.getConnectionUri());

  const cfg: Config = {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PORT: 0,
    DATABASE_URL: pg.getConnectionUri(),
    REDIS_URL: 'redis://unused:6379',
  };
  app = await buildApp(cfg, { registerDb: true, registerRedis: false });
}, 120_000);

afterAll(async () => {
  await app?.close();
  await pg?.stop();
});

describe('GET /healthz (db only)', () => {
  it('returns 200 with db:ok when Postgres is reachable', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string; db: string };
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');
  });
});
