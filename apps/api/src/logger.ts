import { pino, stdTimeFunctions } from 'pino';
import type { FastifyBaseLogger } from 'fastify';
import type { Config } from './config.js';

export function createLogger(cfg: Config): FastifyBaseLogger {
  return pino({
    level: cfg.LOG_LEVEL,
    base: { env: cfg.NODE_ENV },
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: stdTimeFunctions.isoTime,
  }) as FastifyBaseLogger;
}
