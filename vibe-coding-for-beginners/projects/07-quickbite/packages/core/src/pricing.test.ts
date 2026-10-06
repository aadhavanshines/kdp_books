import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { deliveryFeeFor, MIN_ORDER_TOTAL, priceOrder } from './pricing';
import { coupon, india } from './testFixtures';

const now = new Date('2026-10-06T12:00:00Z');
const base = { region: india, brandId: 'b1', distanceKm: 2, now };

describe('priceOrder', () => {
  it('builds a full bill', () => {
    const result = priceOrder({
      ...base,
      lines: [
        { itemId: 'a', unitPrice: 24900, qty: 2 },
        { itemId: 'b', unitPrice: 9900, qty: 1 },
      ],
    });
    expect(result).toEqual({
      ok: true,
      bill: {
        currency: 'INR',
        itemTotal: 59700,
        discount: 0,
        deliveryFee: 2500,
        deliveryFeeBeforeDiscount: 2500,
        platformFee: 500,
        foodTax: 2985, // 5% of 597.00
        feeTax: 540, // 18% of 30.00
        taxes: 3525,
        grandTotal: 59700 + 2500 + 500 + 2985 + 540,
        savings: 0,
        appliedCouponCode: null,
        couponRejection: null,
      },
    });
  });

  it('taxes food after the discount', () => {
    const result = priceOrder({
      ...base,
      lines: [{ itemId: 'a', unitPrice: 50000, qty: 1 }],
      coupon: coupon(),
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.bill.discount).toBe(10000);
    expect(result.bill.foodTax).toBe(2000); // 5% of 400.00
    expect(result.bill.appliedCouponCode).toBe('WELCOME50');
    expect(result.bill.savings).toBe(10000);
  });

  it('waives delivery with a free-delivery coupon and reports the savings', () => {
    const result = priceOrder({
      ...base,
      distanceKm: 5,
      lines: [{ itemId: 'a', unitPrice: 30000, qty: 1 }],
      coupon: coupon({ type: 'free_delivery', code: 'FREEDEL' }),
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.bill.deliveryFee).toBe(0);
    expect(result.bill.deliveryFeeBeforeDiscount).toBe(4000);
    expect(result.bill.feeTax).toBe(90); // 18% of the ₹5 platform fee only
    expect(result.bill.savings).toBe(4000);
  });

  it('keeps the bill but explains a rejected coupon', () => {
    const result = priceOrder({
      ...base,
      lines: [{ itemId: 'a', unitPrice: 10000, qty: 1 }],
      coupon: coupon(),
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.bill.discount).toBe(0);
    expect(result.bill.couponRejection).toEqual({ reason: 'MIN_ORDER', shortBy: 9900 });
  });

  it('rejects empty carts, bad quantities and far addresses', () => {
    expect(priceOrder({ ...base, lines: [] })).toEqual({ ok: false, error: 'EMPTY_CART' });
    expect(priceOrder({ ...base, lines: [{ itemId: 'a', unitPrice: 100, qty: 0 }] })).toEqual({
      ok: false,
      error: 'INVALID_QUANTITY',
    });
    expect(
      priceOrder({ ...base, lines: [{ itemId: 'a', unitPrice: 100, qty: 21 }] }),
    ).toMatchObject({
      error: 'INVALID_QUANTITY',
    });
    expect(
      priceOrder({ ...base, distanceKm: 9, lines: [{ itemId: 'a', unitPrice: 100, qty: 1 }] }),
    ).toEqual({
      ok: false,
      error: 'NOT_DELIVERABLE',
    });
  });

  it('picks delivery bands inclusively', () => {
    expect(deliveryFeeFor(india, 3)).toBe(2500);
    expect(deliveryFeeFor(india, 3.01)).toBe(4000);
    expect(deliveryFeeFor(india, 8)).toBe(5500);
  });

  it('always produces a consistent, payable bill (property test)', () => {
    const line = fc.record({
      itemId: fc.string({ minLength: 1, maxLength: 5 }),
      unitPrice: fc.integer({ min: 0, max: 500_000 }),
      qty: fc.integer({ min: 1, max: 20 }),
    });
    const maybeCoupon = fc.option(
      fc.record({
        type: fc.constantFrom('percent', 'flat', 'free_delivery' as const),
        value: fc.integer({ min: 0, max: 100_000 }),
        maxDiscount: fc.option(fc.integer({ min: 0, max: 100_000 })),
        minOrder: fc.integer({ min: 0, max: 100_000 }),
      }),
    );
    fc.assert(
      fc.property(
        fc.array(line, { minLength: 1, maxLength: 10 }),
        fc.double({ min: 0, max: 8, noNaN: true }),
        maybeCoupon,
        (lines, distanceKm, c) => {
          const result = priceOrder({
            ...base,
            lines,
            distanceKm,
            coupon: c
              ? coupon({ ...c, value: c.type === 'percent' ? c.value % 10_001 : c.value })
              : null,
          });
          if (!result.ok) return false;
          const b = result.bill;
          const parts =
            b.itemTotal - b.discount + b.deliveryFee + b.platformFee + b.foodTax + b.feeTax;
          return (
            [b.itemTotal, b.discount, b.deliveryFee, b.foodTax, b.feeTax, b.grandTotal].every(
              (n) => Number.isInteger(n) && n >= 0,
            ) &&
            b.discount <= b.itemTotal &&
            b.grandTotal === Math.max(MIN_ORDER_TOTAL, parts) &&
            b.taxes === b.foodTax + b.feeTax
          );
        },
      ),
    );
  });
});
