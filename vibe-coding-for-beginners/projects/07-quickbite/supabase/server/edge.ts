/**
 * The Supabase Edge Functions as plain fetch handlers (Request → Response).
 * Each function in supabase/functions/ is a two-line Deno file that serves one
 * of these; keeping them here means Node tests can run them too.
 *
 *   quote-order, create-order   signed-in customers (bearer token from Supabase Auth)
 *   start-payment               signed-in: payment details to retry an unpaid order
 *   verify-razorpay             signed-in: Razorpay Checkout's success handler output
 *   fake-pay                    fake mode only: plays the payment provider
 *   payment-webhook             what the providers call; the raw body is signature-checked
 *                               (…/payment-webhook?provider=razorpay|stripe|fake)
 *   scheduled-jobs              pg_cron calls it every minute (shared secret header)
 */
import {
  advanceDemoOrders,
  DEFAULT_DEMO_STEP_SECONDS,
  createPayments,
  expireUnpaidOrders,
  fakePay,
  OrderService,
  paymentsConfigFromEnv,
  ServerError,
  timingSafeEqual,
  type FakeGateway,
  type FetchLike,
  type OrderStore,
  type ServerErrorCode,
  type WebhookResponse,
} from '@quickbite/server';

export type Env = Record<string, string | undefined>;
export type Handler = (request: Request) => Promise<Response>;

export interface EdgeHandlers {
  quoteOrder: Handler;
  createOrder: Handler;
  startPayment: Handler;
  verifyRazorpay: Handler;
  fakePay: Handler;
  paymentWebhook: Handler;
  scheduledJobs: Handler;
}

export interface EdgeOptions {
  store: OrderStore;
  /**
   * Function environment (SUPABASE_URL, PAYMENTS_MODE, FAKE_WEBHOOK_SECRET,
   * RAZORPAY_* / STRIPE_* test keys, CRON_SECRET…).
   */
  env: Env;
  /** The signed-in customer's id for a request, or null (see supabaseAuthenticator). */
  authenticate: (request: Request) => Promise<string | null>;
  /** How fake-pay delivers its signed webhook. Defaults to an HTTP POST, like a real provider. */
  deliverWebhook?: (rawBody: string, headers: Record<string, string>) => Promise<WebhookResponse>;
  /** Replaces the network for calls to Razorpay and Stripe (tests). */
  providerFetch?: FetchLike;
  now?: () => Date;
  /** Waits between simulator runs inside one scheduled-jobs call (tests skip the wait). */
  sleep?: (ms: number) => Promise<void>;
}

/** The browser calls the functions from another origin (the web.app site). */
export const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-max-age': '86400',
};

const STATUS: Record<ServerErrorCode, number> = {
  'invalid-argument': 400,
  unauthenticated: 401,
  'permission-denied': 403,
  'not-found': 404,
  'failed-precondition': 412,
  'resource-exhausted': 429,
  unavailable: 503,
};

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const errorBody = (code: string, message: string) => ({ error: { code, message } });

/** Supabase runs functions locally behind http://kong:8000; production URLs are https://<ref>.supabase.co. */
export function isLocalSupabase(env: Env): boolean {
  if (env.QUICKBITE_LOCAL === 'true') return true;
  try {
    const host = new URL(env.SUPABASE_URL ?? '').hostname;
    return ['kong', 'localhost', '127.0.0.1', 'host.docker.internal'].includes(host);
  } catch {
    return false;
  }
}

/** Where fake-pay sends its webhook: this project's own payment-webhook function. */
export function fakeWebhookUrl(env: Env): string {
  if (env.FAKE_WEBHOOK_URL) return env.FAKE_WEBHOOK_URL;
  if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set');
  return `${env.SUPABASE_URL.replace(/\/$/, '')}/functions/v1/payment-webhook?provider=fake`;
}

/**
 * Asks Supabase Auth who a request's bearer token belongs to. This checks the
 * token's signature and expiry and that the session still exists, and works
 * with both legacy JWT secrets and asymmetric signing keys.
 */
export function supabaseAuthenticator(supabaseUrl: string, apiKey: string) {
  return async (request: Request): Promise<string | null> => {
    const token = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') ?? '')?.[1];
    if (!token) return null;
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { authorization: `Bearer ${token}`, apikey: apiKey },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; role?: string };
    return user.id && user.role === 'authenticated' ? user.id : null;
  };
}

