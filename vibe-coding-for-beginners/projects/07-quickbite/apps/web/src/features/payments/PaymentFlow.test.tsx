/**
 * The Razorpay and Stripe checkouts, with stand-ins for the providers'
 * browser scripts (window.Razorpay / window.Stripe), so nothing is loaded
 * from the network.
 */
import type { PaymentStart, RazorpayCheckoutResponse } from '@quickbite/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setBackendForTests, type Backend } from '../../backend';
import { createMemoryBackend } from '../../backend/memory';
import { TEST_USER } from '../../test/render';
import { PaymentFlow, type PaymentResult } from './PaymentFlow';
import type { RazorpayFailure, RazorpayOptions } from './razorpay';
import { RAZORPAY_CHECKOUT_URL } from './razorpay';
import type { StripeConfirmResult } from './stripe';

type Win = Record<string, unknown>;

afterEach(() => {
  delete (window as unknown as Win).Razorpay;
  delete (window as unknown as Win).Stripe;
  setBackendForTests(null);
});

/** A backend whose Razorpay confirmation is recorded (everything else is the memory backend). */
function backendWith(confirm: Backend['orders']['confirmRazorpay']) {
  const base = createMemoryBackend({ latencyMs: 0, user: TEST_USER });
  const backend: Backend = { ...base, orders: { ...base.orders, confirmRazorpay: confirm } };
  setBackendForTests(backend);
  return backend;
}

/** window.Razorpay: records the options and lets the test act as the customer. */
function fakeRazorpay() {
  const instances: {
    options: RazorpayOptions;
    failed?: (f: RazorpayFailure) => void;
    opened: boolean;
  }[] = [];
  (window as unknown as Win).Razorpay = class {
    private readonly entry: (typeof instances)[number];
    constructor(options: RazorpayOptions) {
      this.entry = { options, opened: false };
      instances.push(this.entry);
    }
    on(_event: 'payment.failed', listener: (f: RazorpayFailure) => void) {
      this.entry.failed = listener;
    }
    open() {
      this.entry.opened = true;
    }
  };
  return instances;
}

const RAZORPAY_START: Extract<PaymentStart, { provider: 'razorpay' }> = {
  provider: 'razorpay',
  providerOrderId: 'order_Abc123',
  amount: 48_510,
  currency: 'INR',
  keyId: 'rzp_test_key',
};

const RESPONSE: RazorpayCheckoutResponse = {
  razorpay_order_id: 'order_Abc123',
  razorpay_payment_id: 'pay_Xyz789',
  razorpay_signature: 'a'.repeat(64),
};

function renderFlow(start: PaymentStart, onFinished: (r: PaymentResult) => void) {
  return render(
    <PaymentFlow
      orderId="ord_1"
      start={start}
      prefill={{ name: 'Asha Rao', phone: '9876543210', email: 'asha@example.com' }}
      onFinished={onFinished}
    />,
  );
}

describe('Razorpay Checkout', () => {
  it('opens for the server’s Razorpay order and sends the signed response to the server', async () => {
    const instances = fakeRazorpay();
    const confirm = vi.fn(async () => ({ outcome: 'placed' }));
    backendWith(confirm);
    const onFinished = vi.fn();
    renderFlow(RAZORPAY_START, onFinished);

    await waitFor(() => expect(instances[0]?.opened).toBe(true));
    expect(instances).toHaveLength(1);
    expect(instances[0]!.options).toMatchObject({
      key: 'rzp_test_key',
      order_id: 'order_Abc123',
      amount: 48_510,
      currency: 'INR',
      name: 'QuickBite',
      prefill: { name: 'Asha Rao', email: 'asha@example.com', contact: '9876543210' },
    });

    act(() => instances[0]!.options.handler(RESPONSE));
    await waitFor(() => expect(onFinished).toHaveBeenCalledWith({ status: 'paid' }));
    expect(confirm).toHaveBeenCalledWith('ord_1', RESPONSE);
  });

  it('still hands over to the order page when the confirmation request fails', async () => {
    const instances = fakeRazorpay();
    backendWith(async () => {
      throw new Error('network down');
    });
    const onFinished = vi.fn();
    renderFlow(RAZORPAY_START, onFinished);
    await waitFor(() => expect(instances[0]?.opened).toBe(true));
    act(() => instances[0]!.options.handler(RESPONSE));
    await waitFor(() => expect(onFinished).toHaveBeenCalledWith({ status: 'paid' }));
  });

  it('reports the last failure when the customer gives up', async () => {
    const instances = fakeRazorpay();
    const confirm = vi.fn();
    backendWith(confirm);
    const onFinished = vi.fn();
    renderFlow(RAZORPAY_START, onFinished);
    await waitFor(() => expect(instances[0]?.opened).toBe(true));
    act(() => {
      instances[0]!.failed!({ error: { description: 'Your bank declined this payment' } });
      instances[0]!.options.modal!.ondismiss!();
    });
    await waitFor(() =>
      expect(onFinished).toHaveBeenCalledWith({
        status: 'cancelled',
        message: 'Your bank declined this payment',
      }),
    );
    expect(confirm).not.toHaveBeenCalled();
  });

  it('loads checkout.js from Razorpay and reports when it can’t', async () => {
    backendWith(vi.fn());
    const onFinished = vi.fn();
    renderFlow(RAZORPAY_START, onFinished);
    expect(screen.getByRole('status')).toHaveTextContent('Opening secure Razorpay checkout');
    const script = await waitFor(() => {
      const s = document.head.querySelector<HTMLScriptElement>(
        `script[src="${RAZORPAY_CHECKOUT_URL}"]`,
      );
      expect(s).not.toBeNull();
      return s!;
    });
    act(() => void script.dispatchEvent(new Event('error')));
    await waitFor(() =>
      expect(onFinished).toHaveBeenCalledWith({
        status: 'failed',
        message: expect.stringMatching(/could not be loaded/),
      }),
    );
  });
});

