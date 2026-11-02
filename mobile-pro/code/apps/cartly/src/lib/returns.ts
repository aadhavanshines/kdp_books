import type { Order } from '@pro/api';

export const RETURN_REASONS = [
  'Size or fit is not right',
  'Item is damaged or defective',
  'Received a different item',
  'Quality is not as expected',
  'No longer needed',
] as const;

/**
 * Refund for the chosen lines: their share of what was paid for items after
 * the coupon, never more than is left of the order total (the server's rule).
 */
export function refundTotal(order: Pick<Order, 'items' | 'bill' | 'returns'>, lineIds: readonly string[]): number {
  const ids = new Set(lineIds);
  const chosen = order.items.filter((l) => ids.has(l.id)).reduce((s, l) => s + l.lineTotal, 0);
  const { itemTotal, couponDiscount, total } = order.bill;
  if (itemTotal <= 0 || chosen <= 0) return 0;
  const share = (chosen * Math.max(0, itemTotal - couponDiscount)) / itemTotal;
  const left = total - order.returns.reduce((s, r) => s + r.refundAmount, 0);
  return Math.round(Math.max(0, Math.min(share, left)) * 100) / 100;
}

export function canSubmitReturn(lineIds: readonly string[], reason: string | null): boolean {
  return lineIds.length > 0 && !!reason;
}

export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export const RETURN_STATUS_LABEL: Record<Order['returns'][number]['status'], string> = {
  requested: 'Return requested',
  pickup_scheduled: 'Pickup scheduled',
  refunded: 'Refund completed',
};
