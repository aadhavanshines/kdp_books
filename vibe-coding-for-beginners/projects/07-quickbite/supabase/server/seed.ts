/**
 * Loads the seed catalog into Postgres. Upserts, so it can run again after a
 * catalog change without touching orders or customer data.
 */
import type { Catalog } from '@quickbite/seed';
import {
  areaToRow,
  categoryToRow,
  couponToRow,
  menuItemToRow,
  regionToRow,
  restaurantToRow,
} from './rows';
import type { Sql } from './sql';

async function upsert(sql: Sql, table: string, key: string, rows: object[]) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]!);
  const updates = columns
    .filter((c) => c !== key)
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');
  for (let i = 0; i < rows.length; i += 500) {
    await sql.query(
      `insert into public.${table} (${columns.join(', ')})
       select ${columns.join(', ')} from jsonb_populate_recordset(null::public.${table}, $1::jsonb)
       on conflict (${key}) do update set ${updates}`,
      [rows.slice(i, i + 500)],
    );
  }
}

export async function loadSeed(sql: Sql, catalog: Catalog): Promise<number> {
  const tables: [string, object[]][] = [
    ['regions', catalog.regions.map(regionToRow)],
    ['areas', catalog.areas.map(areaToRow)],
    ['restaurants', catalog.restaurants.map(restaurantToRow)],
    ['menu_categories', catalog.categories.map(categoryToRow)],
    ['menu_items', catalog.items.map(menuItemToRow)],
    ['coupons', catalog.coupons.map(couponToRow)],
  ];
  await sql.transaction(async (tx) => {
    for (const [table, rows] of tables) {
      await upsert(tx, table, table === 'coupons' ? 'code' : 'id', rows);
    }
  });
  return tables.reduce((n, [, rows]) => n + rows.length, 0);
}
