#!/usr/bin/env node
// Takes phone and desktop screenshots of the main screens into ./screenshots.
//
//   pnpm build && pnpm preview   (in another terminal), then:
//   pnpm screenshots [baseUrl]   default http://localhost:4173

import { mkdirSync } from 'node:fs';
import { chromium, devices } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = 'screenshots';
mkdirSync(out, { recursive: true });

const AREA = 'blr-koramangala';
const RESTAURANT = 'tandoor-tales-koramangala';

const viewports = {
  phone: { ...devices['iPhone 13'], defaultBrowserType: undefined },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

const browser = await chromium.launch();
for (const [name, options] of Object.entries(viewports)) {
  const context = await browser.newContext(options);
  await context.addInitScript((areaId) => {
    if (!localStorage.getItem('quickbite.location')) {
      localStorage.setItem('quickbite.location', JSON.stringify({ state: { areaId }, version: 1 }));
    }
  }, AREA);
  const page = await context.newPage();

  // A first-time visitor (no saved area) sees the landing page.
  const fresh = await browser.newContext(options);
  const landing = await fresh.newPage();
  await landing.goto(`${base}/`);
  await landing.getByRole('heading', { level: 1 }).waitFor();
  await landing.waitForLoadState('networkidle');
  await landing.waitForTimeout(400);
  await landing.screenshot({ path: `${out}/${name}-landing.png` });
  console.log(`${out}/${name}-landing.png`);
  await fresh.close();

  const shoot = async (file, { fullPage = false } = {}) => {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-${file}.png`, fullPage });
    console.log(`${out}/${name}-${file}.png`);
  };

  await page.goto(`${base}/`);
  await page.getByRole('heading', { name: /Restaurants with online food delivery/ }).waitFor();
  await shoot('home');
  await shoot('home-full', { fullPage: true });

  await page.goto(`${base}/restaurant/${RESTAURANT}`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await shoot('restaurant');

  // Add a few dishes: the ADD buttons turn into steppers and the cart appears.
  await page.getByRole('button', { name: 'Add Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add one more Butter Chicken' }).first().click();
  await page.getByRole('button', { name: 'Add Garlic Naan' }).first().click();
  await page.getByRole('button', { name: 'Add Dal Makhani' }).first().click();
  await page.getByRole('article', { name: 'Butter Chicken' }).first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -140));
  await shoot('restaurant-with-cart');

  await page.goto(`${base}/checkout`);
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
  await page.getByTestId('to-pay').waitFor();
  await page.getByRole('button', { name: /Apply coupon/ }).click();
  await shoot('coupons');
  await page.getByRole('button', { name: 'Apply WELCOME50' }).click();
  await page.getByText(/‘WELCOME50’ applied/).waitFor();
  await shoot('cart');
  await shoot('cart-full', { fullPage: true });

  await page.goto(`${base}/search?q=biryani`);
  await page.getByRole('tab', { name: /dishes/i }).waitFor();
  await shoot('search');

  const extra = process.env.SCREENSHOT_EXTRA;
  if (extra) {
    const module = await import(new URL(extra, `file://${process.cwd()}/`).href);
    await module.default({ page, shoot, base, name });
  }
  await context.close();
}
await browser.close();
