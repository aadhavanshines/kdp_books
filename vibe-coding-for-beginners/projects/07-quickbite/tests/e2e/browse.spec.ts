import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

async function expectNoSeriousA11yIssues(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

test('filters restaurants and keeps the filter in the URL', async ({ page }) => {
  await page.goto('/');
  const list = page.getByRole('region', { name: /online food delivery in Koramangala/ });
  await expect(list.getByRole('link').first()).toBeVisible();

  await list.getByRole('button', { name: 'Pure Veg' }).click();
  await expect(page).toHaveURL(/veg=1/);
  const cards = list.getByRole('link');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await expect(cards.nth(i)).toContainText(/Pure veg/i);

  await page.reload();
  await expect(list.getByRole('button', { name: 'Pure Veg' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('opens a restaurant and filters its menu to veg', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('region', { name: /online food delivery/ })
    .getByRole('link', { name: /Tandoor Tales/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tandoor Tales' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Butter Chicken' })).toBeVisible();

  await page
    .getByRole('toolbar', { name: 'Menu filters' })
    .getByRole('button', { name: 'Veg', exact: true })
    .click();
  await expect(page.getByRole('article', { name: 'Butter Chicken' })).toHaveCount(0);
  await expect(page.getByRole('article', { name: 'Dal Makhani' })).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});

test('searches dishes across restaurants', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('searchbox').fill('paneer');
  await expect(page.getByRole('tab', { name: /Dishes \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Paneer/ }).first()).toBeVisible();
  await expect(page).toHaveURL(/q=paneer/);
  await expectNoSeriousA11yIssues(page);
});

test('changes the delivery area from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Delivering to Koramangala/ }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Bandra West/ })
    .click();
  await expect(page.getByRole('heading', { name: /delivery in Bandra West/ })).toBeVisible();
});
