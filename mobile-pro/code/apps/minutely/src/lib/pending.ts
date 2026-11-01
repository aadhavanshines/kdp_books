import { quantityInCart, type Cart } from '@pro/api';

/** A stepper tap the server has not answered yet. */
export interface PendingChange {
  quantity: number;
  price: number;
  mrp: number;
}

/**
 * The cart bar's count and totals right now: the server's cart plus the
 * difference each unanswered tap makes, so the bar moves with the stepper.
 */
export function pendingSummary(
  cart: Pick<Cart, 'items' | 'itemCount' | 'bill'> | undefined,
  pending: Readonly<Record<string, PendingChange>>,
): { itemCount: number; total: number; mrpTotal: number } {
  let itemCount = cart?.itemCount ?? 0;
  let total = cart?.bill.itemTotal ?? 0;
  let mrpTotal = cart?.bill.mrpTotal ?? 0;
  for (const [productId, change] of Object.entries(pending)) {
    const diff = change.quantity - quantityInCart(cart as Cart | undefined, productId);
    itemCount += diff;
    total += diff * change.price;
    mrpTotal += diff * change.mrp;
  }
  return { itemCount: Math.max(0, itemCount), total: Math.max(0, total), mrpTotal: Math.max(0, mrpTotal) };
}
