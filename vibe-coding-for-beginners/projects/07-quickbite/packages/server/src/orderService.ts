/**
 * The order workflow, written once and used by every backend:
 * quote → place (server-priced, idempotent, rate limited) → payment webhooks.
 *
 * The browser only ever sends ids and quantities. Every price comes from the
 * store, and an order becomes "placed" only through a verified webhook whose
 * amount and currency match the order (see payments.ts).
 */
import {
  addressPoint,
  buildQuote,
  confirmRazorpayRequestSchema,
  fakePayRequestSchema,
  normalizeCouponCode,
  placeOrderRequestSchema,
  quoteRequestSchema,
  startPaymentRequestSchema,
  type Order,
  type PaymentProvider,
  type PaymentStart,
  type PlaceOrderResult,
  type Quote,
  type QuoteRequest,
  type Region,
} from '@quickbite/core';
import type { z } from 'zod';
import type { RealProvider } from './config';
import {
  PaymentVerificationError,
  ProviderApiError,
  ServerError,
  WebhookVerificationError,
} from './errors';
import type { FakeGateway } from './gateways/fake';
import type { RazorpayGateway } from './gateways/razorpay';
import type { HeaderBag, PaymentGateway } from './gateways/types';
import { applyPaymentEvent, type PaymentOutcome } from './payments';
import type { OrderStore, StoredAddress } from './store';

export interface RateLimit {
  maxOrders: number;
  windowSeconds: number;
}

export const DEFAULT_RATE_LIMIT: RateLimit = { maxOrders: 10, windowSeconds: 60 };

export interface OrderServiceOptions {
  store: OrderStore;
  /**
   * The configured providers. With `fake` present every region pays with the
   * fake provider (and no real gateway may be configured alongside it);
   * otherwise each region uses its own `paymentProvider`.
   */
  gateways: Partial<Record<PaymentProvider, PaymentGateway>>;
  /** Test-mode overrides of a region's provider (see PAYMENTS_REGION_PROVIDERS). */
  regionProviders?: Record<string, RealProvider>;
  now?: () => Date;
  rateLimit?: RateLimit;
}

export interface WebhookResponse {
  status: number;
  body: { received: boolean; outcome?: PaymentOutcome; error?: string };
}

function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const where = result.error.issues[0]?.path.join('.') || 'request';
    throw new ServerError('invalid-argument', `Invalid ${where}`);
  }
  return result.data;
}

export class OrderService {
  private readonly store: OrderStore;
  private readonly gateways: Partial<Record<PaymentProvider, PaymentGateway>>;
  private readonly regionProviders: Record<string, RealProvider>;
  private readonly now: () => Date;
  private readonly rateLimit: RateLimit;

  constructor(options: OrderServiceOptions) {
    this.store = options.store;
    this.gateways = options.gateways;
    this.regionProviders = options.regionProviders ?? {};
    if (this.gateways.fake && (this.gateways.razorpay || this.gateways.stripe)) {
      throw new Error('Fake payments cannot run alongside real payment providers.');
    }
    this.now = options.now ?? (() => new Date());
    this.rateLimit = options.rateLimit ?? DEFAULT_RATE_LIMIT;
  }

  /** The gateway that takes payments for a region, or null when none is configured. */
  gatewayForRegion(region: Region): PaymentGateway | null {
    if (this.gateways.fake) return this.gateways.fake;
    const provider = this.regionProviders[region.id] ?? region.paymentProvider;
    return this.gateways[provider] ?? null;
  }

  /** Prices a cart for a customer. `input` is untrusted and validated here. */
  async quote(userId: string, input: unknown): Promise<Quote> {
    const request = parse(quoteRequestSchema, input);
    return (await this.price(userId, request)).quote;
  }

