import type { Bill, CommerceApp, Coupon } from '@pro/api/types';

export const round2 = (n: number) => Math.round(n * 100) / 100;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(n);

export interface PricedLine {
  unitPrice: number;
  mrp: number | null;
  quantity: number;
}

export interface BillContext {
  app: CommerceApp;
  lines: readonly PricedLine[];
  coupon: Coupon | null;
  tip: number;
  /** Platter: distance from restaurant to the delivery address. */
  distanceKm?: number;
  /** The customer has placed an order in this app before (first-order coupons). */
  hasOrdered?: boolean;
}

/** Fee rules per app. */
export const FEES = {
  platter: { platformFee: 6, gstRate: 0.05, baseDelivery: 19, perKm: 6, maxDelivery: 69 },
  minutely: { delivery: 30, freeDeliveryAbove: 199, handlingFee: 4, smallCartFee: 15, smallCartBelow: 99 },
  cartly: { delivery: 40, freeDeliveryAbove: 499 },
} as const;

export interface CouponCheck {
  ok: boolean;
  reason: string | null;
  discount: number;
  freeDelivery: boolean;
}

/** Whether a coupon applies to an item total, and what it takes off. */
export function evaluateCoupon(
  coupon: Coupon,
  itemTotal: number,
  ctx: { app: CommerceApp; restaurantId?: string | null; now: number; hasOrdered?: boolean },
): CouponCheck {
  const fail = (reason: string): CouponCheck => ({ ok: false, reason, discount: 0, freeDelivery: false });
  if (coupon.app !== ctx.app) return fail('This coupon is not valid here');
  if (Date.parse(coupon.expiresAt) < ctx.now) return fail('This coupon has expired');
  if (coupon.firstOrderOnly && ctx.hasOrdered) return fail('Valid on your first order only');
  if (coupon.restaurantId && coupon.restaurantId !== ctx.restaurantId) return fail('Valid only at the partner restaurant');
  if (itemTotal <= 0) return fail('Add items to apply this coupon');
  if (itemTotal < coupon.minOrder) return fail(`Add ${formatINR(Math.ceil(coupon.minOrder - itemTotal))} more to apply`);
  if (coupon.kind === 'free_delivery') return { ok: true, reason: null, discount: 0, freeDelivery: true };
  const raw = coupon.kind === 'flat' ? coupon.value : (itemTotal * coupon.value) / 100;
  const capped = coupon.maxDiscount != null ? Math.min(raw, coupon.maxDiscount) : raw;
  return { ok: true, reason: null, discount: Math.round(Math.min(capped, itemTotal)), freeDelivery: false };
}

export function computeBill(ctx: BillContext, now: number, restaurantId?: string | null): Bill {
  const active = ctx.lines.filter((l) => l.quantity > 0);
  const itemTotal = round2(active.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
  const mrpTotal = round2(active.reduce((s, l) => s + Math.max(l.mrp ?? l.unitPrice, l.unitPrice) * l.quantity, 0));
  const empty = itemTotal === 0;
  const coupon = ctx.coupon ? evaluateCoupon(ctx.coupon, itemTotal, { app: ctx.app, restaurantId, now, hasOrdered: ctx.hasOrdered }) : null;
  const couponDiscount = coupon?.ok ? coupon.discount : 0;

  let deliveryFee = 0;
  let deliveryFeeWaived = 0;
  let platformFee = 0;
  let handlingFee = 0;
  let smallCartFee = 0;
  let taxes = 0;

  if (!empty) {
    if (ctx.app === 'platter') {
      const f = FEES.platter;
      const fee = Math.min(f.maxDelivery, Math.round(f.baseDelivery + f.perKm * (ctx.distanceKm ?? 2)));
      if (coupon?.freeDelivery) deliveryFeeWaived = fee;
      else deliveryFee = fee;
      platformFee = f.platformFee;
      taxes = round2((itemTotal - couponDiscount) * f.gstRate);
    } else if (ctx.app === 'minutely') {
      const f = FEES.minutely;
      if (itemTotal >= f.freeDeliveryAbove || coupon?.freeDelivery) deliveryFeeWaived = f.delivery;
      else deliveryFee = f.delivery;
      handlingFee = f.handlingFee;
      smallCartFee = itemTotal < f.smallCartBelow ? f.smallCartFee : 0;
    } else {
      const f = FEES.cartly;
      if (itemTotal >= f.freeDeliveryAbove || coupon?.freeDelivery) deliveryFeeWaived = f.delivery;
      else deliveryFee = f.delivery;
    }
  }

  const tip = empty ? 0 : Math.max(0, ctx.tip);
  const total = round2(
    itemTotal + deliveryFee + platformFee + handlingFee + smallCartFee + taxes - couponDiscount + tip,
  );
  const savings = round2(mrpTotal - itemTotal + couponDiscount + deliveryFeeWaived);
  return {
    itemTotal,
    mrpTotal,
    deliveryFee,
    deliveryFeeWaived,
    platformFee,
    handlingFee,
    smallCartFee,
    taxes,
    couponDiscount,
    tip,
    total,
    savings,
  };
}

/** How much more to spend for free delivery, or null. */
export function amountToFreeDelivery(app: CommerceApp, itemTotal: number): number | null {
  if (itemTotal <= 0) return null;
  const threshold =
    app === 'minutely' ? FEES.minutely.freeDeliveryAbove : app === 'cartly' ? FEES.cartly.freeDeliveryAbove : null;
  if (threshold == null || itemTotal >= threshold) return null;
  return round2(threshold - itemTotal);
}

export function discountPercent(price: number, mrp: number): number {
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

/**
 * What a return refunds: the returned lines' share of what was actually paid
 * for items (after the coupon), and never more than is left of the order's
 * total once earlier refunds are taken off.
 */
export function refundFor(
  bill: Pick<Bill, 'itemTotal' | 'couponDiscount' | 'total'>,
  returnedLinesTotal: number,
  alreadyRefunded: number,
): number {
  if (bill.itemTotal <= 0 || returnedLinesTotal <= 0) return 0;
  const paidForItems = Math.max(0, bill.itemTotal - bill.couponDiscount);
  const share = (returnedLinesTotal * paidForItems) / bill.itemTotal;
  return round2(Math.max(0, Math.min(share, bill.total - alreadyRefunded)));
}
