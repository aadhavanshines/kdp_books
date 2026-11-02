import { describe, expect, it } from 'vitest';
import type { Coupon } from '@pro/api/types';

import { amountToFreeDelivery, computeBill, evaluateCoupon, refundFor } from './pricing';

const NOW = Date.parse('2026-10-31T08:00:00Z');
const coupon = (over: Partial<Coupon>): Coupon => ({
  code: 'X',
  app: 'platter',
  title: '',
  description: '',
  kind: 'flat',
  value: 100,
  maxDiscount: null,
  minOrder: 0,
  restaurantId: null,
  expiresAt: new Date(NOW + 86_400_000).toISOString(),
  ...over,
});

describe('evaluateCoupon', () => {
  it('applies flat and capped percent discounts', () => {
    expect(evaluateCoupon(coupon({ kind: 'flat', value: 125 }), 600, { app: 'platter', now: NOW }).discount).toBe(125);
    expect(evaluateCoupon(coupon({ kind: 'percent', value: 50, maxDiscount: 100 }), 600, { app: 'platter', now: NOW }).discount).toBe(100);
    expect(evaluateCoupon(coupon({ kind: 'percent', value: 50, maxDiscount: 100 }), 150, { app: 'platter', now: NOW }).discount).toBe(75);
  });

  it('never discounts more than the item total', () => {
    expect(evaluateCoupon(coupon({ value: 500 }), 200, { app: 'platter', now: NOW }).discount).toBe(200);
  });

  it('explains why a coupon does not apply', () => {
    expect(evaluateCoupon(coupon({ minOrder: 499 }), 379, { app: 'platter', now: NOW }).reason).toBe('Add ₹120 more to apply');
    expect(evaluateCoupon(coupon({ app: 'cartly' }), 999, { app: 'platter', now: NOW }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ expiresAt: new Date(NOW - 1).toISOString() }), 999, { app: 'platter', now: NOW }).reason).toBe(
      'This coupon has expired',
    );
    expect(evaluateCoupon(coupon({ restaurantId: 'r-01' }), 999, { app: 'platter', restaurantId: 'r-02', now: NOW }).ok).toBe(false);
  });
});

describe('computeBill', () => {
  it('builds a Platter bill with distance-based delivery, platform fee and 5% GST after discount', () => {
    const bill = computeBill(
      { app: 'platter', lines: [{ unitPrice: 250, mrp: null, quantity: 2 }], coupon: coupon({ value: 100 }), tip: 30, distanceKm: 2 },
      NOW,
    );
    expect(bill).toMatchObject({ itemTotal: 500, deliveryFee: 31, platformFee: 6, couponDiscount: 100, taxes: 20, tip: 30 });
    expect(bill.total).toBe(500 + 31 + 6 + 20 - 100 + 30);
    expect(bill.savings).toBe(100);
  });

  it('waives delivery for a free-delivery coupon and counts it as savings', () => {
    const bill = computeBill(
      { app: 'platter', lines: [{ unitPrice: 300, mrp: null, quantity: 1 }], coupon: coupon({ kind: 'free_delivery', minOrder: 199 }), tip: 0, distanceKm: 3 },
      NOW,
    );
    expect(bill.deliveryFee).toBe(0);
    expect(bill.deliveryFeeWaived).toBe(37);
    expect(bill.savings).toBe(37);
  });

  it('applies Minutely small-cart, handling and free-delivery rules', () => {
    const small = computeBill({ app: 'minutely', lines: [{ unitPrice: 40, mrp: 50, quantity: 2 }], coupon: null, tip: 0 }, NOW);
    expect(small).toMatchObject({ itemTotal: 80, mrpTotal: 100, deliveryFee: 30, handlingFee: 4, smallCartFee: 15, total: 129, savings: 20 });
    const big = computeBill({ app: 'minutely', lines: [{ unitPrice: 100, mrp: 120, quantity: 2 }], coupon: null, tip: 20 }, NOW);
    expect(big).toMatchObject({ deliveryFee: 0, deliveryFeeWaived: 30, smallCartFee: 0, total: 224, savings: 70 });
  });

  it('charges Cartly delivery under ₹499 only', () => {
    expect(computeBill({ app: 'cartly', lines: [{ unitPrice: 399, mrp: 799, quantity: 1 }], coupon: null, tip: 0 }, NOW).deliveryFee).toBe(40);
    expect(computeBill({ app: 'cartly', lines: [{ unitPrice: 599, mrp: 999, quantity: 1 }], coupon: null, tip: 0 }, NOW).deliveryFee).toBe(0);
  });

  it('is all zeros for an empty cart', () => {
    const bill = computeBill({ app: 'platter', lines: [], coupon: null, tip: 50 }, NOW);
    expect(bill.total).toBe(0);
    expect(bill.tip).toBe(0);
  });

  it('reports how much more is needed for free delivery', () => {
    expect(amountToFreeDelivery('minutely', 150)).toBe(49);
    expect(amountToFreeDelivery('minutely', 250)).toBeNull();
    expect(amountToFreeDelivery('cartly', 400)).toBe(99);
    expect(amountToFreeDelivery('platter', 100)).toBeNull();
  });
});

describe('first-order coupons', () => {
  it('apply only before the first order', () => {
    const first = coupon({ firstOrderOnly: true });
    expect(evaluateCoupon(first, 600, { app: 'platter', now: NOW, hasOrdered: false }).ok).toBe(true);
    const again = evaluateCoupon(first, 600, { app: 'platter', now: NOW, hasOrdered: true });
    expect(again).toMatchObject({ ok: false, reason: 'Valid on your first order only', discount: 0 });
    expect(evaluateCoupon(coupon({}), 600, { app: 'platter', now: NOW, hasOrdered: true }).ok).toBe(true);
  });
});

describe('refundFor', () => {
  const bill = { itemTotal: 1000, couponDiscount: 200, total: 830 };
  it('refunds the returned share of what was paid for items, after the coupon', () => {
    expect(refundFor(bill, 500, 0)).toBe(400);
    expect(refundFor({ itemTotal: 1000, couponDiscount: 0, total: 1000 }, 250, 0)).toBe(250);
  });
  it('never refunds more than is left of the order total', () => {
    expect(refundFor(bill, 1000, 700)).toBe(130);
    expect(refundFor(bill, 1000, 830)).toBe(0);
  });
  it('refunds nothing for nothing', () => {
    expect(refundFor(bill, 0, 0)).toBe(0);
    expect(refundFor({ itemTotal: 0, couponDiscount: 0, total: 0 }, 100, 0)).toBe(0);
  });
});