  /**
   * Creates an order waiting for payment and the provider payment for exactly
   * its server-calculated total. Sending the same idempotency key again
   * returns the same order instead of creating another one.
   */
  async placeOrder(userId: string, input: unknown): Promise<PlaceOrderResult> {
    const request = parse(placeOrderRequestSchema, input);

    const existingId = await this.store.transaction((tx) =>
      tx.findOrderIdByIdempotencyKey(userId, request.idempotencyKey),
    );
    if (existingId) return this.resume(userId, existingId);

    const { quote, address, region } = await this.price(userId, request);
    if (!quote.ok) return quote;
    const gateway = region ? this.gatewayForRegion(region) : null;
    if (!gateway) return { ok: false, error: 'PAYMENTS_UNAVAILABLE' };
    if (quote.unavailableItemIds.length > 0) return { ok: false, error: 'UNAVAILABLE_ITEMS' };
    // What the customer saw is what they pay: a coupon that no longer applies stops the order.
    if (request.couponCode && !quote.bill.appliedCouponCode) {
      return { ok: false, error: 'COUPON_NOT_APPLICABLE' };
    }

    const restaurant = (await this.store.getRestaurant(request.restaurantId))!;
    const area = (await this.store.getArea(address!.areaId))!;
    const now = this.now();
    const at = now.toISOString();
    const order: Order = {
      id: this.store.newOrderId(),
      userId,
      restaurantId: restaurant.id,
      restaurant: {
        id: restaurant.id,
        brandId: restaurant.brandId,
        name: restaurant.name,
        slug: restaurant.slug,
        imageUrl: restaurant.imageUrl,
        locality: restaurant.locality,
      },
      status: 'pending_payment',
      statusHistory: [{ status: 'pending_payment', at }],
      items: quote.lines,
      address: {
        label: address!.label,
        name: address!.name,
        phone: address!.phone,
        line1: address!.line1,
        line2: address!.line2,
        landmark: address!.landmark,
        areaId: area.id,
        areaName: area.name,
        city: area.city,
        pincode: address!.pincode,
        ...addressPoint(area),
      },
      bill: quote.bill,
      distanceKm: quote.distanceKm,
      currency: quote.bill.currency,
      couponCode: quote.bill.appliedCouponCode,
      note: request.note ?? '',
      paymentProvider: gateway.provider,
      paymentStatus: 'pending',
      providerOrderId: null,
      providerPaymentId: null,
      idempotencyKey: request.idempotencyKey,
      needsReview: false,
      etaMinutes: { min: restaurant.deliveryTimeMin, max: restaurant.deliveryTimeMax },
      createdAt: at,
      updatedAt: at,
      statusUpdatedAt: at,
    };

    const since = new Date(now.getTime() - this.rateLimit.windowSeconds * 1000).toISOString();
    const created = await this.store.transaction(async (tx) => {
      const raced = await tx.findOrderIdByIdempotencyKey(userId, request.idempotencyKey);
      const recent = await tx.countOrdersSince(userId, since);
      if (raced) return { raced };
      if (recent >= this.rateLimit.maxOrders) return { limited: true };
      tx.createOrder(order);
      return { created: true };
    });
    if ('raced' in created) return this.resume(userId, created.raced!);
    if ('limited' in created) return { ok: false, error: 'RATE_LIMITED' };

    return { ok: true, orderId: order.id, payment: await this.ensurePayment(order) };
  }

  /**
   * The payment details for one of the customer's orders that still needs
   * paying: "Complete payment" / "Try paying again" on the order page.
   */
  async startPayment(userId: string, input: unknown): Promise<PaymentStart> {
    const { orderId } = parse(startPaymentRequestSchema, input);
    const order = await this.getOrderFor(userId, orderId);
    if (order.paymentStatus === 'paid' || !isAwaitingPayment(order)) {
      throw new ServerError('failed-precondition', 'This order is not waiting for payment');
    }
    return this.ensurePayment(order);
  }

