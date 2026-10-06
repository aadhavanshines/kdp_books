import type {
  Area,
  Coupon,
  MenuItem,
  Order,
  OrderStatus,
  PaymentProvider,
  Region,
  Restaurant,
} from '@quickbite/core';

/** A saved address as the server reads it. Coordinates come from the area, never from here. */
export interface StoredAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  areaId: string;
  pincode: string;
}

export type PaymentRecordStatus = 'captured' | 'failed' | 'amount_mismatch' | 'duplicate';

/** One payment attempt reported by a provider. Server-only. */
export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  providerOrderId: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  eventId: string;
  createdAt: string;
}

/** A processed webhook event. Its (provider, eventId) key is unique, so repeats are no-ops. */
export interface WebhookEventRecord {
  provider: PaymentProvider;
  eventId: string;
  type: string;
  outcome: string;
  orderId: string | null;
  receivedAt: string;
}

export interface CouponRedemption {
  userId: string;
  couponCode: string;
  orderId: string;
  createdAt: string;
}

/** Read-only catalog lookups (the server's own copy of prices). */
export interface CatalogReader {
  getRestaurant(id: string): Promise<Restaurant | null>;
  /** Items of one restaurant; ids that don't exist are simply missing from the result. */
  getMenuItems(restaurantId: string, itemIds: string[]): Promise<MenuItem[]>;
  getRegion(id: string): Promise<Region | null>;
  getArea(id: string): Promise<Area | null>;
  /** The private coupon record (not the public copy customers see). */
  getCoupon(code: string): Promise<Coupon | null>;
}

/**
 * Work done atomically. Reads must all happen before the first write (a
 * Firestore rule), which every caller in this package follows.
 */
export interface StoreTx {
  getOrder(id: string): Promise<Order | null>;
  findOrderIdByIdempotencyKey(userId: string, key: string): Promise<string | null>;
  countOrdersSince(userId: string, sinceIso: string): Promise<number>;
  hasWebhookEvent(provider: PaymentProvider, eventId: string): Promise<boolean>;
  countCouponRedemptions(userId: string, code: string): Promise<number>;

  /** Also records the (userId, idempotencyKey) → orderId mapping. */
  createOrder(order: Order): void;
  updateOrder(id: string, patch: Partial<Order>): void;
  createPayment(payment: PaymentRecord): void;
  recordWebhookEvent(event: WebhookEventRecord): void;
  createCouponRedemption(redemption: CouponRedemption): void;
}

/**
 * Everything the order workflow needs from a database. Each backend provides
 * one small adapter (Firestore here, Postgres later); the logic lives in this
 * package and is written once.
 */
export interface OrderStore extends CatalogReader {
  getAddress(userId: string, addressId: string): Promise<StoredAddress | null>;
  countCouponRedemptions(userId: string, code: string): Promise<number>;
  getOrder(id: string): Promise<Order | null>;
  findOrderIdByProviderOrderId(
    provider: PaymentProvider,
    providerOrderId: string,
  ): Promise<string | null>;
  /** Orders in one of `statuses` whose status last changed at or before `changedBefore`. */
  listOrdersByStatus(
    statuses: readonly OrderStatus[],
    changedBefore: string,
    limit: number,
  ): Promise<Order[]>;
  newOrderId(): string;
  transaction<T>(work: (tx: StoreTx) => Promise<T>): Promise<T>;
}
