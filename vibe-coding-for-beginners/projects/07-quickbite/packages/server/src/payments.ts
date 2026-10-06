/**
 * markOrderPaid and friends: what happens when a verified payment event
 * arrives. One transaction per event (docs/PLAN.md §5):
 *
 *   1. Skip the event if it was processed before (unique provider + event id).
 *   2. The provider's amount and currency must equal the order's grandTotal
 *      and currency, or the order is NOT placed and is flagged for review.
 *   3. Record the payment and the event, and the coupon redemption.
 *   4. pending_payment / payment_failed → placed, appended to statusHistory.
 *
 * A payment for an order that already expired is accepted (the money was
 * taken) and flagged needs_review rather than silently lost.
 */
import { canTransition, type Order, type StatusChange } from '@quickbite/core';
import { randomId } from './crypto';
import type { PaymentEvent } from './gateways/types';
import type { CatalogReader, OrderStore, PaymentRecordStatus, StoreTx } from './store';

export type PaymentOutcome =
  /** The order is now placed. */
  | 'placed'
  /** This exact event was processed before; nothing changed. */
  | 'duplicate_event'
  /** The order was already paid (e.g. the browser check and the webhook both arrived). */
  | 'already_paid'
  /** Amount or currency differ from the order: not placed, flagged for review. */
  | 'amount_mismatch'
  /** Paid after the order expired or was cancelled: recorded and flagged for review. */
  | 'paid_needs_review'
  /** The provider reported a failed attempt; the customer can retry. */
  | 'payment_failed'
  /** A failure report for an order that is no longer waiting for payment. */
  | 'ignored'
  /** No order has this provider order id. */
  | 'unknown_order';

export async function applyPaymentEvent(
  store: OrderStore,
  event: PaymentEvent,
  now: Date,
): Promise<{ outcome: PaymentOutcome; orderId: string | null }> {
  const at = now.toISOString();
  const orderId = await store.findOrderIdByProviderOrderId(event.provider, event.providerOrderId);
  // Coupon limits are catalog data, read outside the transaction.
  const preview = orderId ? await store.getOrder(orderId) : null;
  const couponLimit = await perUserLimit(store, preview?.couponCode ?? null);

  return store.transaction(async (tx) => {
    // ---- Reads -------------------------------------------------------------
    const seen = await tx.hasWebhookEvent(event.provider, event.eventId);
    const order = orderId ? await tx.getOrder(orderId) : null;
    const redemptions =
      order?.couponCode && event.type === 'payment.captured' && couponLimit !== null
        ? await tx.countCouponRedemptions(order.userId, order.couponCode)
        : 0;

    if (seen) return { outcome: 'duplicate_event' as const, orderId };

    // ---- Decide ------------------------------------------------------------
    const outcome = decide(order, event);

    // ---- Writes ------------------------------------------------------------
    tx.recordWebhookEvent({
      provider: event.provider,
      eventId: event.eventId,
      type: event.type,
      outcome,
      orderId,
      receivedAt: at,
    });
    if (!order) return { outcome, orderId };

    const paymentStatus: Record<PaymentOutcome, PaymentRecordStatus | null> = {
      placed: 'captured',
      paid_needs_review: 'captured',
      already_paid: 'duplicate',
      amount_mismatch: 'amount_mismatch',
      payment_failed: 'failed',
      ignored: 'failed',
      duplicate_event: null,
      unknown_order: null,
    };
    const recordStatus = paymentStatus[outcome];
    if (recordStatus) recordPayment(tx, order, event, recordStatus, at);

    switch (outcome) {
      case 'placed': {
        const overLimit = couponLimit !== null && redemptions >= couponLimit;
        tx.updateOrder(order.id, {
          ...statusChange(order, 'placed', at),
          paymentStatus: 'paid',
          providerPaymentId: event.providerPaymentId,
          // The customer paid the agreed amount; a coupon raced past its limit is for a human to look at.
          needsReview: order.needsReview || overLimit,
        });
        if (order.couponCode) {
          tx.createCouponRedemption({
            userId: order.userId,
            couponCode: order.couponCode,
            orderId: order.id,
            createdAt: at,
          });
        }
        break;
      }
      case 'paid_needs_review':
        tx.updateOrder(order.id, {
          paymentStatus: 'paid',
          providerPaymentId: event.providerPaymentId,
          needsReview: true,
          updatedAt: at,
        });
        break;
      case 'already_paid':
        // A second, different payment for a paid order means the customer paid twice.
        if (event.providerPaymentId !== order.providerPaymentId) {
          tx.updateOrder(order.id, { needsReview: true, updatedAt: at });
        }
        break;
      case 'amount_mismatch':
        tx.updateOrder(order.id, { needsReview: true, updatedAt: at });
        break;
      case 'payment_failed':
        tx.updateOrder(order.id, {
          ...statusChange(order, 'payment_failed', at),
          paymentStatus: 'failed',
        });
        break;
      case 'ignored':
      case 'duplicate_event':
      case 'unknown_order':
        break;
    }
    return { outcome, orderId };
  });
}

function decide(order: Order | null, event: PaymentEvent): PaymentOutcome {
  if (!order) return 'unknown_order';
  if (event.type === 'payment.failed') {
    return order.status === 'pending_payment' ? 'payment_failed' : 'ignored';
  }
  if (event.amount !== order.bill.grandTotal || event.currency !== order.currency) {
    return 'amount_mismatch';
  }
  if (order.paymentStatus === 'paid') return 'already_paid';
  if (canTransition(order.status, 'placed')) return 'placed';
  return 'paid_needs_review';
}

function recordPayment(
  tx: StoreTx,
  order: Order,
  event: PaymentEvent,
  status: PaymentRecordStatus,
  at: string,
) {
  tx.createPayment({
    id: `pay_${randomId()}`,
    orderId: order.id,
    userId: order.userId,
    provider: event.provider,
    providerOrderId: event.providerOrderId,
    providerPaymentId: event.providerPaymentId,
    amount: event.amount,
    currency: event.currency,
    status,
    eventId: event.eventId,
    createdAt: at,
  });
}

/** The fields that change when an order moves to a new status. */
export function statusChange(order: Order, status: Order['status'], at: string): Partial<Order> {
  const entry: StatusChange = { status, at };
  return {
    status,
    statusHistory: [...order.statusHistory, entry],
    statusUpdatedAt: at,
    updatedAt: at,
  };
}

async function perUserLimit(catalog: CatalogReader, code: string | null): Promise<number | null> {
  if (!code) return null;
  return (await catalog.getCoupon(code))?.perUserLimit ?? null;
}
