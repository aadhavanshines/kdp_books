/**
 * Prepares the database for the Supabase server and RLS tests.
 *
 * SUPABASE_STANDIN=1 (plain PostgreSQL, e.g. `pnpm test:supabase:standin`):
 *   creates a brand-new database, loads the test-only Supabase stand-in
 *   (tests/supabase/standin), runs every migration in supabase/migrations
 *   from scratch and loads the seed catalog. The database is dropped afterwards.
 *
 * Otherwise (a local Supabase stack after `supabase db reset` and `pnpm seed:supabase`):
 *   uses SUPABASE_DB_URL as it is.
 */
import { buildCatalog } from '@quickbite/seed';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';
import type { TestProject } from 'vitest/node';
import { loadSeed } from '../../supabase/server/seed';
import { postgresJs } from '../../supabase/server/sql';
import { LOCAL_DB_URL } from '../../supabase/scripts/local';

declare module 'vitest' {
  export interface ProvidedContext {
    dbUrl: string;
    standin: boolean;
  }
}

const MIGRATIONS = 'supabase/migrations';
const STANDIN = 'tests/supabase/standin';

export default async function setup(project: TestProject) {
  const baseUrl = process.env.SUPABASE_DB_URL ?? LOCAL_DB_URL;
  const standin = process.env.SUPABASE_STANDIN === '1';
  if (!standin) {
    project.provide('dbUrl', baseUrl);
    project.provide('standin', false);
    return;
  }

  const name = `quickbite_test_${Date.now().toString(36)}`;
  const admin = postgres(baseUrl, { max: 1, onnotice: () => {} });
  await admin.unsafe(`create database ${name}`);
  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  const db = postgres(url.toString(), { max: 1, onnotice: () => {} });
  try {
    const files = [
      join(STANDIN, 'supabase-roles.sql'),
      join(STANDIN, 'supabase-auth.sql'),
      ...readdirSync(MIGRATIONS)
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .map((f) => join(MIGRATIONS, f)),
    ];
    for (const file of files) {
      try {
        await db.unsafe(readFileSync(file, 'utf8'));
      } catch (error) {
        throw new Error(`${file}: ${(error as Error).message}`, { cause: error });
      }
    }
    await loadSeed(postgresJs(db), buildCatalog());
  } finally {
    await db.end();
  }
  project.provide('dbUrl', url.toString());
  project.provide('standin', true);

  return async () => {
    await admin.unsafe(`drop database if exists ${name} with (force)`);
    await admin.end();
  };
}