export function createEdgeHandlers(options: EdgeOptions): EdgeHandlers {
  const { store, env } = options;
  const now = options.now ?? (() => new Date());
  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  // Built on first use, so a configuration problem is reported by the call that hits it.
  let services: { service: OrderService; fake: FakeGateway | null } | null = null;
  const getServices = () => {
    if (!services) {
      const config = paymentsConfigFromEnv(env, { local: isLocalSupabase(env) });
      const { fake, ...payments } = createPayments(config, { fetch: options.providerFetch });
      services = { fake, service: new OrderService({ store, ...payments, now }) };
    }
    return services;
  };

  const deliver =
    options.deliverWebhook ??
    (async (rawBody: string, headers: Record<string, string>): Promise<WebhookResponse> => {
      const res = await fetch(fakeWebhookUrl(env), { method: 'POST', headers, body: rawBody });
      return { status: res.status, body: (await res.json()) as WebhookResponse['body'] };
    });

  /** A function the signed-in customer calls from the browser with a JSON body. */
  const customerCall =
    (work: (userId: string, body: unknown) => Promise<unknown>): Handler =>
    async (request) => {
      if (request.method === 'OPTIONS')
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      if (request.method !== 'POST') {
        return json(405, errorBody('method-not-allowed', 'POST only'), CORS_HEADERS);
      }
      try {
        const userId = await options.authenticate(request);
        if (!userId) {
          return json(
            401,
            errorBody('unauthenticated', 'Please sign in to continue.'),
            CORS_HEADERS,
          );
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, errorBody('invalid-argument', 'Body must be JSON'), CORS_HEADERS);
        }
        return json(200, await work(userId, body), CORS_HEADERS);
      } catch (error) {
        if (error instanceof ServerError) {
          console.warn(`Rejected call: ${error.code} ${error.message}`);
          return json(STATUS[error.code], errorBody(error.code, error.message), CORS_HEADERS);
        }
        console.error(error);
        return json(
          500,
          errorBody('internal', 'Something went wrong. Please try again.'),
          CORS_HEADERS,
        );
      }
    };

  return {
    quoteOrder: customerCall((userId, body) => getServices().service.quote(userId, body)),

    createOrder: customerCall((userId, body) => getServices().service.placeOrder(userId, body)),

    startPayment: customerCall((userId, body) => getServices().service.startPayment(userId, body)),

    verifyRazorpay: customerCall((userId, body) =>
      getServices().service.confirmRazorpayPayment(userId, body),
    ),

    fakePay: customerCall((userId, body) => {
      const gateway = getServices().fake;
      if (!gateway) throw new ServerError('failed-precondition', 'Test payments are turned off.');
      return fakePay({ store, gateway, userId, input: body, deliver, now });
    }),

    paymentWebhook: async (request) => {
      if (request.method !== 'POST') return json(405, { received: false, error: 'POST only' });
      // ?provider=razorpay, or …/payment-webhook/razorpay
      const url = new URL(request.url);
      const last = url.pathname.split('/').filter(Boolean).at(-1);
      const provider =
        url.searchParams.get('provider') ?? (last && last !== 'payment-webhook' ? last : '');
      try {
        // The signature covers the exact bytes received, so verify the raw body.
        const rawBody = await request.text();
        const headers = Object.fromEntries(request.headers);
        const result = await getServices().service.handleWebhook(provider, rawBody, headers);
        if (result.status !== 200) console.warn('Rejected webhook', result.body);
        return json(result.status, result.body);
      } catch (error) {
        console.error(error);
        // A 500 makes the provider retry later; processing is idempotent.
        return json(500, { received: false, error: 'internal' });
      }
    },

    scheduledJobs: async (request) => {
      if (request.method !== 'POST') return json(405, { error: 'POST only' });
      const secret = env.CRON_SECRET ?? '';
      if (secret.length < 16) return json(503, { error: 'CRON_SECRET is not configured' });
      if (!timingSafeEqual(request.headers.get('x-cron-secret') ?? '', secret)) {
        return json(401, { error: 'Bad cron secret' });
      }
      const stepSeconds = Number(env.DEMO_STEP_SECONDS ?? DEFAULT_DEMO_STEP_SECONDS);
      // pg_cron fires once a minute; shorter steps run several times within one call.
      const runs = Math.max(1, Math.floor(50 / stepSeconds));
      let advanced = 0;
      for (let i = 0; i < runs; i++) {
        advanced += await advanceDemoOrders(store, { now: now(), stepSeconds });
        if (i < runs - 1) await sleep(stepSeconds * 1000);
      }
      const expired = await expireUnpaidOrders(store, { now: now() });
      return json(200, { advanced, expired });
    },
  };
}
