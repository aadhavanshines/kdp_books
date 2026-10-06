import { defineProject } from 'vitest/config';

/** Pure unit tests. The database tests live in tests/supabase (pnpm test:supabase:standin). */
export default defineProject({
  test: {
    name: 'supabase',
    include: ['server/**/*.test.ts'],
    environment: 'node',
  },
});
