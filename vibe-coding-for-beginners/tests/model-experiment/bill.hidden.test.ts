import { describe, it, expect } from 'vitest';
import { computeBill } from '../src/bill';

const menu = [
  { id: 'a', restaurantId: 'r1', pricePaise: 24900, available: true },
  { id: 'b', restaurantId: 'r1', pricePaise: 9900, available: true },
  { id: 'd', restaurantId: 'r1', pricePaise: 50000, available: true },
  { id: 'e', restaurantId: 'r1', pricePaise: 49900, available: true },
  { id: 'f', restaurantId: 'r1', pricePaise: 15099, available: true },
  { id: 'u', restaurantId: 'r1', pricePaise: 15000, available: false },
  { id: 'x', restaurantId: 'r2', pricePaise: 20000, available: true },
];
const NOON = new Date('2026-10-06T08:00:00Z'); // 13:30 in India
const bill = (cart: [string, number][], over: Record<string, unknown> = {}) =>
  computeBill({ cart: cart.map(([itemId, quantity]) => ({ itemId, quantity })), menu,
    distanceKm: 2, isFirstOrder: false, orderTime: NOON, ...over } as any);

describe('totals', () => {
  it('basic order', () => expect(bill([['a', 1], ['b', 1]])).toMatchObject(
    { itemTotal: 34800, discount: 0, deliveryFee: 2500, smallOrderFee: 0, lateNightFee: 0, gstOnFood: 1740, gstOnFees: 450, grandTotal: 39490 }));
  it('adds repeated lines and gives free delivery from Rs 499', () => expect(bill([['a', 1], ['a', 2]])).toMatchObject(
    { itemTotal: 74700, deliveryFee: 0, gstOnFood: 3735, gstOnFees: 0, grandTotal: 78435 }));
  it('small order fee', () => expect(bill([['b', 1]], { distanceKm: 1 })).toMatchObject(
    { itemTotal: 9900, deliveryFee: 2500, smallOrderFee: 2000, gstOnFood: 495, gstOnFees: 810, grandTotal: 15705 }));
  it('no coupon error for a blank code', () => expect(bill([['a', 1]], { couponCode: '   ' }).couponError).toBeUndefined());
});

describe('delivery fee', () => {
  it.each([[3, 2500], [3.2, 3300], [4, 3300], [6.5, 5700], [7, 5700], [0.5, 2500]])('%s km', (km, fee) =>
    expect(bill([['a', 1]], { distanceKm: km }).deliveryFee).toBe(fee));
  it('3.2 km full bill', () => expect(bill([['a', 1]], { distanceKm: 3.2 })).toMatchObject({ gstOnFood: 1245, gstOnFees: 594, grandTotal: 30039 }));
  it('too far', () => expect(() => bill([['a', 1]], { distanceKm: 7.01 })).toThrow('TOO_FAR'));
  it('free delivery uses the total before discount', () =>
    expect(bill([['e', 1]], { distanceKm: 5, couponCode: 'FLAT75' })).toMatchObject(
      { itemTotal: 49900, discount: 7500, deliveryFee: 0, gstOnFood: 2120, gstOnFees: 0, grandTotal: 44520 }));
});

describe('coupons', () => {
  it('WELCOME50 is capped at Rs 100', () => expect(bill([['d', 1]], { couponCode: 'WELCOME50', isFirstOrder: true })).toMatchObject(
    { discount: 10000, deliveryFee: 0, gstOnFood: 2000, grandTotal: 42000 }));
  it('WELCOME50 rounds down; GST rounds half up', () =>
    expect(bill([['f', 1]], { couponCode: 'WELCOME50', isFirstOrder: true, distanceKm: 1 })).toMatchObject(
      { itemTotal: 15099, discount: 7549, smallOrderFee: 0, gstOnFood: 378, gstOnFees: 450, grandTotal: 10878 }));
  it('WELCOME50 only on the first order', () => expect(bill([['a', 1]], { couponCode: 'WELCOME50' })).toMatchObject(
    { discount: 0, couponError: 'NOT_ELIGIBLE', grandTotal: 29095 }));
  it('WELCOME50 minimum order', () => expect(bill([['b', 1]], { couponCode: 'WELCOME50', isFirstOrder: true, distanceKm: 1 })).toMatchObject(
    { discount: 0, couponError: 'MIN_ORDER', grandTotal: 15705 }));
  it('codes ignore case and spaces', () => expect(bill([['a', 2]], { couponCode: '  flat75 ' })).toMatchObject(
    { itemTotal: 49800, discount: 7500, deliveryFee: 2500, gstOnFood: 2115, gstOnFees: 450, grandTotal: 47365 }));
  it('FLAT75 minimum order', () => expect(bill([['a', 1]], { couponCode: 'FLAT75' })).toMatchObject({ discount: 0, couponError: 'MIN_ORDER' }));
  it('FREEDEL', () => expect(bill([['a', 1]], { couponCode: 'freedel', distanceKm: 5 })).toMatchObject(
    { deliveryFee: 0, discount: 0, gstOnFood: 1245, gstOnFees: 0, grandTotal: 26145 }));
  it('FREEDEL minimum order', () => expect(bill([['b', 2]], { couponCode: 'FREEDEL', distanceKm: 1 })).toMatchObject(
    { itemTotal: 19800, deliveryFee: 2500, smallOrderFee: 0, couponError: 'MIN_ORDER', grandTotal: 23740 }));
  it('unknown code', () => expect(bill([['a', 1]], { couponCode: 'SAVE10' })).toMatchObject({ couponError: 'INVALID_CODE', discount: 0 }));
});

describe('late-night fee uses India time, whatever the server time zone', () => {
  it.each([
    ['2026-10-06T17:30:00Z', 1500], // 23:00 IST
    ['2026-10-06T20:00:00Z', 1500], // 01:30 IST
    ['2026-10-07T00:29:59Z', 1500], // 05:59:59 IST
    ['2026-10-07T00:30:00Z', 0],    // 06:00 IST
    ['2026-10-06T17:29:59Z', 0],    // 22:59:59 IST
  ])('%s', (iso, fee) => expect(bill([['a', 1]], { orderTime: new Date(iso) }).lateNightFee).toBe(fee));
  it('full late-night bill', () => expect(bill([['a', 1]], { orderTime: new Date('2026-10-06T17:30:00Z') })).toMatchObject(
    { gstOnFees: 720, grandTotal: 30865 }));
});

describe('errors', () => {
  it('unknown item', () => expect(() => bill([['zz', 1]])).toThrow('UNKNOWN_ITEM'));
  it('unavailable item', () => expect(() => bill([['u', 1]])).toThrow('ITEM_UNAVAILABLE'));
  it.each([0, 21, 1.5, -1])('bad quantity %s', (q) => expect(() => bill([['a', q]])).toThrow('BAD_QUANTITY'));
  it('mixed restaurants', () => expect(() => bill([['a', 1], ['x', 1]])).toThrow('MIXED_RESTAURANTS'));
  it('empty cart', () => expect(() => bill([])).toThrow('EMPTY_CART'));
});
