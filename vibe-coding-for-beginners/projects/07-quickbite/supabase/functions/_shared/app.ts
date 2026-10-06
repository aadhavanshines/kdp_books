// Shared setup for every QuickBite Edge Function: one database pool and the
// handlers from the bundled server code (`pnpm build:supabase` creates
// server.js from supabase/server).
//
// Environment (set by Supabase for every function, locally and in projects):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_DB_URL
// Function secrets (`supabase secrets set …`, see README):
//   PAYMENTS_MODE, FAKE_WEBHOOK_SECRET, CRON_SECRET, DEMO_STEP_SECONDS, and for
//   PAYMENTS_MODE=real: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
//   STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET (test keys)

import postgres from 'npm:postgres@3.4.9';
import {
  createEdgeHandlers,
  PostgresOrderStore,
  postgresJs,
  supabaseAuthenticator,
} from './server.js';

type EdgeHandlers = ReturnType<typeof createEdgeHandlers>;

const env = Deno.env.toObject();

function required(name: string): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

let handlers: EdgeHandlers | null = null;

function getHandlers(): EdgeHandlers {
  if (!handlers) {
    // prepare: false works with Supabase's transaction-mode connection pooler too.
    const sql = postgres(required('SUPABASE_DB_URL'), { prepare: false, max: 3 });
    handlers = createEdgeHandlers({
      store: new PostgresOrderStore(postgresJs(sql)),
      env,
      authenticate: supabaseAuthenticator(required('SUPABASE_URL'), required('SUPABASE_ANON_KEY')),
    });
  }
  return handlers;
}

/** Serves one of the handlers. Each function's index.ts calls this once. */
export function serve(name: keyof EdgeHandlers): void {
  Deno.serve((request) => getHandlers()[name](request));
}
