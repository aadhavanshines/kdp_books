import { defineConfig } from 'vitest/config';

/**
 * One contract suite, run against every backend (docs/PLAN.md §9).
 * `pnpm test:contract` starts the Firebase emulators and seeds them first;
 * `pnpm test:contract:supabase` runs it against a local Supabase stack.
 * CONTRACT_BACKENDS picks the backends (default: memory,firebase).
 */
export default defineConfig({
  test: {
    name: 'contract',
    include: ['tests/contract/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
