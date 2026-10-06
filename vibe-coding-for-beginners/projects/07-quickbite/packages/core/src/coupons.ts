import { applyBps } from './money';
import type { Coupon } from './types';

export interface CouponContext {
  itemTotal: number;
  brandId: string;
  regionId: string;
  now: Date;
  /** How many times this user has already redeemed the coupon. */
  userRedemptions: number;
}

export type CouponRejection =
  | { reason: 'INACTIVE' }
  | { reason: 'NOT_STARTED' }
  | { reason: 'EXPIRED' }
  | { reason: 'WRONG_REGION' }
  | { reason: 'WRONG_RESTAURANT' }
  | { reason: 'USAGE_LIMIT' }
  | { reason: 'MIN_ORDER'; shortBy: number };

export type CouponResult =
  { ok: true; discount: number; freeDelivery: boolean } | ({ ok: false } & CouponRejection);

/** Normalises user input like " welcome50 " to "WELCOME50". */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Checks a coupon against a cart and returns the discount it gives (never more than itemTotal). */
export function evaluateCoupon(coupon: Coupon, ctx: CouponContext): CouponResult {
  if (!coupon.active) return { ok: false, reason: 'INACTIVE' };
  if (ctx.now < new Date(coupon.validFrom)) return { ok: false, reason: 'NOT_STARTED' };
  if (ctx.now > new Date(coupon.validTo)) return { ok: false, reason: 'EXPIRED' };
  if (coupon.regionId !== ctx.regionId) return { ok: false, reason: 'WRONG_REGION' };
  if (coupon.brandId && coupon.brandId !== ctx.brandId) {
    return { ok: false, reason: 'WRONG_RESTAURANT' };
  }
  if (coupon.perUserLimit !== null && ctx.userRedemptions >= coupon.perUserLimit) {
    return { ok: false, reason: 'USAGE_LIMIT' };
  }
  if (ctx.itemTotal < coupon.minOrder) {
    return { ok: false, reason: 'MIN_ORDER', shortBy: coupon.minOrder - ctx.itemTotal };
  }

  if (coupon.type === 'free_delivery') return { ok: true, discount: 0, freeDelivery: true };

  let discount = coupon.type === 'percent' ? applyBps(ctx.itemTotal, coupon.value) : coupon.value;
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, ctx.itemTotal));
  return { ok: true, discount, freeDelivery: false };
}
