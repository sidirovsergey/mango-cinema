import { describe, it, expect } from 'vitest';
import { buildApp } from './app.js';
import type { Config } from './config.js';

const testConfig: Config = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  PORT: 0,
  DATABASE_URL: 'postgres://u:p@h:5432/d',
  REDIS_URL: 'redis://h:6379',
};

describe('buildApp', () => {
  it('returns a Fastify instance that can be closed', async () => {
    const app = await buildApp(testConfig, { registerDb: false, registerRedis: false });
    expect(typeof app.listen).toBe('function');
    expect(typeof app.close).toBe('function');
    await app.close();
  });

  it('responds 404 for unknown routes', async () => {
    const app = await buildApp(testConfig, { registerDb: false, registerRedis: false });
    try {
      const res = await app.inject({ method: 'GET', url: '/does-not-exist' });
      expect(res.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });
});
