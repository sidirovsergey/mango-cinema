import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { runMigrations } from '@mango/db';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
import type { Config } from '../config.js';

let pg: StartedPostgreSqlContainer;
let redis: StartedTestContainer;
let app: FastifyInstance;

beforeAll(async () => {
  pg = await new PostgreSqlContainer('postgres:16-alpine').start();
  redis = await new GenericContainer('redis:7-alpine').withExposedPorts(6379).start();
  await runMigrations(pg.getConnectionUri());

  const cfg: Config = {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PORT: 0,
    DATABASE_URL: pg.getConnectionUri(),
    REDIS_URL: `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`,
  };
  app = await buildApp(cfg, { registerDb: true, registerRedis: true });
}, 180_000);

afterAll(async () => {
  await app?.close();
  await pg?.stop();
  await redis?.stop();
});

describe('GET /healthz', () => {
  it('returns 200 with db:ok and redis:ok when both are reachable', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string; db: string; redis: string };
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');
    expect(body.redis).toBe('ok');
  });
});
