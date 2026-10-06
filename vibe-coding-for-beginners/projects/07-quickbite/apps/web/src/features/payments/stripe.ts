/**
 * Stripe.js (https://js.stripe.com/v3/) and the Payment Element, for a
 * PaymentIntent the server created. Only the publishable key (public by
 * design) and the intent's client secret (sent only to the order's owner)
 * reach the browser.
 */
import { providerGlobal } from './loadScript';

export const STRIPE_JS_URL = 'https://js.stripe.com/v3/';

export interface StripePaymentElement {
  mount(node: HTMLElement): void;
  destroy(): void;
  on(event: 'ready', listener: () => void): void;
}

export interface StripeElements {
  create(type: 'payment', options?: { layout?: 'tabs' | 'accordion' }): StripePaymentElement;
}

export interface StripeConfirmResult {
  error?: { type?: string; code?: string; message?: string };
  paymentIntent?: { id: string; status: string };
}

export interface StripeJs {
  elements(options: { clientSecret: string; appearance?: object }): StripeElements;
  confirmPayment(options: {
    elements: StripeElements;
    confirmParams: { return_url: string };
    redirect: 'if_required';
  }): Promise<StripeConfirmResult>;
}

export type StripeFactory = (publishableKey: string) => StripeJs;

const instances = new Map<string, StripeJs>();

export async function loadStripe(publishableKey: string): Promise<StripeJs> {
  let stripe = instances.get(publishableKey);
  if (!stripe) {
    const factory = await providerGlobal<StripeFactory>('Stripe', STRIPE_JS_URL);
    stripe = factory(publishableKey);
    instances.set(publishableKey, stripe);
  }
  return stripe;
}

/** Payment Element styling in QuickBite's colours. */
export const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#F2542D',
    borderRadius: '12px',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  },
};
