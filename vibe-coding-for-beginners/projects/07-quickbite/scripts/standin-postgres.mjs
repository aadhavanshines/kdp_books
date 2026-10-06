#!/usr/bin/env node
// Runs a command against a throwaway PostgreSQL server, for machines without
// Docker (where `supabase start` can't run):
//
//   node scripts/standin-postgres.mjs <command…>
//
// It creates a fresh cluster in a temporary directory, starts it on
// 127.0.0.1:$STANDIN_PG_PORT (default 55432), runs the command with
// SUPABASE_DB_URL pointing at it and SUPABASE_STANDIN=1 (so the tests load
// the test-only Supabase stand-in before the migrations), then stops the
// server and deletes the directory.
//
// PostgreSQL binaries come from $PG_BIN, `pg_config --bindir` or the newest
// /usr/lib/postgresql/<version>/bin. Postgres refuses to run as root, so as
// root the server runs as the `postgres` system user.

import { execFileSync, spawn } from 'node:child_process';
import { chownSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const command = process.argv.slice(2);
if (command.length === 0) {
  console.error('Usage: node scripts/standin-postgres.mjs <command…>');
  process.exit(2);
}

function findBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  try {
    const dir = execFileSync('pg_config', ['--bindir'], { encoding: 'utf8' }).trim();
    if (existsSync(join(dir, 'initdb'))) return dir;
  } catch {
    // Not on PATH.
  }
  const root = '/usr/lib/postgresql';
  const versions = existsSync(root)
    ? readdirSync(root)
        .filter((v) => existsSync(join(root, v, 'bin', 'initdb')))
        .sort((a, b) => Number(b) - Number(a))
    : [];
  if (versions[0]) return join(root, versions[0], 'bin');
  throw new Error('PostgreSQL binaries not found. Set PG_BIN to the directory with initdb.');
}

const bin = findBin();
const port = Number(process.env.STANDIN_PG_PORT ?? 55432);
const dir = mkdtempSync(join(tmpdir(), 'quickbite-pg-'));
const data = join(dir, 'data');
const asRoot = process.getuid?.() === 0;
if (asRoot) {
  const uid = Number(execFileSync('id', ['-u', 'postgres'], { encoding: 'utf8' }));
  const gid = Number(execFileSync('id', ['-g', 'postgres'], { encoding: 'utf8' }));
  chownSync(dir, uid, gid);
}
const pg = (tool, args) =>
  asRoot
    ? execFileSync('runuser', ['-u', 'postgres', '--', join(bin, tool), ...args], {
        stdio: 'pipe',
      })
    : execFileSync(join(bin, tool), args, { stdio: 'pipe' });

let started = false;
function cleanup() {
  if (started) {
    try {
      pg('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    } catch {
      // Already stopped.
    }
    started = false;
  }
  rmSync(dir, { recursive: true, force: true });
}

try {
  pg('initdb', ['-D', data, '-U', 'postgres', '--auth=trust', '-E', 'UTF8', '--no-sync']);
  pg('pg_ctl', [
    '-D',
    data,
    '-l',
    join(dir, 'server.log'),
    '-w',
    '-o',
    `-p ${port} -c listen_addresses=127.0.0.1 -k ${dir} -c fsync=off -c wal_level=logical`,
    'start',
  ]);
  started = true;
} catch (error) {
  console.error(String(error.stderr ?? error));
  cleanup();
  process.exit(1);
}

const url = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;
console.log(`Stand-in PostgreSQL (${bin}) on ${url}`);
const child = spawn(command[0], command.slice(1), {
  stdio: 'inherit',
  env: { ...process.env, SUPABASE_DB_URL: url, SUPABASE_STANDIN: '1' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  cleanup();
  process.exit(code ?? 1);
});
