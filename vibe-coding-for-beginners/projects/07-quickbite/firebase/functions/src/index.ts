/**
 * QuickBite Cloud Functions: the only code that creates orders or marks them
 * paid. The browser calls the callables with ids and quantities; prices come
 * from Firestore and payments only count after a verified webhook.
 *
 *   quoteOrder, createOrder   callables (signed-in customers)
 *   startPayment              callable: payment details to retry an unpaid order
 *   verifyRazorpayPayment     callable: Razorpay Checkout's success handler output
 *   fakePay                   callable, fake mode only: plays the payment provider
 *   paymentWebhook            HTTP endpoint the providers call (raw body is signature-checked):
 *                             …/paymentWebhook?provider=razorpay|stripe|fake
 *
 * Payments: PAYMENTS_MODE=fake (emulator default) or real with Razorpay and/or
 * Stripe TEST keys (see packages/server/src/config.ts and the README).
 *   advanceDemoOrders         schedule: moves paid orders along the tracking steps
 *   expireUnpaidOrders        schedule: expires orders unpaid for 30 minutes
 */
import {
  advanceDemoOrders as advanceOrders,
  createPayments,
  DEFAULT_DEMO_STEP_SECONDS,
  expireUnpaidOrders as expireOrders,
  fakePay as fakePayment,
  OrderService,
  type FakeGateway,
  paymentsConfigFromEnv,
  ServerError,
  type WebhookResponse,
} from '@quickbite/server';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall, onRequest, type CallableRequest } from 'firebase-functions/https';
import { onSchedule } from 'firebase-functions/scheduler';
import { FirestoreOrderStore } from './firestoreStore';
import { paymentSecrets } from './secrets';

export const REGION = 'asia-south1';
setGlobalOptions({ region: REGION, maxInstances: 10, secrets: paymentSecrets });

initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
const store = new FirestoreOrderStore(db);

// Built on first use, so a configuration problem is reported by the call that hits it.
let services: { service: OrderService; fake: FakeGateway | null } | null = null;
function getServices() {
  if (!services) {
    const { fake, ...payments } = createPayments(
      paymentsConfigFromEnv(process.env, { local: isEmulator }),
    );
    services = { fake, service: new OrderService({ store, ...payments }) };
  }
  return services;
}

function requireUid(request: CallableRequest): string {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in to continue.');
  return uid;
}

/** Turns known errors into callable errors; anything else is logged and hidden. */
async function callable<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (error instanceof ServerError) {
      logger.warn(`Rejected call: ${error.code} ${error.message}`);
      throw new HttpsError(error.code, error.message);
    }
    logger.error(error);
    throw new HttpsError('internal', 'Something went wrong. Please try again.');
  }
}

export const quoteOrder = onCall((request) =>
  callable(() => getServices().service.quote(requireUid(request), request.data)),
);

export const createOrder = onCall((request) =>
  callable(() => getServices().service.placeOrder(requireUid(request), request.data)),
);

/** Where fakePay delivers its signed webhook: this project's own paymentWebhook endpoint. */
function webhookUrl(): string {
  if (process.env.FAKE_WEBHOOK_URL) return process.env.FAKE_WEBHOOK_URL;
  const project = process.env.GCLOUD_PROJECT;
  if (isEmulator) {
    const host = process.env.FUNCTIONS_EMULATOR_HOST ?? '127.0.0.1:5001';
    return `http://${host}/${project}/${REGION}/paymentWebhook?provider=fake`;
  }
  return `https://${REGION}-${project}.cloudfunctions.net/paymentWebhook?provider=fake`;
}

export const startPayment = onCall((request) =>
  callable(() => getServices().service.startPayment(requireUid(request), request.data)),
);

export const verifyRazorpayPayment = onCall((request) =>
  callable(() => getServices().service.confirmRazorpayPayment(requireUid(request), request.data)),
);

export const fakePay = onCall((request) =>
  callable(async () => {
    const uid = requireUid(request);
    const gateway = getServices().fake;
    if (!gateway) throw new HttpsError('failed-precondition', 'Test payments are turned off.');
    return fakePayment({
      store,
      gateway,
      userId: uid,
      input: request.data,
      // Over HTTP, exactly like a real provider calling the webhook.
      deliver: async (rawBody, headers): Promise<WebhookResponse> => {
        const res = await fetch(webhookUrl(), { method: 'POST', headers, body: rawBody });
        return { status: res.status, body: (await res.json()) as WebhookResponse['body'] };
      },
    });
  }),
);

export const paymentWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ received: false, error: 'POST only' });
    return;
  }
  // ?provider=razorpay, or …/paymentWebhook/razorpay
  const provider = String(req.query.provider ?? req.path.split('/').filter(Boolean).at(-1) ?? '');
  try {
    // The signature covers the exact bytes received, so verify the raw body.
    const rawBody = req.rawBody?.toString('utf8') ?? '';
    const result = await getServices().service.handleWebhook(provider, rawBody, req.headers);
    if (result.status !== 200) logger.warn('Rejected webhook', result.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    logger.error(error);
    // A 500 makes the provider retry later; processing is idempotent.
    res.status(500).json({ received: false, error: 'internal' });
  }
});

const stepSeconds = Number(process.env.DEMO_STEP_SECONDS ?? DEFAULT_DEMO_STEP_SECONDS);

export const advanceDemoOrders = onSchedule(
  { schedule: 'every 1 minutes', timeoutSeconds: 120, secrets: [] },
  async () => {
    // Schedules fire once a minute; shorter steps run several times within one invocation.
    const runs = Math.max(1, Math.floor(50 / stepSeconds));
    for (let i = 0; i < runs; i++) {
      await advanceOrders(store, { now: new Date(), stepSeconds });
      if (i < runs - 1) await new Promise((r) => setTimeout(r, stepSeconds * 1000));
    }
  },
);

export const expireUnpaidOrders = onSchedule(
  { schedule: 'every 5 minutes', secrets: [] },
  async () => {
    const expired = await expireOrders(store, { now: new Date() });
    if (expired) logger.info(`Expired ${expired} unpaid orders`);
  },
);
