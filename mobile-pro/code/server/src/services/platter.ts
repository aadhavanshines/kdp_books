import type {
  ArtName,
  ArtTone,
  CustomizationGroup,
  DishResult,
  MapPoint,
  MenuCategory,
  MenuItem,
  Offer,
  Restaurant,
  RestaurantQuery,
  RestaurantSummary,
} from '@pro/api/types';

import type { DB } from '../db';
import { notFound } from '../lib/errors';
import { deliveryWindow, distanceKm } from '../lib/geo';
import { parseJson } from '../lib/json';

/** Where distances are measured from when signed out: Lake View, the demo home. */
export const DEFAULT_ORIGIN: MapPoint = { x: 400, y: 500 };

export interface RestaurantRow {
  id: string;
  name: string;
  art: string;
  tone: string;
  cuisines_json: string;
  tiles_json: string;
  rating: number;
  rating_count: number;
  cost_for_two: number;
  pure_veg: number;
  offer: string | null;
  offers_json: string;
  locality: string;
  address: string;
  x: number;
  y: number;
  hours: string;
  promoted: number;
  tags_json: string;
  sort: number;
}

export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  veg: number;
  bestseller: number;
  spice: number;
  rating: number | null;
  rating_count: number;
  art: string;
  available: number;
  customizations_json: string;
}

export function toRestaurantSummary(r: RestaurantRow, from: MapPoint): RestaurantSummary {
  const km = distanceKm({ x: r.x, y: r.y }, from);
  return {
    id: r.id,
    name: r.name,
    art: r.art as ArtName,
    tone: r.tone as ArtTone,
    cuisines: parseJson<string[]>(r.cuisines_json, []),
    rating: r.rating,
    ratingCount: r.rating_count,
    deliveryTime: deliveryWindow(km),
    costForTwo: r.cost_for_two,
    distanceKm: km,
    locality: r.locality,
    isPureVeg: r.pure_veg === 1,
    offer: r.offer,
    isPromoted: r.promoted === 1,
    isOpen: true,
    tags: parseJson<string[]>(r.tags_json, []),
  };
}

export function toMenuItem(m: MenuItemRow): MenuItem {
  return {
    id: m.id,
    restaurantId: m.restaurant_id,
    categoryId: m.category_id,
    name: m.name,
    description: m.description,
    price: m.price,
    isVeg: m.veg === 1,
    isBestseller: m.bestseller === 1,
    spiceLevel: m.spice,
    rating: m.rating,
    ratingCount: m.rating_count,
    art: m.art as ArtName,
    isAvailable: m.available === 1,
    customizations: parseJson<CustomizationGroup[]>(m.customizations_json, []),
  };
}

export function getRestaurantRow(db: DB, id: string): RestaurantRow {
  const row = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id) as RestaurantRow | undefined;
  if (!row) throw notFound('Restaurant');
  return row;
}

export function getMenuItemRow(db: DB, id: string): MenuItemRow {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItemRow | undefined;
  if (!row) throw notFound('Menu item');
  return row;
}

export function listRestaurants(db: DB, query: RestaurantQuery, from: MapPoint): RestaurantSummary[] {
  const rows = db.prepare('SELECT * FROM restaurants ORDER BY sort').all() as RestaurantRow[];
  const q = query.q?.trim().toLowerCase();
  let dishMatches: Set<string> | null = null;
  if (q) {
    dishMatches = new Set(
      (db.prepare('SELECT DISTINCT restaurant_id FROM menu_items WHERE lower(name) LIKE ?').all(`%${q}%`) as {
        restaurant_id: string;
      }[]).map((r) => r.restaurant_id),
    );
  }
  let list = rows
    .filter((r) => {
      if (query.cuisine && !parseJson<string[]>(r.tiles_json, []).includes(query.cuisine)) return false;
      if (q) {
        const hay = `${r.name} ${parseJson<string[]>(r.cuisines_json, []).join(' ')} ${r.locality}`.toLowerCase();
        if (!hay.includes(q) && !dishMatches?.has(r.id)) return false;
      }
      return true;
    })
    .map((r) => toRestaurantSummary(r, from))
    .filter((r) => {
      if (query.minRating != null && r.rating < query.minRating) return false;
      if (query.fast && r.deliveryTime.max > 30) return false;
      if (query.veg && !r.isPureVeg) return false;
      if (query.offers && !r.offer) return false;
      return true;
    });

  switch (query.sort) {
    case 'rating':
      list = list.sort((a, b) => b.rating - a.rating);
      break;
    case 'delivery_time':
      list = list.sort((a, b) => a.deliveryTime.min - b.deliveryTime.min);
      break;
    case 'cost_low':
      list = list.sort((a, b) => a.costForTwo - b.costForTwo);
      break;
    case 'cost_high':
      list = list.sort((a, b) => b.costForTwo - a.costForTwo);
      break;
    default:
      // Relevance: promoted first, then a blend of rating and closeness.
      list = list.sort(
        (a, b) =>
          Number(b.isPromoted) - Number(a.isPromoted) || b.rating * 10 - b.distanceKm - (a.rating * 10 - a.distanceKm),
      );
  }
  return list;
}

export function getRestaurant(db: DB, id: string, from: MapPoint): Restaurant {
  const row = getRestaurantRow(db, id);
  const categories = db
    .prepare('SELECT id, name FROM menu_categories WHERE restaurant_id = ? ORDER BY sort')
    .all(id) as { id: string; name: string }[];
  const items = (db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY sort').all(id) as MenuItemRow[]).map(
    toMenuItem,
  );
  const menu: MenuCategory[] = categories.map((c) => ({ id: c.id, name: c.name, items: items.filter((i) => i.categoryId === c.id) }));
  const bestsellers = items.filter((i) => i.isBestseller && i.isAvailable).slice(0, 8);
  if (bestsellers.length > 0) menu.unshift({ id: `${id}-recommended`, name: 'Recommended', items: bestsellers });
  return {
    ...toRestaurantSummary(row, from),
    address: row.address,
    location: { x: row.x, y: row.y },
    offers: parseJson<Offer[]>(row.offers_json, []),
    hours: row.hours,
    menu,
  };
}

export function searchPlatter(db: DB, q: string, from: MapPoint): { restaurants: RestaurantSummary[]; dishes: DishResult[] } {
  const term = q.trim().toLowerCase();
  if (!term) return { restaurants: [], dishes: [] };
  const restaurants = listRestaurants(db, { q: term }, from);
  const dishes = (
    db
      .prepare(
        `SELECT m.*, r.name AS restaurant_name FROM menu_items m JOIN restaurants r ON r.id = m.restaurant_id
         WHERE lower(m.name) LIKE ? OR lower(m.description) LIKE ? ORDER BY m.bestseller DESC, m.rating_count DESC LIMIT 30`,
      )
      .all(`%${term}%`, `%${term}%`) as (MenuItemRow & { restaurant_name: string })[]
  ).map((m) => ({ ...toMenuItem(m), restaurantName: m.restaurant_name }));
  return { restaurants, dishes };
}
