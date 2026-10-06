import type { Order } from '@quickbite/core';
import { buildCatalog } from '@quickbite/seed';
import { describe, expect, it } from 'vitest';
import { fakeWebhookUrl, isLocalSupabase } from './edge';
import {
  areaFromRow,
  areaToRow,
  categoryFromRow,
  categoryToRow,
  couponFromRow,
  couponToRow,
  menuItemFromRow,
  menuItemToRow,
  orderFromRow,
  orderItemsToRows,
  orderToRow,
  regionFromRow,
  regionToRow,
  restaurantFromRow,
  restaurantToRow,
} from './rows';

const catalog = buildCatalog();

describe('catalog rows', () => {
  it('round-trip every seed record unchanged', () => {
    expect(catalog.regions.map((r) => regionFromRow(regionToRow(r)))).toEqual(catalog.regions);
    expect(catalog.areas.map((a) => areaFromRow(areaToRow(a)))).toEqual(catalog.areas);
    expect(catalog.restaurants.map((r, i) => restaurantFromRow(restaurantToRow(r, i)))).toEqual(
      catalog.restaurants,
    );
    expect(catalog.categories.map((c) => categoryFromRow(categoryToRow(c)))).toEqual(
      catalog.categories,
    );
    expect(catalog.items.map((m, i) => menuItemFromRow(menuItemToRow(m, i)))).toEqual(
      catalog.items,
    );
  });

  it('round-trips coupons, with dates as ISO 8601 UTC', () => {
    for (const coupon of catalog.coupons) {
      expect(couponFromRow(couponToRow(coupon))).toEqual({
        ...coupon,
        validFrom: new Date(coupon.validFrom).toISOString(),
        validTo: new Date(coupon.validTo).toISOString(),
      });
    }
  });

  it('stores normalised search text for dish search', () => {
    const row = menuItemToRow(
      { ...catalog.items[0]!, name: 'Crème Brûlée!', description: 'Vanilla & caramel' },
      0,
    );
    expect(row.search_text).toBe('creme brulee vanilla caramel');
  });
});

describe('order rows', () => {
  const order: Order = {
    id: 'ord_1',
    userId: '00000000-0000-4000-8000-000000000001',
    restaurantId: 'r1',
    restaurant: {
      id: 'r1',
      brandId: 'b1',
      name: 'Tandoor Tales',
      slug: 'tandoor-tales',
      imageUrl: '/x',
      locality: 'Koramangala',
    },
    status: 'placed',
    statusHistory: [
      { status: 'pending_payment', at: '2026-10-06T10:00:00.000Z' },
      { status: 'placed', at: '2026-10-06T10:01:00.000Z' },
    ],
    items: [
      { itemId: 'a', name: 'Naan', isVeg: true, unitPrice: 6000, qty: 2, lineTotal: 12000 },
      { itemId: 'b', name: 'Tikka', isVeg: false, unitPrice: 30000, qty: 1, lineTotal: 30000 },
    ],
    address: {
      label: 'Home',
      name: 'Asha',
      phone: '9876543210',
      line1: 'Flat 4B',
      line2: '5th Block',
      landmark: '',
      areaId: 'blr-koramangala',
      areaName: 'Koramangala',
      city: 'Bengaluru',
      pincode: '560095',
      lat: 12.9,
      lng: 77.6,
    },
    bill: {} as Order['bill'],
    distanceKm: 2.4,
    currency: 'INR',
    couponCode: null,
    note: '',
    paymentProvider: 'fake',
    paymentStatus: 'paid',
    providerOrderId: 'fake_order_ord_1',
    providerPaymentId: 'pay_1',
    idempotencyKey: 'checkout-1-abcdef',
    needsReview: false,
    etaMinutes: { min: 25, max: 30 },
    createdAt: '2026-10-06T10:00:00.000Z',
    updatedAt: '2026-10-06T10:01:00.000Z',
    statusUpdatedAt: '2026-10-06T10:01:00.000Z',
  };

  it('round-trips an order and its items (in line order)', () => {
    const items = orderItemsToRows(order);
    expect(orderFromRow(orderToRow(order), [...items].reverse())).toEqual(order);
  });

  it('reads timestamps from PostgREST strings and postgres.js Dates alike', () => {
    const row = orderToRow(order);
    const fromRest = { ...row, created_at: '2026-10-06T10:00:00+00:00' };
    const fromDriver = { ...row, created_at: new Date('2026-10-06T10:00:00Z') };
    expect(orderFromRow(fromRest, []).createdAt).toBe('2026-10-06T10:00:00.000Z');
    expect(orderFromRow(fromDriver, []).createdAt).toBe('2026-10-06T10:00:00.000Z');
  });
});

describe('edge configuration', () => {
  it('treats only local stacks as local (fake payments may use the dev secret there)', () => {
    expect(isLocalSupabase({ SUPABASE_URL: 'http://kong:8000' })).toBe(true);
    expect(isLocalSupabase({ SUPABASE_URL: 'http://127.0.0.1:54321' })).toBe(true);
    expect(isLocalSupabase({ SUPABASE_URL: 'https://abcd.supabase.co' })).toBe(false);
    expect(isLocalSupabase({})).toBe(false);
  });

  it('sends fake-provider webhooks to the project’s own payment-webhook function', () => {
    expect(fakeWebhookUrl({ SUPABASE_URL: 'https://abcd.supabase.co/' })).toBe(
      'https://abcd.supabase.co/functions/v1/payment-webhook?provider=fake',
    );
    expect(fakeWebhookUrl({ SUPABASE_URL: 'x', FAKE_WEBHOOK_URL: 'http://w' })).toBe('http://w');
  });
});
