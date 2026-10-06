/**
 * Offline stand-ins for the Razorpay and Stripe HTTP APIs, for tests only.
 *
 * Each simulator is a `fetch` replacement that answers the endpoints the
 * gateways call, with the documented request formats and response shapes,
 * and checks the credentials it was given. It also plays the provider's other
 * roles: completing a checkout (with the signature the provider would give the
 * browser) and sending webhooks (signed the way the provider signs them).
 *
 * Signatures here are made with node:crypto, independently of the
 * Web Crypto code under test.
 */
import { createHmac, randomBytes } from 'node:crypto';
import type { FetchLike } from '../src/gateways/http';

const hmacHex = (secret: string, message: string) =>
  createHmac('sha256', secret).update(message, 'utf8').digest('hex');

const id = (prefix: string, length = 14) =>
  `${prefix}${randomBytes(length)
    .toString('base64')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, length)
    .padEnd(length, 'x')}`;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export interface RecordedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

async function record(input: string, init: RequestInit): Promise<RecordedRequest> {
  const headers = Object.fromEntries(
    Object.entries((init.headers ?? {}) as Record<string, string>).map(([k, v]) => [
      k.toLowerCase(),
      v,
    ]),
  );
  return { method: init.method ?? 'GET', url: input, headers, body: String(init.body ?? '') };
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

export interface RazorpayKeysForTests {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export const RAZORPAY_TEST_KEYS: RazorpayKeysForTests = {
  keyId: 'rzp_test_QuickBiteTest01',
  keySecret: 'rzp-test-key-secret-for-tests',
  webhookSecret: 'rzp-test-webhook-secret-for-tests',
};

interface RzpOrder {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface RzpPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed';
  order_id: string;
  method: string;
  captured: boolean;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}

export class RazorpaySimulator {
  readonly orders = new Map<string, RzpOrder>();
  readonly payments = new Map<string, RzpPayment>();
  readonly requests: RecordedRequest[] = [];
  /** When set, every API call fails as if the network were down. */
  down = false;
  /** Seconds since the epoch, for created_at fields. */
  now = () => Math.floor(Date.now() / 1000);

  constructor(readonly keys: RazorpayKeysForTests = RAZORPAY_TEST_KEYS) {}

  readonly fetch: FetchLike = async (input, init) => {
    const request = await record(input, init);
    this.requests.push(request);
    if (this.down) throw new TypeError('fetch failed');
    const expectedAuth = `Basic ${Buffer.from(`${this.keys.keyId}:${this.keys.keySecret}`).toString('base64')}`;
    if (request.headers.authorization !== expectedAuth) {
      return json(401, {
        error: { code: 'BAD_REQUEST_ERROR', description: 'Authentication failed', source: 'NA' },
      });
    }
    const url = new URL(input);
    const path = url.pathname.replace(/^\/v1/, '');
    if (url.origin !== 'https://api.razorpay.com' || !url.pathname.startsWith('/v1/')) {
      return json(404, { error: { code: 'NOT_FOUND', description: 'Unknown URL' } });
    }

    if (request.method === 'POST' && path === '/orders') {
      const body = JSON.parse(request.body) as Partial<RzpOrder>;
      if (!Number.isInteger(body.amount) || (body.amount ?? 0) < 100) {
        return json(400, {
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'The amount must be atleast INR 1.00',
            field: 'amount',
          },
        });
      }
      if ((body.receipt ?? '').length > 40) {
        return json(400, {
          error: { code: 'BAD_REQUEST_ERROR', description: 'receipt: max 40 characters' },
        });
      }
      const order: RzpOrder = {
        id: id('order_'),
        entity: 'order',
        amount: body.amount!,
        amount_paid: 0,
        amount_due: body.amount!,
        currency: body.currency ?? 'INR',
        receipt: body.receipt ?? '',
        status: 'created',
        attempts: 0,
        notes: body.notes ?? {},
        created_at: this.now(),
      };
      this.orders.set(order.id, order);
      return json(200, order);
    }
    const payment = /^\/payments\/([^/]+)(\/capture)?$/.exec(path);
    if (payment) {
      const found = this.payments.get(payment[1]!);
      if (!found) {
        return json(400, {
          error: { code: 'BAD_REQUEST_ERROR', description: 'The id provided does not exist' },
        });
      }
      if (request.method === 'GET' && !payment[2]) return json(200, found);
      if (request.method === 'POST' && payment[2]) {
        const body = JSON.parse(request.body) as { amount: number; currency: string };
        if (found.status !== 'authorized') {
          return json(400, {
            error: {
              code: 'BAD_REQUEST_ERROR',
              description: 'This payment has already been captured',
            },
          });
        }
        if (body.amount !== found.amount || body.currency !== found.currency) {
          return json(400, {
            error: {
              code: 'BAD_REQUEST_ERROR',
              description: 'Capture amount must be equal to the amount authorized',
            },
          });
        }
        this.capture(found);
        return json(200, found);
      }
    }
    return json(404, { error: { code: 'NOT_FOUND', description: 'Unknown URL' } });
  };

  private capture(payment: RzpPayment) {
    payment.status = 'captured';
    payment.captured = true;
    const order = this.orders.get(payment.order_id)!;
    order.status = 'paid';
    order.amount_paid = order.amount;
    order.amount_due = 0;
  }

  /**
   * A customer completing Checkout for an order. Returns what Checkout gives
   * the success handler, signed with the key secret as Razorpay does.
   */
  pay(orderId: string, options: { capture?: 'automatic' | 'manual' } = {}) {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`No Razorpay order ${orderId}`);
    order.attempts++;
    order.status = 'attempted';
    const payment: RzpPayment = {
      id: id('pay_'),
      entity: 'payment',
      amount: order.amount,
      currency: order.currency,
      status: 'authorized',
      order_id: order.id,
      method: 'upi',
      captured: false,
      error_code: null,
      error_description: null,
      created_at: this.now(),
    };
    this.payments.set(payment.id, payment);
    if ((options.capture ?? 'automatic') === 'automatic') this.capture(payment);
    return {
      payment,
      checkout: {
        razorpay_payment_id: payment.id,
        razorpay_order_id: order.id,
        razorpay_signature: hmacHex(this.keys.keySecret, `${order.id}|${payment.id}`),
      },
    };
  }

  /** A declined attempt (Checkout lets the customer try again on the same order). */
  decline(orderId: string) {
    const order = this.orders.get(orderId)!;
    order.attempts++;
    order.status = 'attempted';
    const payment: RzpPayment = {
      id: id('pay_'),
      entity: 'payment',
      amount: order.amount,
      currency: order.currency,
      status: 'failed',
      order_id: order.id,
      method: 'card',
      captured: false,
      error_code: 'BAD_REQUEST_ERROR',
      error_description: 'Payment failed',
      created_at: this.now(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  /** A webhook as Razorpay sends it: JSON body, X-Razorpay-Signature over the raw bytes. */
  webhook(
    event: string,
    payment: RzpPayment,
    options: { createdAt?: number; secret?: string } = {},
  ): { rawBody: string; headers: Record<string, string> } {
    const order = this.orders.get(payment.order_id);
    const body = {
      entity: 'event',
      account_id: 'acc_QuickBiteTest01',
      event,
      contains: event === 'order.paid' ? ['payment', 'order'] : ['payment'],
      payload: {
        payment: { entity: { ...payment, notes: { note: 'Biryani ₹ 😋' } } },
        ...(event === 'order.paid' && order ? { order: { entity: order } } : {}),
      },
      created_at: options.createdAt ?? this.now(),
    };
    const rawBody = JSON.stringify(body);
    return {
      rawBody,
      headers: {
        'content-type': 'application/json',
        'x-razorpay-signature': hmacHex(options.secret ?? this.keys.webhookSecret, rawBody),
        'x-razorpay-event-id': id('evt_'),
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

export interface StripeKeysForTests {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export const STRIPE_TEST_KEYS: StripeKeysForTests = {
  secretKey: 'sk_test_QuickBiteTestSecret01',
  publishableKey: 'pk_test_QuickBiteTestPublishable01',
  webhookSecret: 'whsec_QuickBiteTestWebhookSecret01',
};

interface StripeIntent {
  id: string;
  object: 'payment_intent';
  amount: number;
  amount_received: number;
  currency: string;
  status: 'requires_payment_method' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata: Record<string, string>;
  description: string | null;
  livemode: boolean;
  last_payment_error: { code: string; message: string } | null;
}

export class StripeSimulator {
  readonly intents = new Map<string, StripeIntent>();
  readonly requests: RecordedRequest[] = [];
  private readonly idempotency = new Map<string, string>();
  down = false;
  now = () => Math.floor(Date.now() / 1000);

  constructor(readonly keys: StripeKeysForTests = STRIPE_TEST_KEYS) {}

  readonly fetch: FetchLike = async (input, init) => {
    const request = await record(input, init);
    this.requests.push(request);
    if (this.down) throw new TypeError('fetch failed');
    if (request.headers.authorization !== `Bearer ${this.keys.secretKey}`) {
      return json(401, {
        error: { type: 'invalid_request_error', message: 'Invalid API Key provided' },
      });
    }
    const url = new URL(input);
    if (url.origin !== 'https://api.stripe.com') return json(404, {});

    if (request.method === 'POST' && url.pathname === '/v1/payment_intents') {
      const key = request.headers['idempotency-key'];
      if (key && this.idempotency.has(key)) {
        return json(200, this.intents.get(this.idempotency.get(key)!));
      }
      const form = new URLSearchParams(request.body);
      const amount = Number(form.get('amount'));
      const currency = form.get('currency') ?? '';
      if (!Number.isInteger(amount) || amount < 1 || !/^[a-z]{3}$/.test(currency)) {
        return json(400, {
          error: {
            type: 'invalid_request_error',
            code: 'parameter_invalid_integer',
            message: 'Invalid amount or currency',
          },
        });
      }
      const pi = id('pi_3Q', 22);
      const metadata: Record<string, string> = {};
      for (const [k, v] of form) {
        const m = /^metadata\[(.+)\]$/.exec(k);
        if (m) metadata[m[1]!] = v;
      }
      const intent: StripeIntent = {
        id: pi,
        object: 'payment_intent',
        amount,
        amount_received: 0,
        currency,
        status: 'requires_payment_method',
        client_secret: `${pi}_secret_${id('', 24)}`,
        metadata,
        description: form.get('description'),
        livemode: false,
        last_payment_error: null,
      };
      this.intents.set(pi, intent);
      if (key) this.idempotency.set(key, pi);
      return json(200, intent);
    }
    const get = /^\/v1\/payment_intents\/([^/]+)$/.exec(url.pathname);
    if (request.method === 'GET' && get) {
      const intent = this.intents.get(decodeURIComponent(get[1]!));
      if (!intent) {
        return json(404, {
          error: {
            type: 'invalid_request_error',
            code: 'resource_missing',
            message: 'No such payment_intent',
          },
        });
      }
      return json(200, intent);
    }
    return json(404, {});
  };

  /** The customer's card is charged (amountReceived lets a test fake a short payment). */
  succeed(intentId: string, options: { amountReceived?: number; currency?: string } = {}) {
    const intent = this.intents.get(intentId)!;
    intent.status = 'succeeded';
    intent.amount_received = options.amountReceived ?? intent.amount;
    if (options.currency) intent.currency = options.currency;
    intent.last_payment_error = null;
    return this.webhook('payment_intent.succeeded', intent);
  }

  decline(intentId: string) {
    const intent = this.intents.get(intentId)!;
    intent.status = 'requires_payment_method';
    intent.last_payment_error = { code: 'card_declined', message: 'Your card was declined.' };
    return this.webhook('payment_intent.payment_failed', intent);
  }

  /**
   * A webhook as Stripe sends it: pretty-printed JSON (so only the raw bytes
   * verify) and Stripe-Signature: t=…,v1=HMAC(whsec, "t.body").
   */
  webhook(
    type: string,
    intent: StripeIntent,
    options: { timestamp?: number; secret?: string; livemode?: boolean } = {},
  ) {
    const t = options.timestamp ?? this.now();
    const body = {
      id: id('evt_3Q', 22),
      object: 'event',
      api_version: '2026-09-30.endive',
      created: t,
      data: { object: { ...intent } },
      livemode: options.livemode ?? false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      type,
    };
    const rawBody = JSON.stringify(body, null, 2);
    return {
      event: body,
      rawBody,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'stripe-signature': `t=${t},v1=${hmacHex(options.secret ?? this.keys.webhookSecret, `${t}.${rawBody}`)}`,
      },
    };
  }
}
