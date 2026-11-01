import { orderProgress, type Order } from '@pro/api';

export interface Countdown {
  /** When the order should arrive (epoch ms). */
  endsAt: number;
  /** The whole promised window, for the ring's progress. */
  totalSeconds: number;
}

/** The countdown ring's window: from placing the order to its promised arrival. */
export function countdownWindow(order: Pick<Order, 'placedAt' | 'etaAt'>): Countdown {
  const start = Date.parse(order.placedAt);
  const end = Date.parse(order.etaAt);
  return { endsAt: end, totalSeconds: Math.max(60, Math.round((end - start) / 1000)) };
}

export interface TrackingCopy {
  title: string;
  subtitle: string;
}

/** The hero headline for each stage of a delivery. */
export function trackingCopy(order: Pick<Order, 'status' | 'timeline' | 'rider' | 'deliveredAt' | 'placedAt'>): TrackingCopy {
  const p = orderProgress(order);
  const who = order.rider?.name.split(' ')[0] ?? 'Your delivery partner';
  if (p.isCancelled) return { title: 'Order cancelled', subtitle: 'Any amount paid will be refunded in 3 to 5 days.' };
  if (p.isDelivered) {
    const mins = order.deliveredAt ? Math.max(1, Math.round((Date.parse(order.deliveredAt) - Date.parse(order.placedAt)) / 60_000)) : null;
    return { title: 'Delivered!', subtitle: mins ? `Delivered in ${mins} ${mins === 1 ? 'minute' : 'minutes'}. Enjoy!` : 'Enjoy your order!' };
  }
  if (order.status === 'on_the_way') return { title: 'On the way', subtitle: `${who} is riding over with your order` };
  if (order.status === 'packing') return { title: 'Packing your order', subtitle: 'Freshly picked and packed at your nearby store' };
  return { title: 'Order confirmed', subtitle: 'Your store has your order' };
}
