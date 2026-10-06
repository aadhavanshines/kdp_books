import { test as base, expect, type Page } from '@playwright/test';

export const BACKEND = process.env.E2E_BACKEND ?? 'memory';
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
const MAILPIT = process.env.SUPABASE_MAILPIT_URL ?? 'http://127.0.0.1:54324';

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
  // Under the Hosting emulator (pnpm test:hosting) the page runs with the real
  // Content-Security-Policy, so any blocked request fails the test that caused it.
  cspViolations: [
    async ({ page }, use) => {
      const seen: string[] = [];
      page.on('console', (m) => {
        if (/Content[- ]Security[- ]Policy/i.test(m.text())) seen.push(m.text());
      });
      await use(seen);
      expect(seen, 'Content-Security-Policy violations').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

export const uniqueEmail = (who: string) =>
  `${who}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@example.com`;

/**
 * The sign-in link that would have been emailed. On Firebase it is read from
 * the Auth emulator's REST API (the emulator keeps every link it "sends"),
 * exactly as a customer's email client would deliver it.
 */
async function emailedLink(email: string): Promise<string> {
  const res = await fetch(`http://${AUTH_EMULATOR}/emulator/v1/projects/demo-quickbite/oobCodes`);
  const { oobCodes } = (await res.json()) as {
    oobCodes: { email: string; oobLink: string; requestType: string }[];
  };
  const code = oobCodes.filter((c) => c.email === email && c.requestType === 'EMAIL_SIGNIN').at(-1);
  if (!code) throw new Error(`No sign-in email for ${email}`);
  // Firebase's hosted action page forwards to continueUrl with these parameters.
  const oob = new URL(code.oobLink);
  const target = new URL(oob.searchParams.get('continueUrl')!);
  for (const key of ['mode', 'oobCode', 'apiKey']) {
    target.searchParams.set(key, oob.searchParams.get(key)!);
  }
  return target.toString();
}

/**
 * The sign-in email the local Supabase stack "sent", read from Mailpit (where
 * every local email lands): the link and the one-time code in it.
 */
export async function supabaseEmail(email: string): Promise<{ link: string; code: string }> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const res = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=1`,
    );
    const { messages = [] } = (await res.json()) as { messages?: { ID: string }[] };
    if (messages[0]) {
      const message = (await (
        await fetch(`${MAILPIT}/api/v1/message/${messages[0].ID}`)
      ).json()) as {
        HTML: string;
      };
      const link = /href="([^"]*#otp=(\d+))"/.exec(message.HTML);
      if (link) return { link: link[1]!.replaceAll('&amp;', '&'), code: link[2]! };
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`No sign-in email for ${email}`);
}

/** Signs in through the email-link flow, starting from the sign-in page the app is showing. */
export async function completeSignIn(page: Page, email: string) {
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  if (BACKEND === 'firebase') await page.goto(await emailedLink(email));
  else if (BACKEND === 'supabase') await page.goto((await supabaseEmail(email)).link);
  else await page.getByRole('link', { name: 'Open sign-in link' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
