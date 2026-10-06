#!/usr/bin/env node
// `pnpm dev:firebase` runs this inside `firebase emulators:exec`, so the Auth,
// Firestore and Functions emulators are already up. It seeds them, then starts
// the web app and the order simulator (which moves paid orders along, since
// the emulator doesn't run scheduled functions). Everything stops together on
// Ctrl+C.

import { spawn } from 'node:child_process';

const children = [];

function run(command, args, env = {}) {
  // Own process group, so stopping it also stops its children (vite, tsx).
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

if ((await exitCode(run('pnpm', ['seed:firebase']))) !== 0) process.exit(1);

const web = run('pnpm', ['--filter', '@quickbite/web', 'dev'], { VITE_BACKEND: 'firebase' });
run('node_modules/.bin/tsx', ['firebase/functions/src/sim.ts'], {
  METADATA_SERVER_DETECTION: 'none',
  DEMO_STEP_SECONDS: process.env.DEMO_STEP_SECONDS ?? '20',
});
console.log('\n  QuickBite on the Firebase emulators: http://localhost:5173\n');

// When the web server exits, stop everything else (the emulators stop with us).
await exitCode(web);
stopAll();
