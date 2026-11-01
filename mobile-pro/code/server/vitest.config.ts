import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Each test file builds its own in-memory database.
    pool: 'forks',
  },
});
