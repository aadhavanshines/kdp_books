import { describe, expect, it } from 'vitest';
import { matchScore, normalizeText, searchCatalog } from './search';
import { restaurant } from './testFixtures';
import type { MenuItem } from './types';

const item = (overrides: Partial<MenuItem>): MenuItem => ({
  id: 'i',
  restaurantId: 'r1',
  categoryId: 'c',
  name: 'Dish',
  description: '',
  price: 10000,
  isVeg: true,
  imageUrl: null,
  isAvailable: true,
  isBestseller: false,
  ...overrides,
});

describe('search', () => {
  it('normalises text', () => {
    expect(normalizeText('  Crème  Brûlée! ')).toBe('creme brulee');
  });

  it('scores exact, prefix and word-prefix matches', () => {
    expect(matchScore('Biryani', 'biryani')).toBe(100);
    expect(matchScore('Biryani House', 'bir')).toBe(80);
    expect(matchScore('Hyderabadi Chicken Biryani', 'chick biry')).toBe(60);
    expect(matchScore('Paneer Tikka', 'pizza')).toBe(0);
    expect(matchScore('anything', '  ')).toBe(0);
  });

  it('finds restaurants by name or cuisine and dishes by name', () => {
    const rs = [
      restaurant({ id: 'r1', name: 'Biryani Blues', cuisines: ['Biryani'] }),
      restaurant({ id: 'r2', name: 'Dosa Plaza', cuisines: ['South Indian'] }),
    ];
    const items = [
      item({ id: 'd1', restaurantId: 'r1', name: 'Chicken Dum Biryani' }),
      item({ id: 'd2', restaurantId: 'r2', name: 'Masala Dosa' }),
      item({ id: 'd3', restaurantId: 'r2', name: 'Biryani Rice Bowl', isAvailable: false }),
    ];
    const results = searchCatalog('biryani', rs, items);
    expect(results.restaurants.map((h) => h.restaurant.id)).toEqual(['r1']);
    expect(results.dishes.map((h) => h.item.id)).toEqual(['d1']);
    expect(searchCatalog('south', rs, items).restaurants.map((h) => h.restaurant.id)).toEqual([
      'r2',
    ]);
  });
});
