import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { openDb } from '../db';
import { ratingBreakdown } from './breakdown';
import { seedDatabase } from './index';

const NOW = Date.parse('2026-10-31T08:00:00Z');
const db = openDb(':memory:');
const summary = seedDatabase(db, { now: NOW });
const n = (sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;

describe('seed data', () => {
  it('meets the PRD minimums', () => {
    expect(summary.restaurants).toBeGreaterThanOrEqual(24);
    expect(summary.products).toBeGreaterThanOrEqual(60);
    expect(summary.users).toBeGreaterThanOrEqual(20);
    expect(summary.groceries).toBeGreaterThanOrEqual(120);
    expect(summary.groceryCategories).toBe(12);
    expect(summary.coupons).toBeGreaterThan(0);
    for (const app of ['platter', 'cartly', 'minutely']) expect(n('SELECT COUNT(*) AS n FROM coupons WHERE app = ?', app)).toBeGreaterThan(0);
  });

  it('gives every restaurant a full menu', () => {
    const rows = db
      .prepare('SELECT restaurant_id, COUNT(*) AS items, COUNT(DISTINCT category_id) AS cats FROM menu_items GROUP BY restaurant_id')
      .all() as { restaurant_id: string; items: number; cats: number }[];
    expect(rows).toHaveLength(summary.restaurants);
    for (const r of rows) {
      expect(r.items).toBeGreaterThanOrEqual(18);
      expect(r.cats).toBeGreaterThanOrEqual(4);
    }
    expect(n("SELECT COUNT(*) AS n FROM menu_items m JOIN restaurants r ON r.id = m.restaurant_id WHERE r.pure_veg = 1 AND m.veg = 0")).toBe(0);
  });

  it('gives every product reviews and every user posts, and has stories and comments', () => {
    expect(n('SELECT COUNT(*) AS n FROM products WHERE id NOT IN (SELECT product_id FROM reviews)')).toBe(0);
    expect(n('SELECT COUNT(*) AS n FROM users WHERE id NOT IN (SELECT user_id FROM posts)')).toBe(0);
    expect(summary.stories).toBeGreaterThan(20);
    expect(summary.comments).toBeGreaterThan(200);
  });

  it('puts 10 groceries in each of the 12 categories', () => {
    const rows = db.prepare('SELECT category_id, COUNT(*) AS n FROM groceries GROUP BY category_id').all() as { n: number }[];
    expect(rows).toHaveLength(12);
    for (const r of rows) expect(r.n).toBe(10);
  });

  it('only references art that exists', () => {
    const art = new Set<string>(JSON.parse(readFileSync(new URL('../../../packages/ui/art/index.json', import.meta.url), 'utf8')));
    const used = [
      ...(db.prepare('SELECT art FROM restaurants UNION SELECT art FROM menu_items UNION SELECT art FROM products UNION SELECT art FROM groceries UNION SELECT art FROM banners UNION SELECT avatar AS art FROM users WHERE avatar IS NOT NULL').all() as { art: string }[]).map((r) => r.art),
      ...(db.prepare('SELECT scene_json FROM posts UNION ALL SELECT scene_json FROM stories').all() as { scene_json: string }[]).flatMap(
        (r) => (JSON.parse(r.scene_json) as { layers: { art: string }[] }).layers.map((l) => l.art),
      ),
    ];
    expect(used.filter((a) => !art.has(a))).toEqual([]);
  });

  it('uses only fictional .example domains for emails and websites', () => {
    const rows = db.prepare('SELECT email, website FROM users').all() as { email: string; website: string | null }[];
    for (const r of rows) {
      expect(r.email.endsWith('.example')).toBe(true);
      if (r.website) expect(r.website).toMatch(/\.example(\/|$)/);
    }
  });

  it('is deterministic for the same seed', () => {
    const other = openDb(':memory:');
    seedDatabase(other, { now: NOW });
    const dump = (d: typeof db) => JSON.stringify(d.prepare('SELECT id, scene_json FROM posts ORDER BY id').all());
    expect(dump(other)).toBe(dump(db));
  });
});

describe('ratingBreakdown', () => {
  it('sums to the total and matches the average', () => {
    const b = ratingBreakdown(4.2, 1000);
    expect(b.reduce((s, x) => s + x.count, 0)).toBe(1000);
    const mean = b.reduce((s, x) => s + x.stars * x.count, 0) / 1000;
    expect(mean).toBeCloseTo(4.2, 1);
    expect(b.map((x) => x.stars)).toEqual([5, 4, 3, 2, 1]);
  });
});
