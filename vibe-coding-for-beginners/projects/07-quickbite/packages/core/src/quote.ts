import { normalizeCouponCode } from './coupons';
import { distanceKm } from './geo';
import { priceOrder, type Bill } from './pricing';
import type { Area, Coupon, GeoPoint, MenuItem, Region, Restaurant } from './types';

/** What the browser sends to get a price. There is no price in it: the backend looks prices up. */
export interface QuoteRequest {
  restaurantId: string;
  items: { itemId: string; qty: number }[];
  couponCode?: string;
  addressId: string;
}

export interface QuoteLine {
  itemId: string;
  name: string;
  isVeg: boolean;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export type QuoteError =
  | 'EMPTY_CART'
  | 'INVALID_QUANTITY'
  | 'NOT_DELIVERABLE'
  | 'RESTAURANT_NOT_FOUND'
  | 'RESTAURANT_CLOSED'
  | 'ADDRESS_NOT_FOUND';

export type Quote =
  | {
      ok: true;
      lines: QuoteLine[];
      bill: Bill;
      /** Items that were dropped because they are no longer available. */
      unavailableItemIds: string[];
      /** True when the coupon code doesn't exist at all. */
      couponNotFound: boolean;
      distanceKm: number;
    }
  | { ok: false; error: QuoteError };

/**
 * Where an address is on the map. There is no pin-drop in v1, so every address
 * sits next to its area's centre. Backends compute this from the area id and
 * never trust coordinates sent by a browser.
 */
export function addressPoint(area: GeoPoint): GeoPoint {
  return { lat: area.lat + 0.002, lng: area.lng + 0.002 };
}

export interface BuildQuoteInput {
  request: Pick<QuoteRequest, 'items' | 'couponCode'>;
  restaurant: Restaurant | null;
  region: Region | null;
  /** The delivery address's area, or null when the address doesn't exist. */
  addressArea: Area | null;
  /** Menu items found for the requested ids (others count as unavailable). */
  items: readonly MenuItem[];
  coupon: Coupon | null;
  userCouponRedemptions?: number;
  now: Date;
}

/**
 * Prices a cart from data the backend loaded itself. Shared by every backend
 * (and the server), so the bill can never differ between them.
 */
export function buildQuote(input: BuildQuoteInput): Quote {
  const { restaurant, region, addressArea } = input;
  if (!restaurant || !region) return { ok: false, error: 'RESTAURANT_NOT_FOUND' };
  if (!restaurant.isOpen) return { ok: false, error: 'RESTAURANT_CLOSED' };
  if (!addressArea) return { ok: false, error: 'ADDRESS_NOT_FOUND' };

  const byId = new Map(input.items.map((i) => [i.id, i]));
  const unavailableItemIds: string[] = [];
  const lines: { item: MenuItem; qty: number }[] = [];
  const seen = new Set<string>();
  for (const { itemId, qty } of input.request.items) {
    const item = byId.get(itemId);
    if (!item || item.restaurantId !== restaurant.id || !item.isAvailable) {
      unavailableItemIds.push(itemId);
      continue;
    }
    // The same dish twice is merged rather than trusted as two separate lines.
    if (seen.has(itemId)) {
      const line = lines.find((l) => l.item.id === itemId)!;
      line.qty += qty;
      continue;
    }
    seen.add(itemId);
    lines.push({ item, qty });
  }

  const code = input.request.couponCode ? normalizeCouponCode(input.request.couponCode) : undefined;
  const coupon = code && input.coupon?.code === code ? input.coupon : null;
  const distance = distanceKm(restaurant, addressPoint(addressArea));
  const priced = priceOrder({
    lines: lines.map(({ item, qty }) => ({ itemId: item.id, unitPrice: item.price, qty })),
    region,
    brandId: restaurant.brandId,
    distanceKm: distance,
    coupon,
    userCouponRedemptions: input.userCouponRedemptions ?? 0,
    now: input.now,
  });
  if (!priced.ok) return { ok: false, error: priced.error };

  return {
    ok: true,
    bill: priced.bill,
    lines: lines.map(({ item, qty }) => ({
      itemId: item.id,
      name: item.name,
      isVeg: item.isVeg,
      unitPrice: item.price,
      qty,
      lineTotal: item.price * qty,
    })),
    unavailableItemIds,
    couponNotFound: Boolean(code && !coupon),
    distanceKm: Math.round(distance * 10) / 10,
  };
}
