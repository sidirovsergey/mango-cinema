import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createDbClient, type DbClient } from '@mango/db';

type SqlClient = ReturnType<typeof createDbClient>['sql'];

declare module 'fastify' {
  interface FastifyInstance {
    db: DbClient;
    sql: SqlClient;
  }
}

const _dbPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const { db, sql } = createDbClient({ url: app.config.DATABASE_URL });
  app.decorate('db', db);
  app.decorate('sql', sql);
  app.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
  });
};

export const dbPlugin = fp(_dbPlugin, { name: 'db' });
