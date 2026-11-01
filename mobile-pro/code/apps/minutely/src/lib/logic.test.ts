import type { Bill, Cart, Order } from '@pro/api';

import { discountLabel, inStockFirst, sortLabel } from './catalog';
import { cartBarSubtitle, etaHeadline, freeDeliveryNudge, savingsMessage } from './delivery';
import { bannerHref } from './links';
import { pendingSummary } from './pending';
import { countdownWindow, trackingCopy } from './tracking';

const bill = (over: Partial<Bill> = {}): Bill => ({
  itemTotal: 149,
  mrpTotal: 180,
  deliveryFee: 25,
  deliveryFeeWaived: 0,
  platformFee: 2,
  handlingFee: 4,
  smallCartFee: 0,
  taxes: 0,
  couponDiscount: 0,
  tip: 0,
  total: 180,
  savings: 31,
  ...over,
});

describe('delivery copy', () => {
  it('says how fast, with the right plural and never zero', () => {
    expect(etaHeadline(9)).toBe('Delivery in 9 minutes');
    expect(etaHeadline(1)).toBe('Delivery in 1 minute');
    expect(etaHeadline(0)).toBe('Delivery in 1 minute');
  });

  it('nudges towards free delivery and celebrates once unlocked', () => {
    const cart = (amountToFreeDelivery: number | null, itemCount = 2): Pick<Cart, 'amountToFreeDelivery' | 'bill' | 'itemCount'> => ({
      amountToFreeDelivery,
      itemCount,
      bill: bill({ itemTotal: 149 }),
    });
    expect(freeDeliveryNudge(cart(50))).toEqual({ message: 'Add ₹50 more for FREE delivery', progress: 149 / 199, unlocked: false });
    expect(freeDeliveryNudge(cart(null))).toEqual({ message: 'Yay! FREE delivery unlocked', progress: 1, unlocked: true });
    expect(freeDeliveryNudge(cart(50, 0))).toBeNull();
  });

  it('calls out savings only when there are some', () => {
    expect(savingsMessage(bill({ savings: 86 }))).toBe("You're saving ₹86 on this order");
    expect(savingsMessage(bill({ savings: 0 }))).toBeNull();
    expect(cartBarSubtitle(bill({ mrpTotal: 1240, itemTotal: 1100 }))).toBe('Saved ₹140');
    expect(cartBarSubtitle(bill({ mrpTotal: 99, itemTotal: 99 }))).toBeUndefined();
  });
});

describe('banner links', () => {
  it('maps seed links to routes and drops unknown ones', () => {
    expect(bannerHref('/category/fruits')).toBe('/category/fruits');
    expect(bannerHref('/offers')).toBe('/cart?coupons=1');
    expect(bannerHref('/restaurant/r-01')).toBeNull();
    expect(bannerHref('/category/../../etc')).toBeNull();
    expect(bannerHref(null)).toBeNull();
  });
});

describe('catalog helpers', () => {
  it('labels discounts and sorts', () => {
    expect(discountLabel({ discountPercent: 14.4 })).toBe('14% OFF');
    expect(discountLabel({ discountPercent: 0 })).toBeNull();
    expect(sortLabel('price_asc')).toBe('Price: low to high');
  });

  it('moves out-of-stock items last, keeping the order otherwise', () => {
    const items = [
      { id: 'a', inStock: false },
      { id: 'b', inStock: true },
      { id: 'c', inStock: true },
    ];
    expect(inStockFirst(items).map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('tracking', () => {
  const base: Pick<Order, 'status' | 'timeline' | 'rider' | 'deliveredAt' | 'placedAt' | 'etaAt'> = {
    status: 'on_the_way',
    timeline: [
      { status: 'confirmed', label: 'Order confirmed', description: '', at: '2026-11-01T10:00:00.000Z', done: true },
      { status: 'packing', label: 'Packing your items', description: '', at: '2026-11-01T10:00:04.000Z', done: true },
      { status: 'on_the_way', label: 'On the way', description: '', at: '2026-11-01T10:00:15.000Z', done: true },
      { status: 'delivered', label: 'Delivered', description: '', at: null, done: false },
    ],
    rider: { name: 'Arjun Mehta', phone: '98450 12345', avatar: 'man', rating: 4.8, vehicle: 'Scooter' },
    deliveredAt: null,
    placedAt: '2026-11-01T10:00:00.000Z',
    etaAt: '2026-11-01T10:09:00.000Z',
  };

  it('counts down over the promised window', () => {
    expect(countdownWindow(base)).toEqual({ endsAt: Date.parse('2026-11-01T10:09:00.000Z'), totalSeconds: 540 });
    expect(countdownWindow({ placedAt: base.placedAt, etaAt: base.placedAt }).totalSeconds).toBe(60);
  });

  it('names the stage and the partner', () => {
    expect(trackingCopy(base)).toEqual({ title: 'On the way', subtitle: 'Arjun is riding over with your order' });
    expect(trackingCopy({ ...base, status: 'packing' }).title).toBe('Packing your order');
    expect(trackingCopy({ ...base, status: 'confirmed', rider: null }).title).toBe('Order confirmed');
    expect(trackingCopy({ ...base, status: 'delivered', deliveredAt: '2026-11-01T10:07:40.000Z' })).toEqual({
      title: 'Delivered!',
      subtitle: 'Delivered in 8 minutes. Enjoy!',
    });
    expect(trackingCopy({ ...base, status: 'cancelled' }).title).toBe('Order cancelled');
  });
});

describe('pending stepper taps', () => {
  const cart = {
    items: [{ productId: 'g-001', quantity: 2 }],
    itemCount: 2,
    bill: bill({ itemTotal: 378, mrpTotal: 440 }),
  } as unknown as Pick<Cart, 'items' | 'itemCount' | 'bill'>;

  it('adds unanswered taps on top of the server cart', () => {
    expect(pendingSummary(cart, {})).toEqual({ itemCount: 2, total: 378, mrpTotal: 440 });
    expect(pendingSummary(cart, { 'g-001': { quantity: 3, price: 189, mrp: 220 }, 'g-050': { quantity: 1, price: 30, mrp: 35 } })).toEqual({
      itemCount: 4,
      total: 597,
      mrpTotal: 695,
    });
  });

  it('handles removal and an empty cart', () => {
    expect(pendingSummary(cart, { 'g-001': { quantity: 0, price: 189, mrp: 220 } })).toEqual({ itemCount: 0, total: 0, mrpTotal: 0 });
    expect(pendingSummary(undefined, { x: { quantity: 1, price: 10, mrp: 12 } })).toEqual({ itemCount: 1, total: 10, mrpTotal: 12 });
  });
});