describe('Stripe Payment Element', () => {
  let keyCounter = 0;

  /** window.Stripe: a Payment Element that is ready at once, and scripted confirm results. */
  function fakeStripe(results: StripeConfirmResult[]) {
    const calls = {
      publishableKey: '',
      clientSecret: '',
      mountedIn: null as HTMLElement | null,
      confirms: [] as unknown[],
    };
    (window as unknown as Win).Stripe = (publishableKey: string) => {
      calls.publishableKey = publishableKey;
      return {
        elements: ({ clientSecret }: { clientSecret: string }) => {
          calls.clientSecret = clientSecret;
          return {
            create: () => ({
              mount: (node: HTMLElement) => void (calls.mountedIn = node),
              destroy: () => undefined,
              on: (_event: string, listener: () => void) => queueMicrotask(listener),
            }),
          };
        },
        confirmPayment: async (options: unknown) => {
          calls.confirms.push(options);
          return results.shift()!;
        },
      };
    };
    return calls;
  }

  const stripeStart = (): Extract<PaymentStart, { provider: 'stripe' }> => ({
    provider: 'stripe',
    providerOrderId: 'pi_123',
    amount: 1_250,
    currency: 'GBP',
    publishableKey: `pk_test_${++keyCounter}`,
    clientSecret: 'pi_123_secret_abc',
  });

  it('shows a decline, then lets the customer pay again on the same intent', async () => {
    const calls = fakeStripe([
      { error: { type: 'card_error', code: 'card_declined', message: 'Your card was declined.' } },
      { paymentIntent: { id: 'pi_123', status: 'succeeded' } },
    ]);
    const onFinished = vi.fn();
    const start = stripeStart();
    renderFlow(start, onFinished);

    const dialog = await screen.findByRole('dialog', { name: 'Pay with card' });
    expect(dialog).toHaveTextContent('£12.50');
    const pay = await screen.findByRole('button', { name: 'Pay £12.50' });
    await waitFor(() => expect(pay).toBeEnabled());
    expect(calls.publishableKey).toBe(start.publishableKey);
    expect(calls.clientSecret).toBe('pi_123_secret_abc');
    // Identity, not deep equality: DOM nodes are circular.
    expect(calls.mountedIn).toBe(screen.getByTestId('stripe-payment-element'));

    await userEvent.click(pay);
    expect(await screen.findByRole('alert')).toHaveTextContent('Your card was declined.');
    expect(onFinished).not.toHaveBeenCalled();

    await userEvent.click(pay);
    await waitFor(() => expect(onFinished).toHaveBeenCalledWith({ status: 'paid' }));
    expect(calls.confirms[1]).toMatchObject({
      confirmParams: { return_url: `${window.location.origin}/orders/ord_1` },
      redirect: 'if_required',
    });
  });

  it('treats closing the sheet as cancelling', async () => {
    fakeStripe([]);
    const onFinished = vi.fn();
    renderFlow(stripeStart(), onFinished);
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
    expect(onFinished).toHaveBeenCalledWith({ status: 'cancelled' });
  });
});
