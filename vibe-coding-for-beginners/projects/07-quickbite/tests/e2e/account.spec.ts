import AxeBuilder from '@axe-core/playwright';
import { BACKEND, completeSignIn, expect, supabaseEmail, test, uniqueEmail } from './fixtures';

test('sign in with an email link, edit the profile and sign out', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create an account' })).toBeVisible();

  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByText('Enter a valid email address')).toBeVisible();

  const email = uniqueEmail('account');
  await completeSignIn(page, email);
  await expect(page.getByRole('link', { name: 'Account' })).toBeVisible();

  await page.getByRole('link', { name: 'Account' }).click();
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await page.getByLabel('Name').fill('Asha Rao');
  await page.getByLabel('Mobile number (optional)').fill('98765 43210');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  // The profile is stored by the backend, not just in the page.
  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue('Asha Rao');
  await expect(page.getByLabel('Mobile number (optional)')).toHaveValue('9876543210');

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Sign in' })).toBeVisible();
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Sign in to see your account' })).toBeVisible();
});

test('sign in by typing the 6-digit code from the email', async ({ page }) => {
  test.skip(BACKEND !== 'supabase', 'Only Supabase emails carry a one-time code');
  await page.goto('/login');
  const email = uniqueEmail('code');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();

  const code = page.getByLabel('Or enter the 6-digit code from the email');
  await code.fill('000000');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('That code didn’t work.')).toBeVisible();

  await code.fill((await supabaseEmail(email)).code);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Account' })).toBeVisible();
});
