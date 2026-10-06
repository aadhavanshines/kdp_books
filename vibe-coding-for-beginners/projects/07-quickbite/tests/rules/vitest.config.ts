import { defineConfig } from 'vitest/config';

/** Firestore security rules tests. Run through `pnpm test:rules`, which starts the emulator. */
export default defineConfig({
  test: {
    name: 'rules',
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
