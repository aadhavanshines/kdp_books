/**
 * Pure cart rules (no React, no storage) so they are easy to test.
 *
 * The cart keeps names and prices only to *display* them. When ordering, the
 * backend receives item ids and quantities and looks prices up itself.
 */
import { MAX_QTY_PER_ITEM, type MenuItem, type Restaurant } from '@quickbite/core';

export interface CartLine {
  itemId: string;
  name: string;
  price: number;
  isVeg: boolean;
  imageUrl: string | null;
  qty: number;
}

export interface CartRestaurant {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  imageUrl: string;
  locality: string;
}

export interface CartState {
  restaurant: CartRestaurant | null;
  lines: CartLine[];
  couponCode: string | null;
  note: string;
}

export const emptyCart: CartState = { restaurant: null, lines: [], couponCode: null, note: '' };

export type AddResult =
  | { status: 'added'; state: CartState }
  | { status: 'conflict' }
  | { status: 'max'; state: CartState };

export function toCartRestaurant(r: Restaurant): CartRestaurant {
  return {
    id: r.id,
    slug: r.slug,
    brandId: r.brandId,
    name: r.name,
    imageUrl: r.imageUrl,
    locality: r.locality,
  };
}

/** Adds one of an item. Items from a different restaurant are a conflict: one restaurant per cart. */
export function addItem(state: CartState, restaurant: Restaurant, item: MenuItem): AddResult {
  if (state.restaurant && state.restaurant.id !== restaurant.id && state.lines.length > 0)
    return { status: 'conflict' };
  const base: CartState =
    state.restaurant?.id === restaurant.id
      ? state
      : { ...emptyCart, restaurant: toCartRestaurant(restaurant) };
  const existing = base.lines.find((l) => l.itemId === item.id);
  if (existing) {
    if (existing.qty >= MAX_QTY_PER_ITEM) return { status: 'max', state: base };
    return { status: 'added', state: setQty(base, item.id, existing.qty + 1) };
  }
  const line: CartLine = {
    itemId: item.id,
    name: item.name,
    price: item.price,
    isVeg: item.isVeg,
    imageUrl: item.imageUrl,
    qty: 1,
  };
  return {
    status: 'added',
    state: { ...base, restaurant: toCartRestaurant(restaurant), lines: [...base.lines, line] },
  };
}

/** Empties the cart and starts a new one with this item (after the customer agrees). */
export function replaceWith(restaurant: Restaurant, item: MenuItem): CartState {
  const result = addItem(emptyCart, restaurant, item);
  return result.status === 'conflict' ? emptyCart : result.state;
}

/** Sets a quantity, clamped to 0..MAX. Zero removes the line; an empty cart forgets its restaurant. */
export function setQty(state: CartState, itemId: string, qty: number): CartState {
  const clamped = Math.max(0, Math.min(MAX_QTY_PER_ITEM, Math.floor(qty)));
  const lines =
    clamped === 0
      ? state.lines.filter((l) => l.itemId !== itemId)
      : state.lines.map((l) => (l.itemId === itemId ? { ...l, qty: clamped } : l));
  return lines.length === 0 ? emptyCart : { ...state, lines };
}

/** Updates displayed prices/names from a server quote and drops lines the server no longer sells. */
export function syncWithQuote(
  state: CartState,
  quoteLines: { itemId: string; unitPrice: number; name: string }[],
  unavailable: string[],
): { state: CartState; changed: boolean } {
  let changed = false;
  const byId = new Map(quoteLines.map((l) => [l.itemId, l]));
  const lines = state.lines
    .filter((l) => {
      const keep = !unavailable.includes(l.itemId);
      if (!keep) changed = true;
      return keep;
    })
    .map((l) => {
      const q = byId.get(l.itemId);
      if (q && (q.unitPrice !== l.price || q.name !== l.name)) {
        changed = true;
        return { ...l, price: q.unitPrice, name: q.name };
      }
      return l;
    });
  if (!changed) return { state, changed };
  return { state: lines.length ? { ...state, lines } : emptyCart, changed };
}

export const itemCount = (state: CartState) => state.lines.reduce((n, l) => n + l.qty, 0);
export const displaySubtotal = (state: CartState) =>
  state.lines.reduce((n, l) => n + l.qty * l.price, 0);
export const qtyOf = (state: CartState, itemId: string) =>
  state.lines.find((l) => l.itemId === itemId)?.qty ?? 0;
