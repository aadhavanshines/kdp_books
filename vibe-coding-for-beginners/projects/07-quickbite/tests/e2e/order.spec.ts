/**
 * The whole journey: sign in, fill a cart, check out with a coupon, pay in
 * fake mode and watch the order go live from "placed" to "delivered".
 *
 * Runs on both backends. The demo simulator advances orders every few
 * seconds in tests (DEMO_STEP_SECONDS / VITE_DEMO_STEP_SECONDS = 4).
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { completeSignIn, expect, test, uniqueEmail } from './fixtures';

test.describe.configure({ timeout: 90_000 });

async function fillCartAndCheckout(page: Page, isMobile: boolean) {
  await page.goto('/restaurant/tandoor-tales-koramangala');
  await page.getByRole('button', { name: 'Add Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add one more Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add Garlic Naan' }).first().click();
  if (isMobile) await page.getByRole('link', { name: /3 items \| ₹/ }).click();
  else await page.getByRole('complementary').getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.getByRole('link', { name: 'Sign in to continue' }).click();
  await completeSignIn(page, uniqueEmail('order'));
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

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
}

async function proceedToPay(page: Page, isMobile: boolean) {
  const button = isMobile
    ? page.getByRole('button', { name: 'Proceed to pay', exact: true })
    : page.getByRole('button', { name: /Proceed to pay ₹/ });
  await expect(button).toBeEnabled();
  await button.click();
  return page.getByRole('dialog', { name: 'Test payment' });
}

test('order with a coupon, pay in test mode and track it to delivery', async ({
  page,
  isMobile,
}) => {
  await expect(page.goto('/')).resolves.toBeTruthy();
  await expect(page.getByText('Demo mode — no real money is charged')).toBeVisible();
  await fillCartAndCheckout(page, isMobile);

  await page.getByRole('button', { name: /Apply coupon/ }).click();
  await page.getByRole('button', { name: 'Apply WELCOME50' }).click();
  await expect(page.getByText(/‘WELCOME50’ applied/)).toBeVisible();
  const toPay = (await page.getByTestId('to-pay').textContent())!.trim();

  // The amount on the payment sheet comes from the server-created order.
  const sheet = await proceedToPay(page, isMobile);
  await expect(sheet.getByTestId('fake-payment-amount')).toHaveText(toPay);
  await sheet.getByRole('button', { name: `Pay ${toPay}` }).click();

  // The order page follows the order live as the webhook and simulator move it.
  // (Generous timeouts: the first call to a function on the emulator is a cold start.)
  await expect(page).toHaveURL(/\/orders\/[\w-]+$/, { timeout: 20_000 });
  const status = page.getByTestId('order-status');
  await expect(status).toHaveText('Order placed', { timeout: 20_000 });
  await expect(page.getByText(`Paid ${toPay} (test payment)`)).toBeVisible();
  await expect(page.getByText('Butter Chicken × 2')).toBeVisible();
  await expect(page.getByText(/Coupon discount \(WELCOME50\)/)).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    serious.map((v) => `${v.id}: ${v.help} ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
  ).toEqual([]);

  await expect(status).toHaveText('Order accepted', { timeout: 20_000 });
  await expect(status).toHaveText('Delivered', { timeout: 40_000 });
  const timeline = page.getByRole('list', { name: 'Order progress' });
  for (const step of [
    'Order placed',
    'Order accepted',
    'Preparing your food',
    'Out for delivery',
    'Delivered',
  ]) {
    await expect(timeline).toContainText(`${step} (done)`);
  }

  // The cart was emptied and the order shows in the history.
  await expect(page.getByRole('link', { name: 'Cart', exact: true })).toBeVisible();
  await page.goto('/orders');
  await expect(page.getByRole('link', { name: /Tandoor Tales.*Delivered/ })).toBeVisible();
});

test('a failed payment can be retried from the order page', async ({ page, isMobile }) => {
  await fillCartAndCheckout(page, isMobile);
  const sheet = await proceedToPay(page, isMobile);
  await sheet.getByRole('button', { name: 'Simulate a failed payment' }).click();

  const status = page.getByTestId('order-status');
  await expect(status).toHaveText('Payment failed', { timeout: 20_000 });
  await page.getByRole('button', { name: 'Try paying again' }).click();
  await page
    .getByRole('dialog', { name: 'Test payment' })
    .getByRole('button', { name: /^Pay ₹/ })
    .click();
  await expect(status).toHaveText('Order placed', { timeout: 20_000 });
});
