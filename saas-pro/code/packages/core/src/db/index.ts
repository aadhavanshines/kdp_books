import { drizzle, type NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "./schema";

export { schema };

/** A database handle or an open transaction; every helper accepts either. */
export type Db = PgDatabase<NodePgQueryResultHKT, typeof schema>;

export const DEFAULT_DATABASE_URL = "postgres://saas:saas@localhost:5432/saas_billora";

export function createDb(url: string, options: { max?: number } = {}) {
  const pool = new pg.Pool({ connectionString: url, max: options.max ?? 10 });
  const db = drizzle({ client: pool, schema });
  return { db, pool, close: () => pool.end() };
}

const globalForDb = globalThis as unknown as {
  __saasDb?: ReturnType<typeof createDb>;
};

/** Process-wide database for apps; survives Next.js hot reloads in dev. */
export function getDb(): Db {
  if (!globalForDb.__saasDb) {
    globalForDb.__saasDb = createDb(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL);
  }
  return globalForDb.__saasDb.db;
}
