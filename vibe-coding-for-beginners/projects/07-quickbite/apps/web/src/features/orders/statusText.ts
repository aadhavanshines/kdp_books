import type { OrderStatus } from '@quickbite/core';

export const STATUS_TEXT: Record<OrderStatus, { title: string; detail: string }> = {
  pending_payment: {
    title: 'Waiting for payment',
    detail: 'Complete the payment to place your order.',
  },
  payment_failed: {
    title: 'Payment failed',
    detail: 'No money was taken. You can try paying again.',
  },
  placed: { title: 'Order placed', detail: 'Waiting for the restaurant to confirm.' },
  accepted: { title: 'Order accepted', detail: 'The restaurant has confirmed your order.' },
  preparing: { title: 'Preparing your food', detail: 'Your food is being cooked fresh.' },
  out_for_delivery: {
    title: 'Out for delivery',
    detail: 'Your delivery partner is on the way.',
  },
  delivered: { title: 'Delivered', detail: 'Enjoy your meal!' },
  expired: {
    title: 'Payment not completed',
    detail: 'This order was cancelled because it wasn’t paid within 30 minutes.',
  },
  cancelled: { title: 'Cancelled', detail: 'This order was cancelled.' },
};

/** Short labels for the order history list. */
export const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; tone: 'muted' | 'live' | 'done' | 'bad' }
> = {
  pending_payment: { label: 'Awaiting payment', tone: 'muted' },
  payment_failed: { label: 'Payment failed', tone: 'bad' },
  placed: { label: 'Placed', tone: 'live' },
  accepted: { label: 'Accepted', tone: 'live' },
  preparing: { label: 'Preparing', tone: 'live' },
  out_for_delivery: { label: 'On the way', tone: 'live' },
  delivered: { label: 'Delivered', tone: 'done' },
  expired: { label: 'Not paid', tone: 'bad' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
};
