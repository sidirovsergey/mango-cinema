# Mango Cinema — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять монорепо-скелет для Mango Cinema: pnpm-workspaces, TypeScript, Fastify API с `/healthz`, Drizzle-миграции, docker-compose с Postgres/Redis/MinIO, Vitest + testcontainers, GitHub Actions CI.

**Architecture:** pnpm-workspaces монорепо с двумя начальными пакетами — `apps/api` (Fastify 4 + pino + zod-конфиг) и `packages/db` (Drizzle ORM + postgres-js). Локальная среда через docker-compose: Postgres 16, Redis 7, MinIO. Интеграционные тесты используют testcontainers — никаких моков БД. CI: GitHub Actions запускает lint → typecheck → тесты на Ubuntu-раннере (Docker доступен для testcontainers).

**Tech Stack:** Node.js 20 LTS, pnpm 10, TypeScript 5.6 (strict), Fastify 4, pino 9, Drizzle ORM + drizzle-kit, postgres-js, ioredis 5, zod 3, Vitest 2, testcontainers 10, ESLint 9 (flat config), Prettier 3.

**Scope (что НЕ входит в Foundation):** бизнес-таблицы (users, series, episodes и т.д.), авторизация/JWT, фронтенд-приложения, деплой в Yandex Cloud, Sentry, Amplitude, ingest worker. Всё это — отдельные планы.

**Deliverable:** `make up && make migrate && make dev`, затем `curl http://localhost:3000/healthz` → `200 {"status":"ok","db":"ok","redis":"ok"}`. `make test` проходит. CI на PR — зелёный.

---

## Структура файлов после выполнения плана

```
.
├── .github/workflows/ci.yml
├── apps/
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── src/
│           ├── app.ts                 — фабрика Fastify-инстанса
│           ├── app.test.ts            — юнит-тест фабрики
│           ├── config.ts              — zod-валидация env
│           ├── config.test.ts         — юнит-тест конфига
│           ├── index.ts               — entrypoint
│           ├── logger.ts              — pino-логгер
│           └── plugins/
│               ├── db.ts              — Fastify-плагин: postgres-js + drizzle
│               ├── redis.ts           — Fastify-плагин: ioredis
│               └── health.ts          — /healthz маршрут
│           └── test/
│               └── health.integration.test.ts — testcontainers + /healthz
├── packages/
│   └── db/
│       ├── package.json
│       ├── tsconfig.json
│       ├── drizzle.config.ts
│       ├── drizzle/                   — генерируется drizzle-kit
│       │   └── 0000_init.sql
│       └── src/
│           ├── client.ts              — createDbClient(url)
│           ├── index.ts               — re-exports
│           ├── migrate.ts             — runMigrations(url)
│           └── schema/
│               └── index.ts           — смоук-таблица _mango_schema_version
├── docker-compose.yml
├── Makefile
├── .env.example
├── .editorconfig
├── .npmrc
├── .prettierrc.json
├── eslint.config.mjs
├── package.json                       — root (private, workspaces)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Принципы разбиения:** каждый пакет имеет одну ответственность и собственный `package.json`/`tsconfig.json`. API не знает про внутренности Drizzle — работает через фабрики из `@mango/db`. Плагины Fastify изолированы в `apps/api/src/plugins/`, чтобы позже их легко разбирать по модулям из спеки (Catalog, Billing, Identity).

---

### Task 1: Воркспейс-скаффолд и инструментарий

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `.npmrc`
- Create: `tsconfig.base.json`
- Create: `.editorconfig`
- Create: `.prettierrc.json`
- Create: `eslint.config.mjs`

- [ ] **Step 1: Создать `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Создать корневой `package.json`**

```json
{
  "name": "mango-cinema",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@10.32.1",
  "engines": {
    "node": ">=20.11.0 <21"
  },
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "pnpm -r run typecheck",
    "test": "pnpm -r run test",
    "build": "pnpm -r run build"
  },
  "devDependencies": {
    "@eslint/js": "9.12.0",
    "@types/node": "20.16.11",
    "eslint": "9.12.0",
    "prettier": "3.3.3",
    "typescript": "5.6.2",
    "typescript-eslint": "8.8.1"
  }
}
```

- [ ] **Step 3: Создать `.npmrc`**

```
engine-strict=true
auto-install-peers=true
```

