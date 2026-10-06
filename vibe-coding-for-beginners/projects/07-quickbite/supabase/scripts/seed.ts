/**
 * Loads the seed catalog into the Supabase database.
 *
 *   pnpm seed:supabase     # local stack: postgresql://postgres:postgres@127.0.0.1:54322/postgres
 *
 * SUPABASE_DB_URL picks another database. It refuses anything that isn't on
 * this machine unless --allow-production is passed.
 */
import { buildCatalog } from '@quickbite/seed';
import postgres from 'postgres';
import { postgresJs } from '../server/sql';
import { loadSeed } from '../server/seed';
import { LOCAL_DB_URL } from './local';

const url = process.env.SUPABASE_DB_URL ?? LOCAL_DB_URL;
const host = new URL(url).hostname;
if (
  !['127.0.0.1', 'localhost', '::1'].includes(host) &&
  !process.argv.includes('--allow-production')
) {
  console.error(`Refusing to seed ${host} without --allow-production.`);
  process.exit(1);
}

const client = postgres(url, { prepare: false, onnotice: () => {} });
const started = Date.now();
try {
  const count = await loadSeed(postgresJs(client), buildCatalog());
  console.log(
    `Seeded ${count} rows into ${host} in ${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
} finally {
  await client.end();
}
