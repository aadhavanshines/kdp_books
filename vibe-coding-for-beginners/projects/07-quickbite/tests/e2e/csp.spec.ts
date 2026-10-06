/**
 * The Content-Security-Policy from firebase.json, exercised in a real browser.
 * Only runs under `pnpm test:hosting`, which serves the build from the Firebase
 * Hosting emulator with the real headers (see scripts/hosting-check.mjs).
 *
 * Razorpay and Stripe can't be reached from a test machine, so their scripts and
 * frames are answered with small stand-ins at the providers' REAL addresses.
 * The browser checks the CSP before it makes a request, so a stand-in loading
 * proves the policy allows that exact address; the app's own payment code does
 * the rest, and any blocked request would be reported as a violation.
 */
import type { Page } from '@playwright/test';
import { completeSignIn, expect, test as appTest, uniqueEmail } from './fixtures';
import { test as plain } from '@playwright/test';

const HOSTING = !!process.env.E2E_HOSTING;
const RAZORPAY_JS = 'https://checkout.razorpay.com/v1/checkout.js';
const STRIPE_JS = 'https://js.stripe.com/v3/';

const IFRAME_HTML = '<!doctype html><title>stand-in</title><p>provider frame</p>';

/** Answers a provider address with a stand-in; requests to it never leave the machine. */
async function stub(page: Page, url: string | RegExp, body: string, contentType: string) {
  await page.route(url, (route) => route.fulfill({ status: 200, contentType, body }));
}

plain.describe('CSP (negative controls)', () => {
  plain.skip(!HOSTING, 'needs the Hosting emulator (pnpm test:hosting)');

  plain('inline scripts and unlisted hosts are blocked', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/Content[- ]Security[- ]Policy/i.test(m.text())) violations.push(m.text());
    });
    await page.goto('/about');
    await page.evaluate(() => {
      const inline = document.createElement('script');
      inline.textContent = 'window.__inlineRan = true';
      document.head.append(inline);
      const external = document.createElement('script');
      external.src = 'https://evil.example/x.js';
      document.head.append(external);
      const frame = document.createElement('iframe');
      frame.src = 'https://evil.example/frame';
      document.body.append(frame);
      void fetch('https://evil.example/steal').catch(() => undefined);
    });
    await expect.poll(() => violations.length).toBeGreaterThanOrEqual(4);
    expect(
      await page.evaluate(() => (window as { __inlineRan?: boolean }).__inlineRan),
    ).toBeUndefined();
    const text = violations.join('\n');
    expect(text).toMatch(/script-src/);
    expect(text).toMatch(/frame-src/);
    expect(text).toMatch(/connect-src/);
  });

  plain('eval is refused and the site cannot be framed', async ({ page, request }) => {
    // Playwright's own evaluate() is exempt from page CSP, so the probe is a real script from the site itself.
    await page.route('**/__csp-probe.js', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: "try { new Function('return 1')(); window.__eval = 'ran'; } catch (e) { window.__eval = e.name; }",
      }),
    );
    await page.goto('/about');
    await page.evaluate(() => {
      const probe = document.createElement('script');
      probe.src = '/__csp-probe.js';
      document.head.append(probe);
    });
    await expect
      .poll(() => page.evaluate(() => (window as { __eval?: string }).__eval))
      .toBe('EvalError');
    const res = await request.get('/about');
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  });
});

