/**
 * Payment configuration from environment variables, with the safety checks
 * from docs/PLAN.md §5:
 *
 *   PAYMENTS_MODE=fake   the fake provider for every region (local default).
 *                        Refused when live keys are configured.
 *   PAYMENTS_MODE=real   Razorpay and/or Stripe, chosen per region
 *                        (regions.paymentProvider: Razorpay for India, Stripe abroad).
 *
 * Real mode accepts only TEST keys unless PAYMENTS_LIVE=true, and with
 * PAYMENTS_LIVE=true it accepts only live keys, so test and live never mix.
 * A deployment must choose its mode explicitly.
 */
import type { PaymentProvider } from '@quickbite/core';
import { FakeGateway } from './gateways/fake';
import type { FetchLike } from './gateways/http';
import { RazorpayGateway } from './gateways/razorpay';
import { StripeGateway } from './gateways/stripe';
import type { PaymentGateway } from './gateways/types';

export type PaymentsMode = 'fake' | 'real';
export type RealProvider = Exclude<PaymentProvider, 'fake'>;

export interface RazorpayKeys {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface StripeKeys {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export type PaymentsConfig =
  | { mode: 'fake'; fakeWebhookSecret: string }
  | {
      mode: 'real';
      /** True only with PAYMENTS_LIVE=true (and live keys). */
      live: boolean;
      razorpay: RazorpayKeys | null;
      stripe: StripeKeys | null;
      /**
       * Test mode only: region id → provider, overriding the region's own
       * choice (e.g. IN=stripe to try Stripe test payments before a Stripe
       * region exists). From PAYMENTS_REGION_PROVIDERS="IN=stripe,GB=stripe".
       */
      regionProviders: Record<string, RealProvider>;
    };

/** Only ever used on local emulators and in tests. */
export const LOCAL_FAKE_WEBHOOK_SECRET = 'local-dev-fake-webhook-secret';

type Env = Record<string, string | undefined>;

const LIVE_KEY = /^(rzp_live_|sk_live_|rk_live_|pk_live_)/;

export function paymentsConfigFromEnv(env: Env, { local }: { local: boolean }): PaymentsConfig {
  const mode = env.PAYMENTS_MODE ?? (local ? 'fake' : undefined);
  if (!mode) throw new Error('PAYMENTS_MODE must be set (fake or real).');
  if (mode === 'fake') return fakeConfig(env, local);
  if (mode === 'real') return realConfig(env);
  throw new Error(`Unknown PAYMENTS_MODE "${mode}". Use fake or real.`);
}

function fakeConfig(env: Env, local: boolean): PaymentsConfig {
  const liveKeys = ['RAZORPAY_KEY_ID', 'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'].filter(
    (name) => LIVE_KEY.test(env[name] ?? ''),
  );
  if (liveKeys.length > 0) {
    throw new Error(
      `Refusing fake payments while live keys are configured (${liveKeys.join(', ')}).`,
    );
  }
  const secret = env.FAKE_WEBHOOK_SECRET ?? (local ? LOCAL_FAKE_WEBHOOK_SECRET : undefined);
  if (!secret || secret.length < 16) {
    throw new Error('FAKE_WEBHOOK_SECRET must be set to at least 16 characters.');
  }
  return { mode: 'fake', fakeWebhookSecret: secret };
}

function realConfig(env: Env): PaymentsConfig {
  const liveFlag = env.PAYMENTS_LIVE ?? 'false';
  if (liveFlag !== 'true' && liveFlag !== 'false') {
    throw new Error('PAYMENTS_LIVE must be true or false.');
  }
  const live = liveFlag === 'true';
  const keyMode = live ? 'live' : 'test';

  /** All of a provider's variables, or none of them. */
  const group = (names: string[]): string[] | null => {
    const values = names.map((n) => env[n]?.trim() ?? '');
    if (values.every((v) => !v)) return null;
    const missing = names.filter((_, i) => !values[i]);
    if (missing.length > 0) throw new Error(`Missing ${missing.join(', ')}.`);
    return values;
  };
  const expect = (name: string, value: string, pattern: RegExp, what: string) => {
    if (!pattern.test(value)) {
      throw new Error(
        `${name} must be a ${keyMode}-mode ${what}` +
          (live ? '.' : ' (live keys need PAYMENTS_LIVE=true, a production launch step).'),
      );
    }
  };

  let razorpay: RazorpayKeys | null = null;
  const rzp = group(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET']);
  if (rzp) {
    const [keyId, keySecret, webhookSecret] = rzp as [string, string, string];
    expect('RAZORPAY_KEY_ID', keyId, new RegExp(`^rzp_${keyMode}_[A-Za-z0-9]+$`), 'key id');
    razorpay = { keyId, keySecret, webhookSecret };
  }

  let stripe: StripeKeys | null = null;
  const st = group(['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET']);
  if (st) {
    const [secretKey, publishableKey, webhookSecret] = st as [string, string, string];
    expect('STRIPE_SECRET_KEY', secretKey, new RegExp(`^(sk|rk)_${keyMode}_\\w+$`), 'secret key');
    expect('STRIPE_PUBLISHABLE_KEY', publishableKey, new RegExp(`^pk_${keyMode}_\\w+$`), 'key');
    expect('STRIPE_WEBHOOK_SECRET', webhookSecret, /^whsec_\w+$/, 'webhook signing secret');
    stripe = { secretKey, publishableKey, webhookSecret };
  }

  if (!razorpay && !stripe) {
    throw new Error('PAYMENTS_MODE=real needs Razorpay and/or Stripe keys.');
  }

  const regionProviders: Record<string, RealProvider> = {};
  for (const entry of (env.PAYMENTS_REGION_PROVIDERS ?? '').split(',')) {
    if (!entry.trim()) continue;
    const match = /^\s*([A-Z]{2,8})\s*=\s*(razorpay|stripe)\s*$/.exec(entry);
    if (!match) throw new Error(`Bad PAYMENTS_REGION_PROVIDERS entry "${entry}".`);
    regionProviders[match[1]!] = match[2] as RealProvider;
  }
  if (live && Object.keys(regionProviders).length > 0) {
    throw new Error('PAYMENTS_REGION_PROVIDERS is for test mode only.');
  }
  return { mode: 'real', live, razorpay, stripe, regionProviders };
}

/** The gateways and region choices OrderService needs, built from a configuration. */
export interface PaymentsSetup {
  gateways: Partial<Record<PaymentProvider, PaymentGateway>>;
  regionProviders: Record<string, RealProvider>;
  /** The fake provider in fake mode (fakePay signs its webhooks with it), else null. */
  fake: FakeGateway | null;
}

export function createPayments(
  config: PaymentsConfig,
  options: { fetch?: FetchLike } = {},
): PaymentsSetup {
  if (config.mode === 'fake') {
    const fake = new FakeGateway(config.fakeWebhookSecret);
    return { gateways: { fake }, regionProviders: {}, fake };
  }
  const gateways: PaymentsSetup['gateways'] = {};
  if (config.razorpay) gateways.razorpay = new RazorpayGateway({ ...config.razorpay, ...options });
  if (config.stripe) gateways.stripe = new StripeGateway({ ...config.stripe, ...options });
  return { gateways, regionProviders: config.regionProviders, fake: null };
}
