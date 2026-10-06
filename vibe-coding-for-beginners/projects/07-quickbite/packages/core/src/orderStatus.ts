export const ORDER_STATUSES = [
  'pending_payment',
  'placed',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered',
  'payment_failed',
  'expired',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The happy path a customer sees on the tracking screen. */
export const TRACKING_STEPS: readonly OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered',
];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ['placed', 'payment_failed', 'expired'],
  payment_failed: ['placed', 'expired'],
  placed: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  expired: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Next step on the happy path, or null when the order is finished. */
export function nextTrackingStatus(status: OrderStatus): OrderStatus | null {
  const index = TRACKING_STEPS.indexOf(status);
  if (index === -1 || index === TRACKING_STEPS.length - 1) return null;
  return TRACKING_STEPS[index + 1] ?? null;
}
