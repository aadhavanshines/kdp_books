import type { Order } from '@pro/api';

export const RETURN_REASONS = [
  'Size or fit is not right',
  'Item is damaged or defective',
  'Received a different item',
  'Quality is not as expected',
  'No longer needed',
] as const;

/** Refund for the chosen lines (the full line totals). */
export function refundTotal(order: Pick<Order, 'items'>, lineIds: readonly string[]): number {
  const ids = new Set(lineIds);
  return order.items.filter((l) => ids.has(l.id)).reduce((s, l) => s + l.lineTotal, 0);
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