- [ ] **Step 4: Создать `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Создать `.editorconfig`**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[Makefile]
indent_style = tab
```

- [ ] **Step 6: Создать `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

- [ ] **Step 7: Создать `eslint.config.mjs` (flat config)**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/drizzle/**', '**/coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];
```

- [ ] **Step 8: Установить зависимости**

Run: `pnpm install`
Expected: `Done in <XXs>`. Создан `pnpm-lock.yaml`, появилась папка `node_modules/`.

- [ ] **Step 9: Проверить, что lint/format не падают на пустом репо**

Run: `pnpm run lint && pnpm run format:check`
Expected: Exit code 0 (никаких файлов для проверки, оба проходят).

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json .editorconfig .prettierrc.json eslint.config.mjs
git commit -m "chore: initialize pnpm workspace with TS, ESLint 9, Prettier"
```

---

### Task 2: Docker-compose локального стека

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `Makefile`

- [ ] **Step 1: Создать `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: mango_postgres
    environment:
      POSTGRES_USER: mango
      POSTGRES_PASSWORD: mango
      POSTGRES_DB: mango
    ports:
      - "5432:5432"
    volumes:
      - mango_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mango -d mango"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: mango_redis
    ports:
      - "6379:6379"
    volumes:
      - mango_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  minio:
    image: minio/minio:RELEASE.2024-09-22T00-33-43Z
    container_name: mango_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: mango
      MINIO_ROOT_PASSWORD: mango12345
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - mango_minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 10

volumes:
  mango_pg_data:
  mango_redis_data:
  mango_minio_data:
```

- [ ] **Step 2: Создать `.env.example`**

```
# --- Local dev config. Copy to .env and adjust if needed. ---

NODE_ENV=development
LOG_LEVEL=debug
PORT=3000

# Postgres (matches docker-compose.yml)
DATABASE_URL=postgres://mango:mango@localhost:5432/mango

# Redis (matches docker-compose.yml)
REDIS_URL=redis://localhost:6379

# MinIO (S3-compatible) — unused in Foundation, included for later plans
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=mango
S3_SECRET_KEY=mango12345
S3_BUCKET=mango-media
S3_REGION=ru-central1
```

- [ ] **Step 3: Создать `Makefile`**

```makefile
.PHONY: up down ps logs restart clean migrate dev test lint format

up:
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@docker compose ps

down:
	docker compose down

ps:
	docker compose ps

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v

migrate:
	pnpm --filter @mango/db run migrate

dev:
	pnpm --filter @mango/api run dev

test:
	pnpm run test

lint:
	pnpm run lint

format:
	pnpm run format
```

- [ ] **Step 4: Скопировать `.env.example` в `.env` и поднять стек**

Run:
```bash
cp .env.example .env
make up
```
Expected: 3 контейнера в статусе `Up (healthy)` через ~15 сек. Проверить: `make ps`.

- [ ] **Step 5: Убедиться в подключении к Postgres**

Run: `docker compose exec postgres psql -U mango -d mango -c "SELECT 1"`
Expected: вывод `?column? 1 (1 row)`.

- [ ] **Step 6: Убедиться в подключении к Redis**

Run: `docker compose exec redis redis-cli PING`
Expected: `PONG`.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example Makefile
git commit -m "chore: add docker-compose with postgres/redis/minio and Makefile"
```

---

### Task 3: Пакет @mango/db — Drizzle + смоук-миграция

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/schema/index.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/migrate.ts`
- Create: `packages/db/src/index.ts`

- [ ] **Step 1: Создать `packages/db/package.json`**

```json
{
  "name": "@mango/db",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "generate": "drizzle-kit generate",
    "migrate": "tsx src/migrate.ts",
    "studio": "drizzle-kit studio",
    "test": "echo 'no tests in @mango/db yet' && exit 0"
  },
  "dependencies": {
    "drizzle-orm": "0.35.2",
    "postgres": "3.4.4"
  },
  "devDependencies": {
    "dotenv": "16.4.5",
    "drizzle-kit": "0.26.2",
    "tsx": "4.19.1",
    "typescript": "5.6.2"
  }
}
```

- [ ] **Step 2: Создать `packages/db/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "drizzle"]
}
```

- [ ] **Step 3: Создать `packages/db/src/schema/index.ts` со смоук-таблицей**

```ts
import { pgTable, integer, timestamp } from 'drizzle-orm/pg-core';

