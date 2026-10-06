import type { OrderStatus } from './orderStatus';
import type { Bill } from './pricing';
import type { QuoteError, QuoteLine } from './quote';

export type PaymentProvider = 'fake' | 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface StatusChange {
  status: OrderStatus;
  /** ISO 8601 UTC timestamp. */
  at: string;
}

/** A copy of the delivery address taken when the order was placed. */
export interface OrderAddress {
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  areaId: string;
  areaName: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
}

/** A copy of the restaurant's card details taken when the order was placed. */
export interface OrderRestaurant {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  imageUrl: string;
  locality: string;
}

/**
 * An order as stored by every backend. Items, address and restaurant are
 * snapshots, so later menu edits never change a past order.
 *
 * Every timestamp is an ISO 8601 string in UTC (always the same length, so
 * they sort correctly as text).
 */
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: OrderRestaurant;
  status: OrderStatus;
  statusHistory: StatusChange[];
  items: QuoteLine[];
  address: OrderAddress;
  bill: Bill;
  /** Restaurant-to-address distance the delivery fee was based on. */
  distanceKm: number;
  currency: string;
  couponCode: string | null;
  note: string;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  providerOrderId: string | null;
  /** The provider's id for the capture that paid this order. */
  providerPaymentId: string | null;
  idempotencyKey: string;
  /** Set when a payment needs a human to look at it (wrong amount, paid after expiry…). */
  needsReview: boolean;
  etaMinutes: { min: number; max: number };
  createdAt: string;
  updatedAt: string;
  statusUpdatedAt: string;
}

/** Customer-facing errors when placing an order. */
export type PlaceOrderError =
  | QuoteError
  | 'COUPON_NOT_APPLICABLE'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE_ITEMS'
  /** No payment provider is set up for the restaurant's region. */
  | 'PAYMENTS_UNAVAILABLE'
  /** The same checkout (idempotency key) was already paid for. */
  | 'ALREADY_PAID'
  /** The same checkout's order expired unpaid; start a new checkout. */
  | 'CHECKOUT_EXPIRED';

interface PaymentStartBase {
  providerOrderId: string;
  /** Minor units, set by the server on the provider's order / intent. */
  amount: number;
  currency: string;
}

/**
 * What the browser needs to open the provider's checkout for an order. Only
 * public values: the Razorpay key id and the Stripe publishable key are public
 * by design, and a Stripe client secret is only ever sent to the order's owner.
 */
export type PaymentStart =
  | (PaymentStartBase & { provider: 'fake' })
  /** Razorpay Checkout: `providerOrderId` is the Razorpay order id (order_…). */
  | (PaymentStartBase & { provider: 'razorpay'; keyId: string })
  /** Stripe Payment Element: `providerOrderId` is the PaymentIntent id (pi_…). */
  | (PaymentStartBase & { provider: 'stripe'; publishableKey: string; clientSecret: string });

/** What Razorpay Checkout hands the success handler, sent on to the server to verify. */
export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type PlaceOrderResult =
  { ok: true; orderId: string; payment: PaymentStart } | { ok: false; error: PlaceOrderError };
