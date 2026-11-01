import type { AppNotification, Order, OrderLine, OrderStatus, ReturnRequest } from './types';

export interface OrderProgress {
  /** Index of the step in progress, for ProgressSteps; `steps.length` once delivered. */
  current: number;
  /** The live order is still moving (not delivered or cancelled). */
  isActive: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  /** The rider has the food and is moving on the map. */
  isMoving: boolean;
}

const MOVING: ReadonlySet<OrderStatus> = new Set(['on_the_way', 'out_for_delivery']);

/** Where an order is in its timeline, from the order the server sends. */
export function orderProgress(order: Pick<Order, 'status' | 'timeline'>): OrderProgress {
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const steps = order.timeline.filter((s) => s.status !== 'cancelled');
  let current: number;
  if (isDelivered) current = steps.length;
  else {
    const idx = steps.findIndex((s) => s.status === order.status);
    // The current status is in progress; earlier steps are done.
    current = idx === -1 ? steps.filter((s) => s.done).length : idx;
  }
  return {
    current,
    isActive: !isDelivered && !isCancelled,
    isDelivered,
    isCancelled,
    isMoving: MOVING.has(order.status),
  };
}

/** Order lines that do not have a return request yet. */
export function returnableLines(order: Pick<Order, 'items' | 'returns'>): OrderLine[] {
  const returned = new Set(order.returns.flatMap((r) => r.lineIds));
  return order.items.filter((line) => !returned.has(line.id));
}

/** The return request that covers a line, if any. */
export function returnForLine(order: Pick<Order, 'returns'>, lineId: string): ReturnRequest | undefined {
  return order.returns.find((r) => r.lineIds.includes(lineId));
}

/** Notifications not read yet (for a bell badge). */
export function unreadCount(notifications: readonly Pick<AppNotification, 'isRead'>[] | undefined): number {
  return notifications?.filter((n) => !n.isRead).length ?? 0;
}
