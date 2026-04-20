import { pgTable, integer, timestamp } from 'drizzle-orm/pg-core';

/**
 * Sentinel table inserted by initial migration so we can verify migrations ran.
 * Business tables live in later plans (Identity, Catalog, Billing).
 */
export const schemaVersion = pgTable('_mango_schema_version', {
  version: integer('version').primaryKey(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
});
