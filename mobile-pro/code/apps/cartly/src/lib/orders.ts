import type { Order, OrderStatus, OrderSummary } from '@pro/api';
import { type BadgeTone, shortDate } from '@pro/ui';

export function statusTone(status: OrderStatus): BadgeTone {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'out_for_delivery' || status === 'shipped') return 'info';
  return 'warning';
}

/** The headline for an order in lists and details. */
export function deliveryLine(
  o: Pick<OrderSummary, 'status' | 'deliveredAt' | 'placedAt'> & Partial<Pick<Order, 'etaAt' | 'cancelledAt' | 'statusLabel'>>,
): string {
  if (o.status === 'delivered') return `Delivered on ${shortDate(o.deliveredAt ?? o.placedAt)}`;
  if (o.status === 'cancelled') return `Cancelled on ${shortDate(o.cancelledAt ?? o.placedAt)}`;
  if (o.status === 'out_for_delivery') return 'Out for delivery: arriving today';
  if (o.etaAt) return `Arriving by ${shortDate(o.etaAt)}`;
  return o.statusLabel ? `${o.statusLabel} · arriving soon` : `Ordered on ${shortDate(o.placedAt)}`;
}

export type OrderFilter = 'all' | 'active' | 'delivered' | 'cancelled';
export const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function matchesFilter(o: Pick<OrderSummary, 'status'>, f: OrderFilter): boolean {
  if (f === 'all') return true;
  if (f === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
  return o.status === f;
}
