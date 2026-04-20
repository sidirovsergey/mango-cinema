import Fastify, { type FastifyInstance } from 'fastify';
import { createLogger } from './logger.js';
import type { Config } from './config.js';

export interface BuildAppOptions {
  registerDb?: boolean;
  registerRedis?: boolean;
}

export async function buildApp(
  config: Config,
  _opts: BuildAppOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: createLogger(config),
    disableRequestLogging: config.NODE_ENV === 'test',
  });

  app.decorate('config', config);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}
