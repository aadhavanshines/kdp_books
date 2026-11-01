import type {
  ArtName,
  ArtTone,
  GroceryCategory,
  GroceryItem,
  GroceryItemDetail,
  GroceryQuery,
  MapPoint,
} from '@pro/api/types';

import type { DB } from '../db';
import { notFound } from '../lib/errors';
import { distanceKm } from '../lib/geo';
import { parseJson } from '../lib/json';
import { discountPercent } from '../lib/pricing';

export interface GroceryRow {
  id: string;
  name: string;
  brand: string;
  category_id: string;
  subcategory: string;
  unit: string;
  price: number;
  mrp: number;
  art: string;
  tone: string;
  tags_json: string;
  in_stock: number;
  max_per_order: number;
  veg: number;
  description: string;
  shelf_life: string | null;
  origin: string | null;
  sort: number;
}

export interface StoreRow {
  id: string;
  name: string;
  locality: string;
  x: number;
  y: number;
}

export function toGroceryItem(g: GroceryRow): GroceryItem {
  return {
    id: g.id,
    name: g.name,
    brand: g.brand,
    categoryId: g.category_id,
    subcategory: g.subcategory,
    unit: g.unit,
    price: g.price,
    mrp: g.mrp,
    discountPercent: discountPercent(g.price, g.mrp),
    art: g.art as ArtName,
    tone: g.tone as ArtTone,
    tags: parseJson<string[]>(g.tags_json, []),
    inStock: g.in_stock === 1,
    maxPerOrder: g.max_per_order,
    isVeg: g.veg === 1,
  };
}

export function listGroceryCategories(db: DB): GroceryCategory[] {
  return (
    db.prepare('SELECT * FROM grocery_categories ORDER BY sort').all() as {
      id: string;
      name: string;
      art: string;
      tone: string;
      subcategories_json: string;
    }[]
  ).map((c) => ({
    id: c.id,
    name: c.name,
    art: c.art as ArtName,
    tone: c.tone as ArtTone,
    subcategories: parseJson<string[]>(c.subcategories_json, []),
  }));
}

export function getGroceryRow(db: DB, id: string): GroceryRow {
  const row = db.prepare('SELECT * FROM groceries WHERE id = ?').get(id) as GroceryRow | undefined;
  if (!row) throw notFound('Item');
  return row;
}

export function listGroceries(db: DB, query: GroceryQuery): GroceryItem[] {
  const q = query.q?.trim().toLowerCase();
  let rows = (db.prepare('SELECT * FROM groceries ORDER BY sort').all() as GroceryRow[]).filter((g) => {
    if (query.category && g.category_id !== query.category) return false;
    if (query.subcategory && g.subcategory !== query.subcategory) return false;
    if (q && !`${g.name} ${g.brand} ${g.subcategory}`.toLowerCase().includes(q)) return false;
    return true;
  });
  switch (query.sort) {
    case 'price_asc':
      rows = rows.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      rows = rows.sort((a, b) => b.price - a.price);
      break;
    case 'discount':
      rows = rows.sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp));
      break;
    default:
      // In-stock first, keep catalogue order.
      rows = rows.sort((a, b) => b.in_stock - a.in_stock || a.sort - b.sort);
  }
  return rows.map(toGroceryItem);
}

export function getGrocery(db: DB, id: string): GroceryItemDetail {
  const g = getGroceryRow(db, id);
  const similar = (
    db
      .prepare('SELECT * FROM groceries WHERE category_id = ? AND id != ? AND in_stock = 1 ORDER BY sort LIMIT 8')
      .all(g.category_id, g.id) as GroceryRow[]
  ).map(toGroceryItem);
  const highlights = [
    { label: 'Pack size', value: g.unit },
    { label: 'Brand', value: g.brand },
    ...(g.shelf_life ? [{ label: 'Shelf life', value: g.shelf_life }] : []),
    ...(g.origin ? [{ label: 'Origin', value: g.origin }] : []),
  ];
  return { ...toGroceryItem(g), description: g.description, highlights, similar };
}

/** The dark store nearest to a point, and its delivery promise in minutes. */
export function nearestStore(db: DB, to: MapPoint): { store: StoreRow; etaMinutes: number } {
  const stores = db.prepare('SELECT * FROM stores').all() as StoreRow[];
  let best = stores[0]!;
  let bestKm = Infinity;
  for (const s of stores) {
    const km = distanceKm({ x: s.x, y: s.y }, to);
    if (km < bestKm) {
      best = s;
      bestKm = km;
    }
  }
  // Two minutes to pack, then about two minutes per km on an e-scooter.
  return { store: best, etaMinutes: Math.max(6, Math.min(15, Math.round(2 + bestKm * 2.2))) };
}
