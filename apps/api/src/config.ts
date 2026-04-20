import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Config {
  return configSchema.parse(env);
}
