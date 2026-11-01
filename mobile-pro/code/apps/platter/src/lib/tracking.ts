import { orderProgress, type Order, type OrderStatus } from '@pro/api';
import { formatClock } from '@pro/ui';

const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

/** "Today, 8:42 pm", "Yesterday, 9:10 am" or "30 Oct, 8:22 pm". */
export function formatOrderDate(iso: string, now: number = Date.now()): string {
  const d = new Date(iso);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((start.getTime() - d.getTime()) / 86_400_000) + 1;
  const prefix = d.getTime() >= start.getTime() ? 'Today' : diffDays === 1 ? 'Yesterday' : day.format(d);
  return `${prefix}, ${formatClock(iso)}`;
}

export interface TrackingCopy {
  title: string;
  subtitle: string;
  /** Minutes to show in the ETA badge; null when not counting down. */
  etaMinutes: number | null;
}

const TITLES: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Order confirmed',
  preparing: 'Preparing your food',
  picked_up: 'Rider has your order',
};

/** The headline and ETA for the tracking screen. `liveEta` is from the latest location event. */
export function trackingCopy(order: Pick<Order, 'status' | 'timeline' | 'etaMinutes' | 'restaurant' | 'rider'>, liveEta?: number | null): TrackingCopy {
  const p = orderProgress(order);
  const eta = Math.max(1, liveEta ?? order.etaMinutes);
  const place = order.restaurant?.name ?? 'The restaurant';
  if (p.isDelivered) return { title: 'Order delivered', subtitle: 'Enjoy your meal! Tell us how it was.', etaMinutes: null };
  if (p.isCancelled) return { title: 'Order cancelled', subtitle: 'Any amount paid will be refunded in 3 to 5 days.', etaMinutes: null };
  if (p.isMoving) {
    const who = order.rider?.name.split(' ')[0] ?? 'Your rider';
    return { title: `Arriving in ${eta} ${eta === 1 ? 'min' : 'mins'}`, subtitle: `${who} is on the way to you`, etaMinutes: eta };
  }
  const step = order.timeline.find((s) => s.status === order.status);
  const subtitle =
    order.status === 'confirmed'
      ? `${place} has accepted your order`
      : order.status === 'preparing'
        ? `${place} is cooking it fresh`
        : (step?.description ?? '');
  return { title: TITLES[order.status] ?? step?.label ?? 'Order placed', subtitle, etaMinutes: eta };
}

/** "Ordered 2 items" style summary for a list of quantities. */
export function itemCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}
