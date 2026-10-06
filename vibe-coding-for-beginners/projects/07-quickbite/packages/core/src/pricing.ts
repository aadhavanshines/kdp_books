import { evaluateCoupon, type CouponRejection } from './coupons';
import { applyBps } from './money';
import type { Coupon, CurrencyCode, Region } from './types';

/** Smallest amount the payment providers accept (₹1). */
export const MIN_ORDER_TOTAL = 100;
export const MAX_QTY_PER_ITEM = 20;

export interface PricedLine {
  itemId: string;
  unitPrice: number;
  qty: number;
}

export interface PriceOrderInput {
  lines: readonly PricedLine[];
  region: Region;
  brandId: string;
  distanceKm: number;
  coupon?: Coupon | null;
  userCouponRedemptions?: number;
  now: Date;
}

export interface Bill {
  currency: CurrencyCode;
  itemTotal: number;
  discount: number;
  deliveryFee: number;
  /** Delivery fee before a free-delivery coupon, so the UI can strike it through. */
  deliveryFeeBeforeDiscount: number;
  platformFee: number;
  foodTax: number;
  feeTax: number;
  /** foodTax + feeTax: the "GST" line on the bill. */
  taxes: number;
  grandTotal: number;
  /** Total money saved by the coupon (discount + waived delivery). */
  savings: number;
  appliedCouponCode: string | null;
  couponRejection: CouponRejection | null;
}

export type PriceOrderError = 'EMPTY_CART' | 'INVALID_QUANTITY' | 'NOT_DELIVERABLE';

export type PriceOrderResult = { ok: true; bill: Bill } | { ok: false; error: PriceOrderError };

/** Delivery fee for a distance, or null when the address is too far away. */
export function deliveryFeeFor(region: Region, distanceKm: number): number | null {
  const band = region.deliveryFeeBands.find((b) => distanceKm <= b.upToKm);
  return band ? band.fee : null;
}

export function itemTotalOf(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
}

/**
 * Builds the bill for an order. The server calls this with prices it read from
 * the database; the browser only uses it to preview the same numbers.
 *
 * Order of operations:
 *   itemTotal − discount + deliveryFee + platformFee
 *   + GST on food (on the discounted item total) + GST on fees
 */
export function priceOrder(input: PriceOrderInput): PriceOrderResult {
  const { lines, region } = input;
  if (lines.length === 0) return { ok: false, error: 'EMPTY_CART' };
  if (lines.some((l) => !Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY_PER_ITEM)) {
    return { ok: false, error: 'INVALID_QUANTITY' };
  }

  const baseDeliveryFee = deliveryFeeFor(region, input.distanceKm);
  if (baseDeliveryFee === null) return { ok: false, error: 'NOT_DELIVERABLE' };

  const itemTotal = itemTotalOf(lines);

  let discount = 0;
  let freeDelivery = false;
  let appliedCouponCode: string | null = null;
  let couponRejection: CouponRejection | null = null;
  if (input.coupon) {
    const result = evaluateCoupon(input.coupon, {
      itemTotal,
      brandId: input.brandId,
      regionId: region.id,
      now: input.now,
      userRedemptions: input.userCouponRedemptions ?? 0,
    });
    if (result.ok) {
      discount = result.discount;
      freeDelivery = result.freeDelivery;
      appliedCouponCode = input.coupon.code;
    } else {
      const { ok: _ok, ...rejection } = result;
      couponRejection = rejection;
    }
  }

  const deliveryFee = freeDelivery ? 0 : baseDeliveryFee;
  const platformFee = region.platformFee;
  const foodTax = applyBps(itemTotal - discount, region.foodTaxBps);
  const feeTax = applyBps(deliveryFee + platformFee, region.feeTaxBps);
  const grandTotal = Math.max(
    MIN_ORDER_TOTAL,
    itemTotal - discount + deliveryFee + platformFee + foodTax + feeTax,
  );

  return {
    ok: true,
    bill: {
      currency: region.currency,
      itemTotal,
      discount,
      deliveryFee,
      deliveryFeeBeforeDiscount: baseDeliveryFee,
      platformFee,
      foodTax,
      feeTax,
      taxes: foodTax + feeTax,
      grandTotal,
      savings: discount + (baseDeliveryFee - deliveryFee),
      appliedCouponCode,
      couponRejection,
    },
  };
}
