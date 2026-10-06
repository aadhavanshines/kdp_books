import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a production build served by `vite preview`.
 * PLAYWRIGHT_BROWSERS_PATH can point at a pre-installed Chromium (see README).
 *
 * E2E_BACKEND picks the backend the build talks to: `memory` (default) or
 * `firebase`. `pnpm test:e2e:firebase` starts and seeds the emulators first.
 */
const PORT = 4173;
const BACKEND = process.env.E2E_BACKEND ?? 'memory';
// Set by pnpm test:hosting: test an already running Firebase Hosting emulator instead of `vite preview`.
const BASE_URL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } },
    },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        command: `VITE_BACKEND=${BACKEND} VITE_DEMO_STEP_SECONDS=4 pnpm build && pnpm preview`,
        url: `http://localhost:${PORT}`,
        // A server left running might be built for the other backend, so only reuse it for memory.
        reuseExistingServer: !process.env.CI && BACKEND === 'memory',
        timeout: 180_000,
      },
});
