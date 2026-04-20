import Fastify, { type FastifyInstance } from 'fastify';
import { createLogger } from './logger.js';
import type { Config } from './config.js';
import { dbPlugin } from './plugins/db.js';
import { redisPlugin } from './plugins/redis.js';
import { healthPlugin } from './plugins/health.js';

export interface BuildAppOptions {
  registerDb?: boolean;
  registerRedis?: boolean;
}

export async function buildApp(
  config: Config,
  opts: BuildAppOptions = { registerDb: true, registerRedis: true },
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: createLogger(config),
    disableRequestLogging: config.NODE_ENV === 'test',
  });

  app.decorate('config', config);

  if (opts.registerDb) {
    await app.register(dbPlugin);
  }
  if (opts.registerRedis) {
    await app.register(redisPlugin);
  }

  await app.register(healthPlugin);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}
