import type { OrderStreamEvent } from '@pro/api/types';

import type { Deps } from '../deps';
import { buildOrder, syncOrder, type OrderRow } from '../services/orders';

export const orderTopic = (orderId: string) => `order:${orderId}`;

/**
 * Advances active orders on the clock and publishes events on the bus:
 * `status` when an order moves to a new step, and `location` every tick
 * while the rider is moving. Status is a pure function of time since the
 * order was placed, so a restart picks up where it left off.
 */
export class OrderSimulator {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private deps: Deps) {}

  tick(): void {
    const rows = this.deps.db.prepare("SELECT * FROM orders WHERE status NOT IN ('delivered', 'cancelled')").all() as OrderRow[];
    for (const row of rows) {
      const changed = syncOrder(this.deps, row);
      const order = buildOrder(this.deps, row);
      if (changed) this.emit(row.id, { type: 'status', order });
      const t = order.tracking;
      if (t && t.progress != null && t.progress < 1 && t.riderPosition) {
        this.emit(row.id, { type: 'location', orderId: row.id, progress: t.progress, position: t.riderPosition, etaMinutes: order.etaMinutes });
      }
    }
  }

  start(intervalMs = 1000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      try {
        this.tick();
      } catch (err) {
        console.error('Order simulator tick failed', err);
      }
    }, intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private emit(orderId: string, event: OrderStreamEvent) {
    this.deps.bus.emit(orderTopic(orderId), event);
  }
}
