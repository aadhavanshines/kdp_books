#!/usr/bin/env node
// `pnpm dev:supabase`: QuickBite on a local Supabase stack. Needs Docker and
// the Supabase CLI (https://supabase.com/docs/guides/local-development).
//
// It starts the stack (`supabase start` applies supabase/migrations the first
// time; `supabase db reset` re-applies them), bundles the server code for the
// Edge Functions, loads the seed catalog, then runs the functions, the web
// app and the order simulator together. Ctrl+C stops those three; the stack
// keeps running until `supabase stop`.
//
// SUPABASE_STACK=external skips `supabase start` and `supabase functions serve`
// when you run the stack yourself.

import { spawn, spawnSync } from 'node:child_process';

const external = process.env.SUPABASE_STACK === 'external';
const children = [];

function run(command, args, env = {}) {
  // Own process group, so stopping it also stops its children.
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
    detached: true,
  });
  children.push(child);
  return child;
}

const exitCode = (child) =>
  new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)));

function stopAll() {
  for (const child of children) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // Already gone.
    }
  }
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
process.on('exit', stopAll);

async function step(command, args) {
  if ((await exitCode(run(command, args))) !== 0) {
    console.error(`\n  "${command} ${args.join(' ')}" failed.\n`);
    process.exit(1);
  }
}

if (!external) {
  if (spawnSync('supabase', ['--version'], { stdio: 'ignore' }).error) {
    console.error(
      '\n  The Supabase CLI is not installed: https://supabase.com/docs/guides/local-development/cli/getting-started\n',
    );
    process.exit(1);
  }
  await step('supabase', ['start']);
}
await step('pnpm', ['build:supabase']);
await step('pnpm', ['seed:supabase']);

if (!external) run('supabase', ['functions', 'serve']);
const web = run('pnpm', ['--filter', '@quickbite/web', 'dev'], { VITE_BACKEND: 'supabase' });
run('node_modules/.bin/tsx', ['supabase/scripts/sim.ts'], {
  DEMO_STEP_SECONDS: process.env.DEMO_STEP_SECONDS ?? '20',
});
console.log(`
  QuickBite on local Supabase: http://localhost:5173
  Studio http://127.0.0.1:54323 · sign-in emails (Mailpit) http://127.0.0.1:54324
`);

// When the web server exits, stop everything else (the stack keeps running).
await exitCode(web);
stopAll();