/**
 * Sentinel table inserted by initial migration so we can verify migrations ran.
 * Business tables live in later plans (Identity, Catalog, Billing).
 */
export const schemaVersion = pgTable('_mango_schema_version', {
  version: integer('version').primaryKey(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 4: Создать `packages/db/src/client.ts`**

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export interface CreateDbClientOptions {
  url: string;
  max?: number;
}

export function createDbClient(opts: CreateDbClientOptions): {
  db: DbClient;
  sql: ReturnType<typeof postgres>;
} {
  const sql = postgres(opts.url, { max: opts.max ?? 10 });
  const db = drizzle(sql, { schema });
  return { db, sql };
}
```

- [ ] **Step 5: Создать `packages/db/src/migrate.ts`**

Важно: `main()` вызывается только когда файл — entrypoint процесса. Если просто `import { runMigrations } from '@mango/db'`, никакие сайд-эффекты не срабатывают. Без этого guard'а интеграционные тесты в Task 5 падали бы, потому что импорт `runMigrations` запускал бы `main()` → `process.exit(1)`.

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.resolve(__dirname, '..', 'drizzle');

export async function runMigrations(url: string): Promise<void> {
  const sql = postgres(url, { max: 1 });
  try {
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  await import('dotenv/config');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  await runMigrations(url);
  console.log('Migrations applied.');
}

// case-insensitive сравнение путей — на Windows регистр драйв-леттера
// между process.argv[1] и import.meta.url иногда отличается.
const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]).toLowerCase() ===
    path.resolve(fileURLToPath(import.meta.url)).toLowerCase();

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 6: Создать `packages/db/src/index.ts`**

```ts
export { createDbClient, type DbClient, type CreateDbClientOptions } from './client.js';
export { runMigrations } from './migrate.js';
export * as schema from './schema/index.js';
```

- [ ] **Step 7: Создать `packages/db/drizzle.config.ts`**

```ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://mango:mango@localhost:5432/mango',
  },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 8: Установить зависимости**

Run: `pnpm install`
Expected: `Done`. В `packages/db/node_modules/` появились `drizzle-orm`, `drizzle-kit`, `postgres`, `tsx`.

- [ ] **Step 9: Сгенерировать первую миграцию**

Run: `pnpm --filter @mango/db run generate`
Expected: Создана папка `packages/db/drizzle/` с файлом `0000_*.sql`, содержащим `CREATE TABLE "_mango_schema_version"`.

- [ ] **Step 10: Применить миграцию к локальной Postgres**

Run (из корня): `DATABASE_URL=postgres://mango:mango@localhost:5432/mango make migrate`
Expected: вывод `Migrations applied.`

- [ ] **Step 11: Проверить, что таблица создалась**

Run: `docker compose exec postgres psql -U mango -d mango -c "\dt"`
Expected: в списке таблиц видны `_mango_schema_version` и системная `__drizzle_migrations` (в схеме `drizzle`).

- [ ] **Step 12: Typecheck пакета @mango/db**

Run: `pnpm --filter @mango/db run typecheck`
Expected: Exit 0, никаких ошибок.

- [ ] **Step 13: Commit**

```bash
git add packages/db pnpm-lock.yaml
git commit -m "feat(db): add @mango/db package with Drizzle ORM and smoke migration"
```

---

### Task 4: @mango/api — Fastify skeleton + конфиг + логгер (TDD)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/config.test.ts`
- Create: `apps/api/src/logger.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/app.test.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Создать `apps/api/package.json`**

```json
{
  "name": "@mango/api",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@mango/db": "workspace:*",
    "dotenv": "16.4.5",
    "fastify": "4.28.1",
    "ioredis": "5.4.1",
    "pino": "9.4.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "20.16.11",
    "pino-pretty": "11.2.2",
    "testcontainers": "10.13.2",
    "tsx": "4.19.1",
    "typescript": "5.6.2",
    "vitest": "2.1.2"
  }
}
```

- [ ] **Step 2: Создать `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Создать `apps/api/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,integration.test}.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
```

- [ ] **Step 4: Установить зависимости**

Run: `pnpm install`
Expected: Done. В `apps/api/node_modules/` появились fastify/pino/zod/vitest/testcontainers.

- [ ] **Step 5: Написать failing-тест `apps/api/src/config.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('parses a valid env object', () => {
    const cfg = loadConfig({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      PORT: '4000',
      DATABASE_URL: 'postgres://u:p@h:5432/d',
      REDIS_URL: 'redis://h:6379',
    });
    expect(cfg.PORT).toBe(4000);
    expect(cfg.NODE_ENV).toBe('test');
    expect(cfg.LOG_LEVEL).toBe('silent');
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        REDIS_URL: 'redis://h:6379',
      }),
    ).toThrow();
  });

  it('applies defaults for PORT, LOG_LEVEL, NODE_ENV', () => {
    const cfg = loadConfig({
      DATABASE_URL: 'postgres://u:p@h:5432/d',
      REDIS_URL: 'redis://h:6379',
    });
    expect(cfg.PORT).toBe(3000);
    expect(cfg.LOG_LEVEL).toBe('info');
    expect(cfg.NODE_ENV).toBe('development');
  });
});
```

- [ ] **Step 6: Запустить тест — ожидаем FAIL**

Run: `pnpm --filter @mango/api run test`
Expected: FAIL с сообщением про отсутствующий модуль `./config.js` / `config.ts`.

- [ ] **Step 7: Реализовать `apps/api/src/config.ts`**

```ts
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
```

- [ ] **Step 8: Запустить тест — ожидаем PASS**

Run: `pnpm --filter @mango/api run test`
Expected: 3 passed.

- [ ] **Step 9: Написать `apps/api/src/logger.ts`**

```ts
import pino, { type Logger } from 'pino';
import type { Config } from './config.js';

export function createLogger(cfg: Config): Logger {
  return pino({
    level: cfg.LOG_LEVEL,
    base: { env: cfg.NODE_ENV },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
```

- [ ] **Step 10: Написать failing-тест `apps/api/src/app.test.ts`**

```ts
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
```

- [ ] **Step 11: Запустить тест — ожидаем FAIL**

Run: `pnpm --filter @mango/api run test`
Expected: FAIL на импорте `./app.js`.

- [ ] **Step 12: Реализовать `apps/api/src/app.ts` (минимальная версия без плагинов)**

```ts
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
```

- [ ] **Step 13: Запустить все тесты API — ожидаем PASS**

Run: `pnpm --filter @mango/api run test`
Expected: 5 passed (3 config + 2 app).

- [ ] **Step 14: Написать `apps/api/src/index.ts` (entrypoint)**

```ts
import 'dotenv/config';
import { loadConfig } from './config.js';
import { buildApp } from './app.js';

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
```

- [ ] **Step 15: Проверить, что dev-сервер стартует**

Run: `make dev`
Expected: лог `Server listening at http://0.0.0.0:3000`. Нажмите Ctrl+C — graceful shutdown.

- [ ] **Step 16: Typecheck**

Run: `pnpm --filter @mango/api run typecheck`
Expected: Exit 0.

- [ ] **Step 17: Commit**

```bash
git add apps/api pnpm-lock.yaml
git commit -m "feat(api): scaffold Fastify app with zod config and pino logger"
```

---

### Task 5: Плагин DB и /healthz с проверкой Postgres (TDD через testcontainers)

**Files:**
- Create: `apps/api/src/plugins/db.ts`
- Create: `apps/api/src/plugins/health.ts`
- Create: `apps/api/src/test/health.integration.test.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Написать failing integration-тест `apps/api/src/test/health.integration.test.ts`**

```ts
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
```

- [ ] **Step 2: Добавить `@testcontainers/postgresql` в devDeps `apps/api/package.json`**

Отредактировать `apps/api/package.json`, в `devDependencies` добавить:

```json
"@testcontainers/postgresql": "10.13.2"
```

Затем: `pnpm install`

- [ ] **Step 3: Запустить тест — ожидаем FAIL**

Run: `pnpm --filter @mango/api run test`
Expected: FAIL на импорте `../plugins/health.js` или на `registerDb: true` без реализации плагина.

- [ ] **Step 4: Создать `apps/api/src/plugins/db.ts`**

```ts
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createDbClient, type DbClient } from '@mango/db';
import type { Sql } from 'postgres';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbClient;
    sql: Sql;
  }
}

