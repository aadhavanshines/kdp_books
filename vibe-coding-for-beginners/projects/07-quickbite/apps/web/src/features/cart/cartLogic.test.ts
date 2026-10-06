import { MAX_QTY_PER_ITEM, type MenuItem, type Restaurant } from '@quickbite/core';
import { describe, expect, it } from 'vitest';
import {
  addItem,
  displaySubtotal,
  emptyCart,
  itemCount,
  replaceWith,
  setQty,
  syncWithQuote,
  type CartState,
} from './cartLogic';

const restaurant = (id: string) =>
  ({ id, slug: id, brandId: `b-${id}`, name: id, imageUrl: '', locality: 'X' }) as Restaurant;
const item = (id: string, restaurantId = 'r1', price = 10000) =>
  ({ id, restaurantId, name: id, price, isVeg: true, imageUrl: null }) as MenuItem;

const added = (state: CartState, r: Restaurant, i: MenuItem) => {
  const result = addItem(state, r, i);
  if (result.status === 'conflict') throw new Error('conflict');
  return result.state;
};

describe('cart', () => {
  it('adds items and increments quantity', () => {
    let s = added(emptyCart, restaurant('r1'), item('a'));
    s = added(s, restaurant('r1'), item('a'));
    s = added(s, restaurant('r1'), item('b', 'r1', 5000));
    expect(s.restaurant?.id).toBe('r1');
    expect(itemCount(s)).toBe(3);
    expect(displaySubtotal(s)).toBe(25000);
  });

  it('refuses items from a second restaurant until the customer replaces the cart', () => {
    const s = added(emptyCart, restaurant('r1'), item('a'));
    expect(addItem(s, restaurant('r2'), item('z', 'r2'))).toEqual({ status: 'conflict' });
    const replaced = replaceWith(restaurant('r2'), item('z', 'r2'));
    expect(replaced.restaurant?.id).toBe('r2');
    expect(replaced.lines.map((l) => l.itemId)).toEqual(['z']);
  });

  it('caps quantities', () => {
    let s = added(emptyCart, restaurant('r1'), item('a'));
    s = setQty(s, 'a', 99);
    expect(s.lines[0]!.qty).toBe(MAX_QTY_PER_ITEM);
    expect(addItem(s, restaurant('r1'), item('a')).status).toBe('max');
  });

  it('removes a line at zero and forgets the restaurant when empty', () => {
    const s = setQty(added(emptyCart, restaurant('r1'), item('a')), 'a', 0);
    expect(s).toEqual(emptyCart);
  });

  it('takes prices from the server quote and drops unavailable items', () => {
    let s = added(emptyCart, restaurant('r1'), item('a'));
    s = added(s, restaurant('r1'), item('b'));
    const { state, changed } = syncWithQuote(
      s,
      [{ itemId: 'a', unitPrice: 12000, name: 'a' }],
      ['b'],
    );
    expect(changed).toBe(true);
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]!.price).toBe(12000);
    expect(syncWithQuote(state, [{ itemId: 'a', unitPrice: 12000, name: 'a' }], []).changed).toBe(
      false,
    );
  });
});