  /**
   * Razorpay Checkout's success handler output, sent on by the browser. The
   * signature is checked against the Razorpay order id stored on our order,
   * then Razorpay's own record of the payment decides; the order is placed in
   * the same transaction a webhook would use. Returns "pending" when Razorpay
   * hasn't captured the payment yet (its webhook completes the order then).
   */
  async confirmRazorpayPayment(
    userId: string,
    input: unknown,
  ): Promise<{ outcome: PaymentOutcome | 'pending' }> {
    const request = parse(confirmRazorpayRequestSchema, input);
    const order = await this.getOrderFor(userId, request.orderId);
    const gateway = this.gateways.razorpay as RazorpayGateway | undefined;
    if (order.paymentProvider !== 'razorpay' || !order.providerOrderId || !gateway) {
      throw new ServerError('failed-precondition', 'This order is not paid with Razorpay');
    }
    if (request.razorpay_order_id !== order.providerOrderId) {
      throw new ServerError('permission-denied', 'Payment could not be verified');
    }
    let event;
    try {
      event = await gateway.settleCheckoutPayment({
        providerOrderId: order.providerOrderId,
        paymentId: request.razorpay_payment_id,
        signature: request.razorpay_signature,
        amount: order.bill.grandTotal,
        currency: order.currency,
      });
    } catch (error) {
      if (error instanceof PaymentVerificationError) {
        throw new ServerError('permission-denied', 'Payment could not be verified');
      }
      throw providerUnavailable(error);
    }
    if (!event) return { outcome: 'pending' };
    const { outcome } = await applyPaymentEvent(this.store, event, this.now());
    return { outcome };
  }

  /**
   * Handles a provider webhook (`provider` comes from the URL). The signature
   * is checked on the raw body before anything is parsed or stored.
   */
  async handleWebhook(
    provider: string,
    rawBody: string,
    headers: HeaderBag,
  ): Promise<WebhookResponse> {
    const gateway = Object.hasOwn(this.gateways, provider)
      ? this.gateways[provider as PaymentProvider]
      : undefined;
    if (!gateway) {
      return { status: 404, body: { received: false, error: `Unknown provider ${provider}` } };
    }
    let event;
    try {
      event = await gateway.verifyWebhook(rawBody, headers, this.now());
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        return { status: 400, body: { received: false, error: error.message } };
      }
      throw error;
    }
    // Genuine, but not an event this app acts on (refunds, authorizations…).
    if (!event) return { status: 200, body: { received: true, outcome: 'ignored' } };
    const { outcome } = await applyPaymentEvent(this.store, event, this.now());
    return { status: 200, body: { received: true, outcome } };
  }

  /** Reads one of the customer's own orders (server-side callers only; browsers read via rules). */
  async getOrderFor(userId: string, orderId: string): Promise<Order> {
    const order = await this.store.getOrder(orderId);
    if (!order || order.userId !== userId) throw new ServerError('not-found', 'Order not found');
    return order;
  }

  // -------------------------------------------------------------------------

  private async price(
    userId: string,
    request: QuoteRequest,
  ): Promise<{ quote: Quote; address: StoredAddress | null; region: Region | null }> {
    const code = request.couponCode ? normalizeCouponCode(request.couponCode) : null;
    const [restaurant, address, coupon, redemptions] = await Promise.all([
      this.store.getRestaurant(request.restaurantId),
      this.store.getAddress(userId, request.addressId),
      code ? this.store.getCoupon(code) : null,
      code ? this.store.countCouponRedemptions(userId, code) : 0,
    ]);
    const [region, area, items] = await Promise.all([
      restaurant ? this.store.getRegion(restaurant.regionId) : null,
      address ? this.store.getArea(address.areaId) : null,
      this.store.getMenuItems(request.restaurantId, [
        ...new Set(request.items.map((i) => i.itemId)),
      ]),
    ]);
    const quote = buildQuote({
      request,
      restaurant,
      region,
      addressArea: area,
      items,
      coupon,
      userCouponRedemptions: redemptions,
      now: this.now(),
    });
    return { quote, address, region };
  }

  /** Returns an existing order (same idempotency key) with its payment details. */
  private async resume(userId: string, orderId: string): Promise<PlaceOrderResult> {
    const order = await this.getOrderFor(userId, orderId);
    if (order.paymentStatus === 'paid') return { ok: false, error: 'ALREADY_PAID' };
    if (!isAwaitingPayment(order)) return { ok: false, error: 'CHECKOUT_EXPIRED' };
    return { ok: true, orderId: order.id, payment: await this.ensurePayment(order) };
  }

  /** Creates the provider payment once; later calls reuse it. */
  private async ensurePayment(order: Order): Promise<PaymentStart> {
    const gateway = this.gateways[order.paymentProvider];
    if (!gateway) {
      throw new ServerError(
        'failed-precondition',
        'This order’s payment provider is not available',
      );
    }
    const amounts = { amount: order.bill.grandTotal, currency: order.currency };
    try {
      if (order.providerOrderId) {
        return await gateway.resumePayment({ providerOrderId: order.providerOrderId, ...amounts });
      }
      const created = await gateway.createPayment({ orderId: order.id, ...amounts });
      // Two requests may race here; the first provider order stored wins and both use it.
      const stored = await this.store.transaction(async (tx) => {
        const current = await tx.getOrder(order.id);
        if (current?.providerOrderId) return current.providerOrderId;
        tx.updateOrder(order.id, {
          providerOrderId: created.providerOrderId,
          updatedAt: this.now().toISOString(),
        });
        return created.providerOrderId;
      });
      if (stored === created.providerOrderId) return created;
      return await gateway.resumePayment({ providerOrderId: stored, ...amounts });
    } catch (error) {
      throw providerUnavailable(error);
    }
  }
}

