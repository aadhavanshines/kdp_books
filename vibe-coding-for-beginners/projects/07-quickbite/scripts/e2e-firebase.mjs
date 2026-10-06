#!/usr/bin/env node
// `pnpm test:e2e:firebase` runs this inside `firebase emulators:exec` (Auth,
// Firestore and Functions are up). It seeds the emulators, runs the order
// simulator with short steps so tracking can be watched to "delivered", and
// runs Playwright against a build that uses the Firebase backend.

import { spawn } from 'node:child_process';

// Each child gets its own process group, so stopping it also stops its children.
const run = (command, args, env = {}) =>
  spawn(command, args, { stdio: 'inherit', env: { ...process.env, ...env }, detached: true });
const exitCode = (child) =>
  new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)));
const stop = (child) => {
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    // Already gone.
  }
};

if ((await exitCode(run('pnpm', ['seed:firebase']))) !== 0) process.exit(1);

const sim = run('node_modules/.bin/tsx', ['firebase/functions/src/sim.ts'], {
  METADATA_SERVER_DETECTION: 'none',
  DEMO_STEP_SECONDS: process.env.DEMO_STEP_SECONDS ?? '4',
});
const playwright = run('pnpm', ['exec', 'playwright', 'test', ...process.argv.slice(2)], {
  E2E_BACKEND: 'firebase',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => [sim, playwright].forEach(stop));
}
const code = await exitCode(playwright);
stop(sim);
process.exit(code);
