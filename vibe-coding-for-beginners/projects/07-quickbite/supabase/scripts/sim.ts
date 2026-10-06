/**
 * `pnpm sim:supabase`: the demo simulator for a local Supabase stack. In a
 * project, pg_cron calls the scheduled-jobs function every minute; locally
 * this runs the same advanceDemoOrders() and expireUnpaidOrders() in a loop.
 *
 *   DEMO_STEP_SECONDS   seconds per tracking step (default 45; tests use a few seconds)
 *   SUPABASE_DB_URL     database (default: the local stack)
 */
import {
  advanceDemoOrders,
  DEFAULT_DEMO_STEP_SECONDS,
  expireUnpaidOrders,
} from '@quickbite/server';
import postgres from 'postgres';
import { PostgresOrderStore } from '../server/postgresStore';
import { postgresJs } from '../server/sql';
import { LOCAL_DB_URL } from './local';

const url = process.env.SUPABASE_DB_URL ?? LOCAL_DB_URL;
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(url).hostname)) {
  console.error('The simulator only runs against a local database.');
  process.exit(1);
}

const stepSeconds = Number(process.env.DEMO_STEP_SECONDS ?? DEFAULT_DEMO_STEP_SECONDS);
const tickMs = Math.max(250, Math.min(5000, (stepSeconds * 1000) / 5));
const client = postgres(url, { prepare: false, max: 2, onnotice: () => {} });
const store = new PostgresOrderStore(postgresJs(client));

console.log(
  `Order simulator: one tracking step every ${stepSeconds}s (checking every ${tickMs}ms)`,
);
let stopped = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => (stopped = true));

// Stop on our own when the database goes away, so no simulator is left running.
const MAX_FAILURES = 10;
let failures = 0;
while (!stopped && failures < MAX_FAILURES) {
  try {
    const now = new Date();
    const advanced = await advanceDemoOrders(store, { now, stepSeconds });
    const expired = await expireUnpaidOrders(store, { now });
    failures = 0;
    if (advanced || expired) console.log(`[sim] advanced ${advanced}, expired ${expired}`);
  } catch (error) {
    failures++;
    console.error('[sim]', error instanceof Error ? error.message : error);
  }
  await new Promise((r) => setTimeout(r, tickMs));
}
if (failures >= MAX_FAILURES) console.error('[sim] Database unreachable, stopping.');
await client.end({ timeout: 1 });
process.exit(0);
