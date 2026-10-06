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


// Screenshots for the book: the same journey as above, captured at each step.
test('book screenshots', async ({ page, isMobile }, info) => {
  const dir = `book-shots/${info.project.name}`;
  const shot = async (name: string) => {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${dir}/${name}.png` });
  };
  await page.goto('/');
  await fillCartAndCheckout(page, isMobile);
  await page.getByRole('button', { name: /Apply coupon/ }).click();
  await page.getByRole('button', { name: 'Apply WELCOME50' }).click();
  await expect(page.getByText(/‘WELCOME50’ applied/)).toBeVisible();
  await shot('checkout');
  const toPay = (await page.getByTestId('to-pay').textContent())!.trim();
  const sheet = await proceedToPay(page, isMobile);
  await expect(sheet.getByTestId('fake-payment-amount')).toHaveText(toPay);
  await shot('payment-sheet');
  await sheet.getByRole('button', { name: `Pay ${toPay}` }).click();
  const status = page.getByTestId('order-status');
  await expect(status).toHaveText('Order placed', { timeout: 20_000 });
  await shot('order-placed');
  await expect(status).toHaveText('Out for delivery', { timeout: 40_000 });
  await shot('out-for-delivery');
});
