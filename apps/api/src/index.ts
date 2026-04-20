import { config as dotenvConfig } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { buildApp } from './app.js';

// Load .env from repo root (two levels up from apps/api/)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, '../../..', '.env') });

async function main(): Promise<void> {
  const cfg = loadConfig();
  const app = await buildApp(cfg);

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ host: '0.0.0.0', port: cfg.PORT });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
