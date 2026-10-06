import { describe, expect, it } from 'vitest';
import { buildCatalog } from './catalog.ts';
import { firestoreSeedDocs } from './firestoreDocs.ts';

describe('firestoreSeedDocs', () => {
  const catalog = buildCatalog();
  const docs = firestoreSeedDocs(catalog);
  const paths = new Set(docs.map((d) => d.path));

  it('writes one document per catalog entry with unique paths', () => {
    expect(paths.size).toBe(docs.length);
    expect(
      docs.filter((d) => d.path.startsWith('restaurants/') && d.path.split('/').length === 2),
    ).toHaveLength(catalog.restaurants.length);
    expect(docs.filter((d) => d.path.includes('/menuItems/'))).toHaveLength(catalog.items.length);
  });

  it('nests menus under their restaurant and adds search tokens', () => {
    const item = catalog.items.find((i) => i.name === 'Butter Chicken')!;
    const doc = docs.find(
      (d) => d.path === `restaurants/${item.restaurantId}/menuItems/${item.id}`,
    )!;
    expect(doc.data.searchTokens).toEqual(expect.arrayContaining(['bu', 'butter', 'chicken']));
  });

  it('keeps coupons server-only and publishes a public copy of active ones', () => {
    expect(paths.has('coupons/WELCOME50')).toBe(true);
    expect(paths.has('publicCoupons/WELCOME50')).toBe(true);
  });
});
