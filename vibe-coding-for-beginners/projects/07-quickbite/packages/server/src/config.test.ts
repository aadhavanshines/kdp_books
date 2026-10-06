import { describe, expect, it } from 'vitest';
import { createPayments, LOCAL_FAKE_WEBHOOK_SECRET, paymentsConfigFromEnv } from './config';

const RAZORPAY_TEST = {
  RAZORPAY_KEY_ID: 'rzp_test_AbCdEf123456',
  RAZORPAY_KEY_SECRET: 'test-key-secret',
  RAZORPAY_WEBHOOK_SECRET: 'test-webhook-secret',
};
const STRIPE_TEST = {
  STRIPE_SECRET_KEY: 'sk_test_51AbC',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51AbC',
  STRIPE_WEBHOOK_SECRET: 'whsec_abc123',
};

describe('paymentsConfigFromEnv: fake mode', () => {
  it('defaults to fake payments with a local secret on emulators only', () => {
    expect(paymentsConfigFromEnv({}, { local: true })).toEqual({
      mode: 'fake',
      fakeWebhookSecret: LOCAL_FAKE_WEBHOOK_SECRET,
    });
    expect(() => paymentsConfigFromEnv({}, { local: false })).toThrow(/PAYMENTS_MODE/);
    expect(() => paymentsConfigFromEnv({ PAYMENTS_MODE: 'fake' }, { local: false })).toThrow(
      /FAKE_WEBHOOK_SECRET/,
    );
    expect(
      paymentsConfigFromEnv(
        { PAYMENTS_MODE: 'fake', FAKE_WEBHOOK_SECRET: 'a-long-enough-demo-secret' },
        { local: false },
      ).mode,
    ).toBe('fake');
  });

  it('refuses fake mode when live keys are configured', () => {
    for (const env of [
      { RAZORPAY_KEY_ID: 'rzp_live_abc' },
      { STRIPE_SECRET_KEY: 'sk_live_abc' },
      { STRIPE_SECRET_KEY: 'rk_live_abc' },
      { STRIPE_PUBLISHABLE_KEY: 'pk_live_abc' },
    ]) {
      expect(() =>
        paymentsConfigFromEnv({ PAYMENTS_MODE: 'fake', ...env }, { local: true }),
      ).toThrow(/live keys/);
    }
    expect(paymentsConfigFromEnv({ ...RAZORPAY_TEST, ...STRIPE_TEST }, { local: true }).mode).toBe(
      'fake',
    );
  });

  it('rejects short secrets and unknown modes', () => {
    expect(() =>
      paymentsConfigFromEnv({ FAKE_WEBHOOK_SECRET: 'short' }, { local: true }),
    ).toThrow();
    for (const mode of ['free', 'razorpay', 'stripe', 'live']) {
      expect(() => paymentsConfigFromEnv({ PAYMENTS_MODE: mode }, { local: true })).toThrow(
        /Unknown PAYMENTS_MODE/,
      );
    }
  });
});

describe('paymentsConfigFromEnv: real mode', () => {
  const real = (env: Record<string, string>) => {
    const config = paymentsConfigFromEnv({ PAYMENTS_MODE: 'real', ...env }, { local: false });
    if (config.mode !== 'real') throw new Error('expected real mode');
    return config;
  };

  it('takes Razorpay and/or Stripe test keys', () => {
    expect(real({ ...RAZORPAY_TEST, ...STRIPE_TEST })).toEqual({
      mode: 'real',
      live: false,
      razorpay: {
        keyId: RAZORPAY_TEST.RAZORPAY_KEY_ID,
        keySecret: 'test-key-secret',
        webhookSecret: 'test-webhook-secret',
      },
      stripe: {
        secretKey: 'sk_test_51AbC',
        publishableKey: 'pk_test_51AbC',
        webhookSecret: 'whsec_abc123',
      },
      regionProviders: {},
    });
    expect(real(RAZORPAY_TEST)).toMatchObject({ razorpay: { keyId: 'rzp_test_AbCdEf123456' } });
    expect(real({ ...STRIPE_TEST, STRIPE_SECRET_KEY: 'rk_test_restricted' })).toMatchObject({
      razorpay: null,
      stripe: { secretKey: 'rk_test_restricted' },
    });
  });

  it('needs at least one provider, with all of its variables', () => {
    expect(() => real({})).toThrow(/Razorpay and\/or Stripe/);
    expect(() => real({ RAZORPAY_KEY_ID: 'rzp_test_abc' })).toThrow(
      /Missing RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET/,
    );
    expect(() => real({ ...STRIPE_TEST, STRIPE_WEBHOOK_SECRET: '' })).toThrow(
      /Missing STRIPE_WEBHOOK_SECRET/,
    );
  });

  it('never accepts live keys in test mode', () => {
    expect(() => real({ ...RAZORPAY_TEST, RAZORPAY_KEY_ID: 'rzp_live_abc' })).toThrow(
      /test-mode key id.*PAYMENTS_LIVE=true/,
    );
    expect(() => real({ ...STRIPE_TEST, STRIPE_SECRET_KEY: 'sk_live_abc' })).toThrow(/test-mode/);
    expect(() => real({ ...STRIPE_TEST, STRIPE_PUBLISHABLE_KEY: 'pk_live_abc' })).toThrow(
      /test-mode/,
    );
  });

  it('with PAYMENTS_LIVE=true accepts only live keys, and no region overrides', () => {
    expect(() => real({ ...RAZORPAY_TEST, PAYMENTS_LIVE: 'true' })).toThrow(/live-mode/);
    expect(
      real({ ...RAZORPAY_TEST, RAZORPAY_KEY_ID: 'rzp_live_abc', PAYMENTS_LIVE: 'true' }),
    ).toMatchObject({ live: true });
    expect(() =>
      real({
        ...RAZORPAY_TEST,
        RAZORPAY_KEY_ID: 'rzp_live_abc',
        PAYMENTS_LIVE: 'true',
        PAYMENTS_REGION_PROVIDERS: 'IN=stripe',
      }),
    ).toThrow(/test mode only/);
    expect(() => real({ ...RAZORPAY_TEST, PAYMENTS_LIVE: 'yes' })).toThrow(/true or false/);
  });

  it('checks the Stripe webhook secret format and parses region overrides', () => {
    expect(() => real({ ...STRIPE_TEST, STRIPE_WEBHOOK_SECRET: 'abc' })).toThrow(/whsec|signing/);
    expect(
      real({ ...STRIPE_TEST, PAYMENTS_REGION_PROVIDERS: ' IN=stripe, GB = stripe ' })
        .regionProviders,
    ).toEqual({ IN: 'stripe', GB: 'stripe' });
    expect(() => real({ ...STRIPE_TEST, PAYMENTS_REGION_PROVIDERS: 'IN=paypal' })).toThrow(
      /PAYMENTS_REGION_PROVIDERS/,
    );
  });
});

describe('createPayments', () => {
  it('builds only the configured gateways', () => {
    const fake = createPayments(paymentsConfigFromEnv({}, { local: true }));
    expect(Object.keys(fake.gateways)).toEqual(['fake']);
    const both = createPayments(
      paymentsConfigFromEnv(
        { PAYMENTS_MODE: 'real', ...RAZORPAY_TEST, ...STRIPE_TEST },
        { local: false },
      ),
    );
    expect(Object.keys(both.gateways).sort()).toEqual(['razorpay', 'stripe']);
  });
});
