import { describe, expect, it } from 'vitest';
import { BRANDS } from './brands.ts';
import { buildCatalog } from './catalog.ts';
import { DISH_IMAGES } from './images.ts';

const catalog = buildCatalog();

describe('seed catalog', () => {
  it('is deterministic', () => {
    expect(buildCatalog()).toEqual(catalog);
  });

  it('has unique ids and slugs', () => {
    const unique = (list: string[]) => new Set(list).size === list.length;
    expect(unique(catalog.restaurants.map((r) => r.id))).toBe(true);
    expect(unique(catalog.restaurants.map((r) => r.slug))).toBe(true);
    expect(unique(catalog.items.map((i) => i.id))).toBe(true);
    expect(unique(catalog.coupons.map((c) => c.code))).toBe(true);
  });

  it('gives every area a healthy choice of open restaurants', () => {
    for (const area of catalog.areas) {
      const open = catalog.restaurants.filter((r) => r.areaIds.includes(area.id) && r.isOpen);
      expect(open.length, area.name).toBeGreaterThanOrEqual(10);
    }
  });

  it('places every restaurant within delivery range of its area', () => {
    for (const r of catalog.restaurants) {
      const area = catalog.areas.find((a) => a.id === r.areaIds[0])!;
      const km = Math.hypot(
        (r.lat - area.lat) * 111,
        (r.lng - area.lng) * 111 * Math.cos((area.lat * Math.PI) / 180),
      );
      expect(km).toBeLessThan(3);
    }
  });

  it('stores prices as whole paise', () => {
    for (const item of catalog.items) {
      expect(Number.isInteger(item.price) && item.price > 0, item.name).toBe(true);
    }
  });

  it('backs every restaurant offer with a real coupon of the same brand', () => {
    for (const r of catalog.restaurants.filter((r) => r.offer)) {
      const coupon = catalog.coupons.find((c) => c.code === r.offer!.couponCode);
      expect(coupon?.brandId).toBe(r.brandId);
    }
  });

  it('only references images that exist in the image registry', () => {
    const keys = new Set(Object.keys(DISH_IMAGES));
    for (const brand of BRANDS) {
      expect(keys.has(brand.cover.hero)).toBe(true);
      for (const item of brand.menu.flatMap((c) => c.items))
        if (item.image) expect(keys.has(item.image), item.name).toBe(true);
    }
  });
});
