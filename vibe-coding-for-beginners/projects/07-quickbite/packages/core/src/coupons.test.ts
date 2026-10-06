import { describe, expect, it } from 'vitest';
import { evaluateCoupon, normalizeCouponCode } from './coupons';
import { coupon } from './testFixtures';

const ctx = {
  itemTotal: 50000,
  brandId: 'b1',
  regionId: 'IN',
  now: new Date('2026-10-06T12:00:00Z'),
  userRedemptions: 0,
};

describe('evaluateCoupon', () => {
  it('applies a percent discount capped at maxDiscount', () => {
    expect(evaluateCoupon(coupon(), ctx)).toEqual({
      ok: true,
      discount: 10000,
      freeDelivery: false,
    });
    expect(evaluateCoupon(coupon(), { ...ctx, itemTotal: 19900 })).toMatchObject({
      discount: 9950,
    });
  });

  it('applies a flat discount but never more than the item total', () => {
    const flat = coupon({ type: 'flat', value: 30000, maxDiscount: null, minOrder: 0 });
    expect(evaluateCoupon(flat, { ...ctx, itemTotal: 20000 })).toMatchObject({ discount: 20000 });
  });

  it('gives free delivery', () => {
    expect(evaluateCoupon(coupon({ type: 'free_delivery' }), ctx)).toEqual({
      ok: true,
      discount: 0,
      freeDelivery: true,
    });
  });

  it('says how much more to add when below the minimum order', () => {
    expect(evaluateCoupon(coupon(), { ...ctx, itemTotal: 15000 })).toEqual({
      ok: false,
      reason: 'MIN_ORDER',
      shortBy: 4900,
    });
  });

  it.each([
    [{ active: false }, 'INACTIVE'],
    [{ validFrom: '2030-01-01T00:00:00Z' }, 'NOT_STARTED'],
    [{ validTo: '2021-01-01T00:00:00Z' }, 'EXPIRED'],
    [{ regionId: 'GB' }, 'WRONG_REGION'],
    [{ brandId: 'other' }, 'WRONG_RESTAURANT'],
  ] as const)('rejects %o with %s', (overrides, reason) => {
    expect(evaluateCoupon(coupon(overrides), ctx)).toMatchObject({ ok: false, reason });
  });

  it('enforces the per-user limit', () => {
    expect(evaluateCoupon(coupon(), { ...ctx, userRedemptions: 1 })).toMatchObject({
      reason: 'USAGE_LIMIT',
    });
  });

  it('normalises codes', () => {
    expect(normalizeCouponCode('  welcome50 ')).toBe('WELCOME50');
  });
});
