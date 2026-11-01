import type { Bill, Cart } from '@pro/api';
import { formatINR } from '@pro/ui';

/** "Delivery in 9 minutes" (never "0 minutes", never "1 minutes"). */
export function etaHeadline(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  return `Delivery in ${m} ${m === 1 ? 'minute' : 'minutes'}`;
}

export interface FreeDeliveryNudge {
  /** "Add ₹51 more for FREE delivery" or "Yay! FREE delivery unlocked". */
  message: string;
  /** 0 to 1, how close the cart is to free delivery. */
  progress: number;
  unlocked: boolean;
}

/**
 * The bar above the cart lines. The server says how much more is needed
 * (`amountToFreeDelivery`); null means delivery is already free.
 */
export function freeDeliveryNudge(cart: Pick<Cart, 'amountToFreeDelivery' | 'bill' | 'itemCount'>): FreeDeliveryNudge | null {
  if (cart.itemCount <= 0) return null;
  const more = cart.amountToFreeDelivery;
  if (more == null || more <= 0) return { message: 'Yay! FREE delivery unlocked', progress: 1, unlocked: true };
  const spent = cart.bill.itemTotal;
  return { message: `Add ${formatINR(more)} more for FREE delivery`, progress: spent / (spent + more), unlocked: false };
}

/** "You saved ₹86 on this order", or null with nothing saved. */
export function savingsMessage(bill: Pick<Bill, 'savings'>): string | null {
  return bill.savings > 0 ? `You're saving ${formatINR(bill.savings)} on this order` : null;
}

/** MRP savings for the cart bar: "Saved ₹86". */
export function cartBarSubtitle(bill: Pick<Bill, 'mrpTotal' | 'itemTotal'>): string | undefined {
  const saved = Math.round(bill.mrpTotal - bill.itemTotal);
  return saved > 0 ? `Saved ${formatINR(saved)}` : undefined;
}
