import { defineConfig } from 'vitest/config';

/**
 * Supabase database tests: migrations, Row Level Security, and the server's
 * PostgresOrderStore and Edge Function handlers against real PostgreSQL.
 *
 *   pnpm test:supabase:standin   plain PostgreSQL (no Docker): fresh database, migrations from scratch
 *   pnpm test:supabase:db        a running local Supabase stack (supabase start)
 */
export default defineConfig({
  test: {
    name: 'supabase-db',
    include: ['tests/supabase/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['tests/supabase/globalSetup.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
