import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { schema, SCHEMA_VERSION, TIME_COLUMNS } from './schema';

export type DB = Database.Database;

export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(schema);
  migrate(db);
  db.prepare('INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)').run('schema_version', String(SCHEMA_VERSION));
  return db;
}

/** Columns added after the first release; older databases get them here. */
const ADDED_COLUMNS: [table: string, column: string, definition: string][] = [
  ['carts', 'address_id', 'TEXT'],
  ['coupons', 'first_order_only', 'INTEGER NOT NULL DEFAULT 0'],
];

function migrate(db: DB): void {
  for (const [table, column, definition] of ADDED_COLUMNS) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function getMeta(db: DB, key: string): string | null {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setMeta(db: DB, key: string, value: string): void {
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    key,
    value,
  );
}

export function isSeeded(db: DB): boolean {
  return getMeta(db, 'seeded_at') != null;
}

/**
 * Moves every timestamp forward by the time since the data was seeded (or
 * last refreshed), so "2h ago" posts and recent orders stay recent across
 * days of demos. Returns the shift in milliseconds (0 if under an hour).
 */
export function refreshTimestamps(db: DB, now: number): number {
  const anchor = Number(getMeta(db, 'time_anchor') ?? getMeta(db, 'seeded_at'));
  if (!Number.isFinite(anchor)) return 0;
  const shift = now - anchor;
  if (shift < 60 * 60 * 1000) return 0;
  db.transaction(() => {
    for (const [table, columns] of Object.entries(TIME_COLUMNS)) {
      const sets = columns.map((c) => `${c} = CASE WHEN ${c} IS NULL OR ${c} = 0 THEN ${c} ELSE ${c} + @shift END`);
      db.prepare(`UPDATE ${table} SET ${sets.join(', ')}`).run({ shift });
    }
    setMeta(db, 'time_anchor', String(now));
  })();
  return shift;
}
