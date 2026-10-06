/**
 * Turns the seed catalog into Firestore documents (path + data). Pure, so the
 * layout is unit-tested; the loader script only writes what this returns.
 *
 * Layout (docs/PLAN.md §2):
 *   regions/{id}, areas/{id}, restaurants/{id},
 *   restaurants/{id}/categories/{id}, restaurants/{id}/menuItems/{id},
 *   coupons/{code} (server-only), publicCoupons/{code} (what customers see)
 */
import { searchTokens } from '@quickbite/core';
import type { Catalog } from './catalog.ts';

export interface SeedDoc {
  path: string;
  data: Record<string, unknown>;
}

/** Firestore document ids can't contain "/". Seed ids never do, but fail loudly if one ever does. */
function id(value: string): string {
  if (value.includes('/')) throw new Error(`Invalid document id: ${value}`);
  return value;
}

export function firestoreSeedDocs(catalog: Catalog): SeedDoc[] {
  const docs: SeedDoc[] = [];
  for (const region of catalog.regions)
    docs.push({ path: `regions/${id(region.id)}`, data: { ...region } });
  for (const area of catalog.areas) docs.push({ path: `areas/${id(area.id)}`, data: { ...area } });
  for (const r of catalog.restaurants) {
    docs.push({ path: `restaurants/${id(r.id)}`, data: { ...r } });
  }
  for (const c of catalog.categories) {
    docs.push({ path: `restaurants/${id(c.restaurantId)}/categories/${id(c.id)}`, data: { ...c } });
  }
  catalog.items.forEach((item, position) => {
    docs.push({
      path: `restaurants/${id(item.restaurantId)}/menuItems/${id(item.id)}`,
      // `position` keeps the menu in its original order (document ids sort alphabetically).
      data: { ...item, position, searchTokens: searchTokens(item.name) },
    });
  });
  for (const coupon of catalog.coupons) {
    docs.push({ path: `coupons/${id(coupon.code)}`, data: { ...coupon } });
    if (coupon.active) docs.push({ path: `publicCoupons/${id(coupon.code)}`, data: { ...coupon } });
  }
  return docs;
}
