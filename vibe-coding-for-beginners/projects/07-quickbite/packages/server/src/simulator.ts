/**
 * The demo simulator: there are no restaurant or rider apps in v1, so paid
 * orders move along the tracking steps on a timer. Also expires orders that
 * were never paid. Runs as scheduled Cloud Functions, and in a loop locally
 * (`pnpm sim`) because the emulator doesn't fire schedules.
 */
import { canTransition, nextTrackingStatus, type OrderStatus } from '@quickbite/core';
import { statusChange } from './payments';
import type { OrderStore } from './store';

export const DEFAULT_DEMO_STEP_SECONDS = 45;
export const UNPAID_ORDER_TTL_MINUTES = 30;

const ACTIVE: readonly OrderStatus[] = ['placed', 'accepted', 'preparing', 'out_for_delivery'];
const UNPAID: readonly OrderStatus[] = ['pending_payment', 'payment_failed'];

/** Moves every order that has sat in its status for `stepSeconds` one step forward. */
export async function advanceDemoOrders(
  store: OrderStore,
  { now = new Date(), stepSeconds = DEFAULT_DEMO_STEP_SECONDS, limit = 200 } = {},
): Promise<number> {
  const cutoff = new Date(now.getTime() - stepSeconds * 1000).toISOString();
  return moveOrders(store, ACTIVE, cutoff, limit, now, (status) => nextTrackingStatus(status));
}

/** Marks orders that stayed unpaid for 30 minutes as expired. */
export async function expireUnpaidOrders(
  store: OrderStore,
  { now = new Date(), ttlMinutes = UNPAID_ORDER_TTL_MINUTES, limit = 200 } = {},
): Promise<number> {
  const cutoff = new Date(now.getTime() - ttlMinutes * 60_000).toISOString();
  return moveOrders(store, UNPAID, cutoff, limit, now, () => 'expired');
}

async function moveOrders(
  store: OrderStore,
  statuses: readonly OrderStatus[],
  cutoff: string,
  limit: number,
  now: Date,
  next: (status: OrderStatus) => OrderStatus | null,
): Promise<number> {
  const candidates = await store.listOrdersByStatus(statuses, cutoff, limit);
  let moved = 0;
  for (const candidate of candidates) {
    // Compare-and-set: re-read inside the transaction so a payment or another
    // simulator run in between is never overwritten.
    const changed = await store.transaction(async (tx) => {
      const order = await tx.getOrder(candidate.id);
      if (!order || order.status !== candidate.status || order.statusUpdatedAt > cutoff)
        return false;
      const to = next(order.status);
      if (!to || !canTransition(order.status, to)) return false;
      tx.updateOrder(order.id, statusChange(order, to, now.toISOString()));
      return true;
    });
    if (changed) moved++;
  }
  return moved;
}