appTest.describe('Payments and the app under the CSP', () => {
  appTest.skip(!HOSTING, 'needs the Hosting emulator (pnpm test:hosting)');
  appTest.describe.configure({ timeout: 90_000 });

  /** Signs in, fills a cart, adds an address and opens "Proceed to pay" with the server's answer rewritten. */
  async function payWith(page: Page, isMobile: boolean, rewrite: (amount: number) => object) {
    await page.route('**/api/createOrder', async (route) => {
      const response = await route.fetch();
      const json = (await response.json()) as {
        result: { ok: boolean; payment: { amount: number } };
      };
      if (json.result.ok) json.result.payment = rewrite(json.result.payment.amount) as never;
      await route.fulfill({ response, json });
    });
    await page.goto('/restaurant/tandoor-tales-koramangala');
    await page.getByRole('button', { name: 'Add Butter Chicken' }).first().click();
    if (isMobile) await page.getByRole('link', { name: /1 item \| ₹/ }).click();
    else await page.getByRole('complementary').getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('link', { name: 'Sign in to continue' }).click();
    await completeSignIn(page, uniqueEmail('csp'));
    await page
      .getByRole('button', { name: /Add (delivery )?address/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: 'Add delivery address' });
    await dialog.getByLabel('Flat / house no., building').fill('Flat 4B, Palm Residency');
    await dialog.getByLabel('Street, sector, locality').fill('5th Block, 80 Feet Road');
    await dialog.getByLabel('PIN code').fill('560095');
    await dialog.getByLabel('Receiver’s name').fill('Asha Rao');
    await dialog.getByLabel('Mobile number').fill('9876543210');
    await dialog.getByRole('button', { name: /Save address/ }).click();
    await expect(page.getByTestId('to-pay')).toHaveText(/₹[\d,]+/);
    const pay = isMobile
      ? page.getByRole('button', { name: 'Proceed to pay', exact: true })
      : page.getByRole('button', { name: /Proceed to pay ₹/ });
    await expect(pay).toBeEnabled();
    await pay.click();
  }

  appTest(
    "fake payments, the app's own bundle, fonts and images load under the CSP",
    async ({ page, isMobile }) => {
      const res = await page.goto('/');
      expect(res?.headers()['content-security-policy']).toContain(
        "script-src 'self' https://checkout.razorpay.com",
      );
      await expect(page.getByRole('heading', { name: /delivery in Koramangala/ })).toBeVisible();
      await page.goto('/restaurant/tandoor-tales-koramangala');
      await expect(page.getByRole('img').first()).toBeVisible();
      expect(
        await page.evaluate(() => document.fonts.check('16px "Plus Jakarta Sans Variable"')),
      ).toBe(true);
      await payWith(page, isMobile, (amount) => ({
        provider: 'fake',
        providerOrderId: 'fake_order',
        amount,
        currency: 'INR',
      }));
      await expect(page.getByRole('dialog', { name: 'Test payment' })).toBeVisible();
    },
  );

  appTest(
    'Razorpay Checkout: script, frame and calls are all allowed',
    async ({ page, isMobile }) => {
      let frameLoaded = false;
      await stub(
        page,
        RAZORPAY_JS,
        `window.Razorpay = class {
         constructor(o) { this.o = o; this.l = {}; }
         on(e, f) { this.l[e] = f; }
         open() {
           const f = document.createElement('iframe');
           f.src = 'https://api.razorpay.com/v1/checkout/stand-in';
           f.onload = () => {
             fetch('https://lumberjack.razorpay.com/v1/track', { method: 'POST', mode: 'no-cors', body: '{}' })
               .then(() => this.o.handler({ razorpay_payment_id: 'pay_x', razorpay_order_id: this.o.order_id, razorpay_signature: 'sig' }));
           };
           document.body.append(f);
         }
       }`,
        'text/javascript',
      );
      await stub(
        page,
        /https:\/\/api\.razorpay\.com\/v1\/checkout\/stand-in/,
        IFRAME_HTML,
        'text/html',
      );
      await stub(page, 'https://lumberjack.razorpay.com/v1/track', '{}', 'application/json');
      page.on('framenavigated', (f) => {
        if (f.url().startsWith('https://api.razorpay.com/')) frameLoaded = true;
      });
      await payWith(page, isMobile, (amount) => ({
        provider: 'razorpay',
        keyId: 'rzp_test_standin',
        providerOrderId: 'order_standin',
        amount,
        currency: 'INR',
      }));
      // The stand-in "paid": the app sends it to verifyRazorpayPayment and follows the order.
      await expect(page).toHaveURL(/\/orders\/[\w-]+$/, { timeout: 20_000 });
      expect(frameLoaded).toBe(true);
    },
  );

  appTest(
    'Stripe Payment Element: script, frames and calls are all allowed',
    async ({ page, isMobile }) => {
      let frameLoaded = false;
      await stub(
        page,
        STRIPE_JS,
        `window.Stripe = () => ({
         elements: () => ({
           create: () => ({
             mount(node) {
               const f = document.createElement('iframe');
               f.src = 'https://js.stripe.com/v3/elements-inner-stand-in.html';
               f.onload = () => this._ready && this._ready();
               node.append(f);
             },
             on(e, fn) { this._ready = fn; },
             destroy() {},
           }),
         }),
         confirmPayment: async () => {
           await fetch('https://api.stripe.com/v1/stand-in', { mode: 'no-cors' });
           await fetch('https://r.stripe.com/b', { method: 'POST', mode: 'no-cors', body: 'x' });
           const h = document.createElement('iframe');
           h.src = 'https://hooks.stripe.com/stand-in';
           document.body.append(h);
           return { paymentIntent: { id: 'pi_x', status: 'succeeded' } };
         },
       })`,
        'text/javascript',
      );
      await stub(
        page,
        /https:\/\/js\.stripe\.com\/v3\/elements-inner-stand-in\.html/,
        IFRAME_HTML,
        'text/html',
      );
      await stub(page, /https:\/\/hooks\.stripe\.com\/stand-in/, IFRAME_HTML, 'text/html');
      await stub(page, /https:\/\/(api|r)\.stripe\.com\/.*/, '{}', 'application/json');
      page.on('framenavigated', (f) => {
        if (f.url().startsWith('https://js.stripe.com/')) frameLoaded = true;
      });
      await payWith(page, isMobile, (amount) => ({
        provider: 'stripe',
        publishableKey: 'pk_test_standin',
        clientSecret: 'pi_x_secret_y',
        providerOrderId: 'pi_x',
        amount,
        currency: 'INR',
      }));
      await expect(page.getByTestId('stripe-payment-element')).toBeVisible();
      await page.getByRole('button', { name: /^Pay ₹/ }).click();
      await expect(page).toHaveURL(/\/orders\/[\w-]+$/, { timeout: 20_000 });
      expect(frameLoaded).toBe(true);
    },
  );
});