export const dbPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const { db, sql } = createDbClient({ url: app.config.DATABASE_URL });
  app.decorate('db', db);
  app.decorate('sql', sql as unknown as Sql);
  app.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
  });
};
```

- [ ] **Step 5: Создать `apps/api/src/plugins/health.ts`**

```ts
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
```

- [ ] **Step 6: Обновить `apps/api/src/app.ts`, подключить плагины по флагам**

```ts
import Fastify, { type FastifyInstance } from 'fastify';
import { createLogger } from './logger.js';
import type { Config } from './config.js';
import { dbPlugin } from './plugins/db.js';
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

  await app.register(healthPlugin);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}
```

- [ ] **Step 7: Запустить все тесты — ожидаем PASS**

Run: `pnpm --filter @mango/api run test`
Expected: все passed, включая новый интеграционный тест. Первый запуск медленный (~30-60с на pull образа `postgres:16-alpine` в testcontainers).

Если Docker daemon не запущен — тест упадёт с `Cannot connect to Docker`. Убедиться: `docker ps` работает.

- [ ] **Step 8: Проверить /healthz на живом dev-сервере**

Run в первом терминале: `make dev`
Run во втором: `curl -s http://localhost:3000/healthz | jq`
Expected: `{"status":"ok","db":"ok"}` (поле `redis` ещё отсутствует — это задача 6).

