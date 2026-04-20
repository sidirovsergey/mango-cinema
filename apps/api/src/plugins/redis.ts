import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

const _redisPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const client = new Redis(app.config.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
  });
  client.on('error', (err: Error) => {
    app.log.error({ err }, 'redis client error');
  });
  app.decorate('redis', client);
  app.addHook('onClose', async () => {
    await client.quit();
  });
};

export const redisPlugin = fp(_redisPlugin, { name: 'redis' });
