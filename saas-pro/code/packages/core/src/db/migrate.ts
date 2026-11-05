import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../../drizzle", import.meta.url));

const quoteIdent = (name: string) => `"${name.replaceAll('"', '""')}"`;

/** Split a database URL into (admin URL on the `postgres` db, database name). */
export function splitDatabaseUrl(url: string) {
  const u = new URL(url);
  const name = decodeURIComponent(u.pathname.replace(/^\//, ""));
  if (!name) throw new Error(`No database name in ${url}`);
  u.pathname = "/postgres";
  return { adminUrl: u.toString(), name };
}

/** Create the database in `url` if it doesn't exist (needs CREATEDB). */
export async function ensureDatabase(url: string) {
  const { adminUrl, name } = splitDatabaseUrl(url);
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [name]);
    if (!rowCount) await client.query(`create database ${quoteIdent(name)}`);
  } finally {
    await client.end();
  }
}

export async function dropDatabase(url: string) {
  const { adminUrl, name } = splitDatabaseUrl(url);
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(`drop database if exists ${quoteIdent(name)} with (force)`);
  } finally {
    await client.end();
  }
}

export async function runMigrations(url: string) {
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}