function isAwaitingPayment(order: Order): boolean {
  return order.status === 'pending_payment' || order.status === 'payment_failed';
}

/** A provider outage becomes a retryable error for the customer; anything else is rethrown. */
function providerUnavailable(error: unknown): unknown {
  if (!(error instanceof ProviderApiError)) return error;
  console.warn(error.message);
  return new ServerError(
    'unavailable',
    'The payment provider is not responding. Please try again in a moment.',
  );
}

/**
 * The "provider" side of fake payments: builds and signs the webhook a
 * provider would send for a customer's Success / Fail tap, then delivers it
 * to the real webhook handler through `deliver` (an HTTP POST in Cloud
 * Functions, a direct call in tests and the in-memory backend).
 */
export async function fakePay(options: {
  store: OrderStore;
  gateway: FakeGateway;
  userId: string;
  input: unknown;
  deliver: (rawBody: string, headers: Record<string, string>) => Promise<WebhookResponse>;
  now?: () => Date;
}): Promise<{ outcome: PaymentOutcome | null }> {
  const now = options.now ?? (() => new Date());
  const { orderId, outcome } = parse(fakePayRequestSchema, options.input);
  const order = await options.store.getOrder(orderId);
  if (!order || order.userId !== options.userId) {
    throw new ServerError('not-found', 'Order not found');
  }
  if (order.paymentProvider !== 'fake' || !order.providerOrderId) {
    throw new ServerError('failed-precondition', 'This order is not a test-mode order');
  }
  if (!isAwaitingPayment(order)) {
    throw new ServerError('failed-precondition', 'This order is not waiting for payment');
  }
  const event = options.gateway.buildEvent({
    providerOrderId: order.providerOrderId,
    outcome,
    // A provider charges what was set when the payment was created: the order total.
    amount: order.bill.grandTotal,
    currency: order.currency,
    now: now(),
  });
  const rawBody = JSON.stringify(event);
  const response = await options.deliver(rawBody, await options.gateway.sign(rawBody, now()));
  if (response.status !== 200) {
    throw new ServerError('failed-precondition', `Webhook rejected: ${response.body.error}`);
  }
  return { outcome: response.body.outcome ?? null };
}
