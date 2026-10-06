#!/usr/bin/env node
// `pnpm test:e2e:supabase`: the Playwright suite against a local Supabase
// stack. Starts the stack and the Edge Functions (unless
// SUPABASE_STACK=external), loads the seed catalog, runs the order simulator
// with short steps so tracking can be watched to "delivered", and runs
// Playwright against a build that uses the Supabase backend.

import { spawn } from 'node:child_process';

const external = process.env.SUPABASE_STACK === 'external';
const FUNCTIONS = `${process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'}/functions/v1/quote-order`;

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

for (const [command, args] of [
  ...(external ? [] : [['supabase', ['start']]]),
  ['pnpm', ['build:supabase']],
  ['pnpm', ['seed:supabase']],
]) {
  if ((await exitCode(run(command, args))) !== 0) process.exit(1);
}

const background = [];
if (!external) background.push(run('supabase', ['functions', 'serve']));
// Wait until the functions answer (a CORS preflight needs no session).
for (let i = 0; ; i++) {
  try {
    if ((await fetch(FUNCTIONS, { method: 'OPTIONS' })).ok) break;
  } catch {
    // Not up yet.
  }
  if (i > 120) {
    console.error(`Edge Functions did not start (${FUNCTIONS})`);
    background.forEach(stop);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 500));
}

background.push(
  run('node_modules/.bin/tsx', ['supabase/scripts/sim.ts'], {
    DEMO_STEP_SECONDS: process.env.DEMO_STEP_SECONDS ?? '4',
  }),
);
const playwright = run('pnpm', ['exec', 'playwright', 'test', ...process.argv.slice(2)], {
  E2E_BACKEND: 'supabase',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => [...background, playwright].forEach(stop));
}
const code = await exitCode(playwright);
background.forEach(stop);
process.exit(code);
