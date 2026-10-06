#!/usr/bin/env node
// `pnpm test:hosting`: proves firebase.json works, with no Firebase project and no deploy.
//
//   1. Builds the app for Firebase with functions called through Hosting (/api/…).
//   2. Starts the Hosting + Functions + Firestore + Auth emulators on the REAL
//      firebase.json and checks routes, rewrites, headers and caching.
//   3. Runs the Firebase end-to-end suite (and the CSP suite) in a browser against the
//      Hosting emulator. The only change to the policy for this run is that the Auth and
//      Firestore emulator addresses are added to connect-src (production has no emulators),
//      and the script checks that nothing else differs.
import { spawn } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const run = (command, args, env = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', env: { ...process.env, ...env } });
    child.on('exit', (code) => resolve(code ?? 1));
  });
const must = async (label, command, args, env) => {
  console.log(`\n=== ${label}`);
  const code = await run(command, args, env);
  if (code !== 0) {
    console.error(`\n${label} failed (exit ${code})`);
    process.exit(code);
  }
};

// A corporate/sandbox HTTPS_PROXY makes the Hosting emulator send its rewrites to the
// functions emulator through the proxy, which can't reach localhost. Nothing here needs the network.
const NO_PROXY = Object.fromEntries(
  Object.keys(process.env)
    .filter((k) => /^(https?|all)_proxy$/i.test(k))
    .map((k) => [k, '']),
);
const EMULATOR_ENV = { METADATA_SERVER_DETECTION: 'none', ...NO_PROXY };
const emulators = (config, command) => [
  'emulators:exec',
  '--project',
  'demo-quickbite',
  '--config',
  config,
  '--only',
  'auth,firestore,functions,hosting',
  command,
];

await must('Build functions', 'pnpm', ['build:functions']);
await must('Build the web app', 'pnpm', ['--filter', '@quickbite/web', 'build'], {
  VITE_BACKEND: 'firebase',
  VITE_FIREBASE_FUNCTIONS_VIA_HOSTING: 'true',
  VITE_DEMO_STEP_SECONDS: '4',
});

await must(
  'Routes, rewrites, headers and caching (real firebase.json)',
  'node_modules/.bin/firebase',
  emulators('firebase.json', 'node scripts/hosting-assert.mjs'),
  EMULATOR_ENV,
);

// The same file with only the local emulator addresses added to connect-src.
const real = JSON.parse(readFileSync('firebase.json', 'utf8'));
const local = structuredClone(real);
const rule = local.hosting.headers
  .find((h) => h.source === '**')
  .headers.find((h) => h.key === 'Content-Security-Policy');
const extra = [
  'http://127.0.0.1:9099',
  'http://127.0.0.1:8080',
  'http://localhost:9099',
  'http://localhost:8080',
];
rule.value = rule.value.replace(/(connect-src [^;]*)/, `$1 ${extra.join(' ')}`);
// upgrade-insecure-requests would turn the emulators' http into https.
rule.value = rule.value.replace(/;\s*upgrade-insecure-requests/, '');
const strip = (v) =>
  v.replaceAll(/ http:\/\/(127\.0\.0\.1|localhost):\d+/g, '') + '; upgrade-insecure-requests';
const realCsp = real.hosting.headers
  .find((h) => h.source === '**')
  .headers.find((h) => h.key === 'Content-Security-Policy').value;
if (strip(rule.value) !== realCsp) {
  console.error('The local CSP differs from firebase.json by more than the emulator addresses');
  process.exit(1);
}
const temp = 'firebase.local-csp.json';
writeFileSync(temp, JSON.stringify(local, null, 2));
try {
  await must(
    'Browser tests against the Hosting emulator (real CSP)',
    'node_modules/.bin/firebase',
    emulators(temp, 'node scripts/e2e-firebase.mjs'),
    {
      ...EMULATOR_ENV,
      E2E_BASE_URL: 'http://localhost:5000',
      E2E_BACKEND: 'firebase',
      E2E_HOSTING: '1',
    },
  );
} finally {
  rmSync(temp, { force: true });
}
console.log('\nHosting check passed');