- [ ] **Step 9: Typecheck**

Run: `pnpm --filter @mango/api run typecheck`
Expected: Exit 0.

- [ ] **Step 10: Commit**

```bash
git add apps/api pnpm-lock.yaml
git commit -m "feat(api): add db plugin and /healthz endpoint with Postgres probe"
```

---

### Task 6: Плагин Redis и расширение /healthz

**Files:**
- Create: `apps/api/src/plugins/redis.ts`
- Modify: `apps/api/src/plugins/health.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/test/health.integration.test.ts`

- [ ] **Step 1: Обновить integration-тест — добавить Redis-контейнер и проверку `redis: 'ok'`**

Переписать `apps/api/src/test/health.integration.test.ts`:

```ts
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
```

- [ ] **Step 2: Запустить тест — ожидаем FAIL**

Run: `pnpm --filter @mango/api run test`
Expected: FAIL — плагин Redis не подключён, поле `redis` отсутствует в ответе.

- [ ] **Step 3: Создать `apps/api/src/plugins/redis.ts`**

```ts
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const client = new Redis(app.config.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
  });
  client.on('error', (err) => {
    app.log.error({ err }, 'redis client error');
  });
  app.decorate('redis', client);
  app.addHook('onClose', async () => {
    await client.quit();
  });
};
```

- [ ] **Step 4: Обновить `apps/api/src/plugins/health.ts` — добавить Redis-пробу**

```ts
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

    if ('redis' in app) {
      try {
        const pong = await app.redis.ping();
        body.redis = pong === 'PONG' ? 'ok' : 'fail';
        if (body.redis === 'fail') body.status = 'degraded';
      } catch (err) {
        app.log.error({ err }, 'redis healthcheck failed');
        body.redis = 'fail';
        body.status = 'degraded';
      }
    }

    return reply.code(body.status === 'ok' ? 200 : 503).send(body);
  });
};
```

- [ ] **Step 5: Обновить `apps/api/src/app.ts` — подключить Redis-плагин**

```ts
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
```

- [ ] **Step 6: Запустить тесты — ожидаем PASS**

Run: `pnpm --filter @mango/api run test`
Expected: все passed. Интеграционный тест `/healthz` получает `{status:"ok", db:"ok", redis:"ok"}`.

- [ ] **Step 7: Ручная проверка на dev-сервере**

Run в первом терминале: `make dev`
Run во втором: `curl -s http://localhost:3000/healthz | jq`
Expected: `{"status":"ok","db":"ok","redis":"ok"}`.

- [ ] **Step 8: Проверка degraded-ответа (опционально, для уверенности)**

Run: `docker compose stop redis`, затем `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/healthz`
Expected: `503`.
Run: `docker compose start redis` — вернуть стек в норму.

- [ ] **Step 9: Typecheck**

Run: `pnpm --filter @mango/api run typecheck`
Expected: Exit 0.

- [ ] **Step 10: Commit**

