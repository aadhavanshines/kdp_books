import { test as base } from '@playwright/test';

/** A page whose delivery area is already chosen (Koramangala, Bengaluru). */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('quickbite.location')) {
        localStorage.setItem(
          'quickbite.location',
          JSON.stringify({ state: { areaId: 'blr-koramangala' }, version: 1 }),
        );
      }
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
