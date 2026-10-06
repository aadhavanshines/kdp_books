import { describe, expect, it } from 'vitest';
import { activeFilterCount, filterRestaurants } from './restaurants';
import { restaurant } from './testFixtures';

const list = [
  restaurant({ id: 'slow', rating: 4.6, deliveryTimeMax: 45, costForTwo: 60000 }),
  restaurant({
    id: 'veg',
    rating: 4.1,
    isPureVeg: true,
    deliveryTimeMax: 25,
    costForTwo: 20000,
    cuisines: ['South Indian'],
  }),
  restaurant({
    id: 'low',
    rating: 3.8,
    deliveryTimeMax: 20,
    offer: { headline: '20% OFF', subline: 'UPTO ₹50' },
  }),
  restaurant({ id: 'closed', rating: 4.9, isOpen: false }),
];
const ids = (rs: { id: string }[]) => rs.map((r) => r.id);

describe('filterRestaurants', () => {
  it('filters by each chip', () => {
    expect(ids(filterRestaurants(list, { ratingFourPlus: true }, 'rating'))).toEqual([
      'slow',
      'veg',
      'closed',
    ]);
    expect(ids(filterRestaurants(list, { pureVeg: true }))).toEqual(['veg']);
    expect(ids(filterRestaurants(list, { fastDelivery: true }, 'deliveryTime'))).toEqual([
      'low',
      'veg',
      'closed',
    ]);
    expect(ids(filterRestaurants(list, { offers: true }))).toEqual(['low']);
    expect(ids(filterRestaurants(list, { cuisine: 'south indian' }))).toEqual(['veg']);
  });

  it('combines filters and keeps closed restaurants last', () => {
    expect(ids(filterRestaurants(list, { ratingFourPlus: true, fastDelivery: true }))).toEqual([
      'veg',
      'closed',
    ]);
  });

  it('sorts by cost', () => {
    expect(ids(filterRestaurants(list, {}, 'costLowToHigh'))[0]).toBe('veg');
    expect(ids(filterRestaurants(list, {}, 'costHighToLow'))[0]).toBe('slow');
  });

  it('counts active filters', () => {
    expect(activeFilterCount({ pureVeg: true, cuisine: 'Pizza', offers: false })).toBe(2);
  });
});