```bash
git add apps/api pnpm-lock.yaml
git commit -m "feat(api): add redis plugin and extend /healthz with redis probe"
```

---

### Task 7: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Создать `.github/workflows/ci.yml`**

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.32.1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.11.0
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Format check
        run: pnpm run format:check

      - name: Typecheck
        run: pnpm run typecheck

      - name: Test (with testcontainers)
        run: pnpm run test
        env:
          NODE_ENV: test
          # testcontainers автоматически использует Docker на ubuntu-latest
```

- [ ] **Step 2: Проверить, что workflow синтаксически валиден (через actionlint, если установлен)**

Если `actionlint` доступен локально: `actionlint .github/workflows/ci.yml`.
Если нет — пропустить, проверка произойдёт на GitHub после push.

- [ ] **Step 3: Запушить ветку и проверить, что CI проходит**

Run:
```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint/typecheck/test"
git push -u origin HEAD
```

Expected: На GitHub открыть `Actions` → workflow `ci` запустился → все шаги зелёные. Время выполнения ~5-8 мин (основное — pull образов testcontainers).

Если CI падает — диагностировать по логу:
- `pnpm install` падает → проверить `pnpm-lock.yaml` закоммичен.
- testcontainers не поднимается → проверить, что `@testcontainers/postgresql` и `testcontainers` в `devDependencies`.
- Lint/format падает → запустить локально `pnpm run format` и перезакоммитить.

- [ ] **Step 4: Commit (если были правки)**

Если потребовались фиксы для CI — зафиксировать отдельным коммитом. Иначе задача выполнена при зелёном прогоне.

---

### Task 8: Финальная верификация Foundation

**Files:** (проверяем целостное состояние, ничего не меняем)

- [ ] **Step 1: Чистая установка с нуля**

Run:
```bash
make clean
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install --frozen-lockfile
```
Expected: Done, без ошибок. Никаких предупреждений о peer-deps.

- [ ] **Step 2: Поднять локальный стек**

Run: `make up`
Ждать ~15 сек. Run: `make ps`
Expected: `mango_postgres`, `mango_redis`, `mango_minio` — все `Up (healthy)`.

- [ ] **Step 3: Применить миграции**

Run: `make migrate`
Expected: `Migrations applied.`

Проверить таблицу:
```bash
docker compose exec postgres psql -U mango -d mango -c "\dt"
```
Expected: `_mango_schema_version` присутствует.

- [ ] **Step 4: Запустить dev-сервер и проверить /healthz**

Run в терминале 1: `make dev`
Run в терминале 2: `curl -s http://localhost:3000/healthz`
Expected: `{"status":"ok","db":"ok","redis":"ok"}`, статус HTTP 200.

Остановить сервер: Ctrl+C в терминале 1. Expected: лог `shutting down`, процесс завершается за <3 сек.

- [ ] **Step 5: Прогнать полный тест-сьют**

Run: `make test`
Expected: все тесты passed (@mango/db — no-op; @mango/api — юнит + интеграция). Интеграционный тест с testcontainers проходит за ~30-60 сек на холодном старте.

- [ ] **Step 6: Typecheck всего монорепо**

Run: `pnpm run typecheck`
Expected: Exit 0, никаких ошибок.

- [ ] **Step 7: Lint + format-check**

Run: `pnpm run lint && pnpm run format:check`
Expected: Exit 0 в обоих случаях.

- [ ] **Step 8: Убедиться, что CI зелёный**

Открыть GitHub → PR/ветка → вкладка `Actions`. Последний прогон `ci` — ✅ зелёный.

- [ ] **Step 9: Финальный коммит (если были мелкие правки)**

Если в ходе верификации ничего не менялось — коммит не нужен. Foundation-план завершён.

---

## Что дальше

После слияния Foundation-ветки — открыть следующий план:

1. **Identity** (`docs/superpowers/plans/2026-XX-XX-mango-cinema-identity.md`) — users/sessions, phone OTP, VK/Yandex ID, JWT.
2. **Catalog + Ingest** — studios/series/episodes, ffmpeg→HLS, signed URLs, правило доступа 5.5.
3. **Billing: Subscriptions** — ЮKassa, state machine, рекуррент.

Каждый следующий план пишется в отдельной сессии через `superpowers:brainstorming` → `superpowers:writing-plans`, и выполняется в собственном worktree.
