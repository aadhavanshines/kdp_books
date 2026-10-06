import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('a first-time visitor picks an area and sees nearby restaurants', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Hungry\?/ })).toBeVisible();
  await page
    .getByRole('button', { name: /Koramangala/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: /delivery in Koramangala/ })).toBeVisible();
});

test('landing and home pages have no serious accessibility violations', async ({ page }) => {
  for (const step of ['landing', 'home'] as const) {
    if (step === 'home')
      await page
        .getByRole('button', { name: /Koramangala/ })
        .first()
        .click();
    else await page.goto('/');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious.map((v) => `${step} ${v.id}: ${v.help}`)).toEqual([]);
  }
});
