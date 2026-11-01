import type { CommerceApp, OrderStatus } from '@pro/api/types';

export interface ScheduledStep {
  status: OrderStatus;
  /** Milliseconds after the order was placed. */
  offsetMs: number;
}

export interface StepCopy {
  label: string;
  description: string;
}

/**
 * Demo timings: a whole delivery takes a couple of minutes so it can be
 * watched end to end. SIM_SPEED scales them (2 = twice as fast).
 */
const BASE: Record<CommerceApp, [OrderStatus, number][]> = {
  platter: [
    ['confirmed', 0],
    ['preparing', 6],
    ['picked_up', 30],
    ['on_the_way', 36],
    ['delivered', 120],
  ],
  minutely: [
    ['confirmed', 0],
    ['packing', 4],
    ['on_the_way', 15],
    ['delivered', 75],
  ],
  cartly: [
    ['confirmed', 0],
    ['packed', 20],
    ['shipped', 60],
    ['out_for_delivery', 120],
    ['delivered', 180],
  ],
};

export function scheduleFor(app: CommerceApp, speed: number): ScheduledStep[] {
  const s = speed > 0 ? speed : 1;
  return BASE[app].map(([status, seconds]) => ({ status, offsetMs: Math.round((seconds * 1000) / s) }));
}

/** The status at which the rider starts moving along the route. */
export const MOVING_STATUS: Record<CommerceApp, OrderStatus> = {
  platter: 'on_the_way',
  minutely: 'on_the_way',
  cartly: 'out_for_delivery',
};

export const STEP_COPY: Record<CommerceApp, Partial<Record<OrderStatus, StepCopy>>> = {
  platter: {
    confirmed: { label: 'Order confirmed', description: 'The restaurant has accepted your order' },
    preparing: { label: 'Preparing your food', description: 'The kitchen is cooking it fresh' },
    picked_up: { label: 'Picked up', description: 'Your rider has collected the order' },
    on_the_way: { label: 'On the way', description: 'Your rider is heading to you' },
    delivered: { label: 'Delivered', description: 'Enjoy your meal!' },
    cancelled: { label: 'Cancelled', description: 'This order was cancelled' },
  },
  minutely: {
    confirmed: { label: 'Order confirmed', description: 'Your store has your order' },
    packing: { label: 'Packing your items', description: 'Freshly picked and packed' },
    on_the_way: { label: 'On the way', description: 'Your delivery partner is riding over' },
    delivered: { label: 'Delivered', description: 'Delivered to your door' },
    cancelled: { label: 'Cancelled', description: 'This order was cancelled' },
  },
  cartly: {
    confirmed: { label: 'Order placed', description: 'We have received your order' },
    packed: { label: 'Packed', description: 'Your item is packed and ready to ship' },
    shipped: { label: 'Shipped', description: 'Your parcel has left the warehouse' },
    out_for_delivery: { label: 'Out for delivery', description: 'Arriving today' },
    delivered: { label: 'Delivered', description: 'Your parcel was delivered' },
    cancelled: { label: 'Cancelled', description: 'This order was cancelled' },
  },
};

export function stepCopy(app: CommerceApp, status: OrderStatus): StepCopy {
  return STEP_COPY[app][status] ?? { label: status.replace(/_/g, ' '), description: '' };
}

/** The status an order should have `elapsedMs` after placement. */
export function statusAt(schedule: readonly ScheduledStep[], elapsedMs: number): OrderStatus {
  let current = schedule[0]!.status;
  for (const step of schedule) if (elapsedMs >= step.offsetMs) current = step.status;
  return current;
}

/** 0..1 progress along the route, or null when the rider is not yet moving. */
export function progressAt(app: CommerceApp, schedule: readonly ScheduledStep[], elapsedMs: number): number | null {
  const start = schedule.find((s) => s.status === MOVING_STATUS[app]);
  const end = schedule.find((s) => s.status === 'delivered');
  if (!start || !end) return null;
  if (elapsedMs < start.offsetMs) return null;
  if (elapsedMs >= end.offsetMs) return 1;
  return Math.round(((elapsedMs - start.offsetMs) / (end.offsetMs - start.offsetMs)) * 1000) / 1000;
}
