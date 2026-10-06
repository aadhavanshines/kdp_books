import AxeBuilder from '@axe-core/playwright';
import { completeSignIn, expect, test, uniqueEmail } from './fixtures';

test('add dishes, check out with an address and a coupon', async ({ page, isMobile }) => {
  await page.goto('/restaurant/tandoor-tales-koramangala');
  await page.getByRole('button', { name: 'Add Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add one more Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add Garlic Naan' }).first().click();

  // The cart follows you: header badge everywhere, sticky bar on phones.
  await expect(page.getByRole('link', { name: 'Cart, 3 items' })).toBeVisible();
  if (isMobile) await page.getByRole('link', { name: /3 items \| ₹/ }).click();
  else await page.getByRole('complementary').getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  // The cart survives a reload.
  await page.reload();
  await expect(page.getByText('Garlic Naan')).toBeVisible();

  // Ordering needs an account: sign in and come straight back to checkout.
  await page.getByRole('link', { name: 'Sign in to continue' }).click();
  await completeSignIn(page, uniqueEmail('cart'));
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Garlic Naan')).toBeVisible();

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

  const toPay = page.getByTestId('to-pay');
  await expect(toPay).toHaveText(/₹[\d,]+/);
  const before = await toPay.textContent();

  await page.getByRole('button', { name: /Apply coupon/ }).click();
  await page.getByRole('button', { name: 'Apply WELCOME50' }).click();
  await expect(page.getByText(/‘WELCOME50’ applied/)).toBeVisible();
  await expect(toPay).not.toHaveText(before!);

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
