import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

interface HealthResponse {
  status: 'ok' | 'degraded';
  db?: 'ok' | 'fail';
  redis?: 'ok' | 'fail';
}

export const healthPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/healthz', async (_req, reply) => {
    const body: HealthResponse = { status: 'ok' };

    if ('sql' in app) {
      try {
        await app.sql`SELECT 1`;
        body.db = 'ok';
      } catch (err) {
        app.log.error({ err }, 'db healthcheck failed');
        body.db = 'fail';
        body.status = 'degraded';
      }
    }

    return reply.code(body.status === 'ok' ? 200 : 503).send(body);
  });
};
