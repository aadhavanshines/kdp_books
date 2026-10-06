import { describe, expect, it } from 'vitest';
import { cartInputSchema } from './schemas';

describe('cartInputSchema', () => {
  it('accepts ids and quantities and normalises the coupon', () => {
    const parsed = cartInputSchema.parse({
      restaurantId: 'r1',
      items: [{ itemId: 'a', qty: 2 }],
      couponCode: ' welcome50 ',
    });
    expect(parsed.couponCode).toBe('WELCOME50');
  });

  it('strips any price the client tries to send', () => {
    const parsed = cartInputSchema.parse({
      restaurantId: 'r1',
      items: [{ itemId: 'a', qty: 1, price: 1 }],
      total: 1,
    });
    expect(parsed).toEqual({ restaurantId: 'r1', items: [{ itemId: 'a', qty: 1 }] });
  });

  it('rejects bad quantities', () => {
    expect(
      cartInputSchema.safeParse({ restaurantId: 'r1', items: [{ itemId: 'a', qty: 0 }] }).success,
    ).toBe(false);
    expect(
      cartInputSchema.safeParse({ restaurantId: 'r1', items: [{ itemId: 'a', qty: 1.5 }] }).success,
    ).toBe(false);
  });
});
