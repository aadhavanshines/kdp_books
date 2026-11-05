import { expect, test, type Page } from "@playwright/test";

/*
 * Walks every screen and saves screenshots to screenshots/<project>/NN-name.png.
 * Needs the seed data (npm run db:seed). Creates fresh fictional users each run.
 */
test.describe.configure({ mode: "serial" });

const PASSWORD = "demo-password-2026";
const run = Date.now().toString(36);

async function shot(page: Page, name: string, opts: { fullPage?: boolean } = {}) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../screenshots/${test.info().project.name}/${name}.png`, import.meta.url).pathname, fullPage: opts.fullPage ?? true, animations: "disabled" });
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/app**");
}

/** Open the newest email to `to` in /dev/mail and return its link. */
async function latestLink(page: Page, to: string) {
  await page.goto("/dev/mail");
  await page.getByRole("link", { name: new RegExp(`To ${to.replace(/[.@+]/g, "\\$&")}`) }).first().click();
  return page.getByRole("link", { name: "Open the link" }).getAttribute("href");
}

const mobile = () => test.info().project.name === "mobile";

test("public and auth screens", async ({ page }) => {
  await page.goto("/");
  await shot(page, "01-home");

  await page.goto("/sign-in");
  await shot(page, "02-sign-in");

  await page.getByLabel("Email").fill("riya@billora.example");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("don't match")).toBeVisible();
  await shot(page, "03-sign-in-error");

  await page.getByRole("tab", { name: "Email link" }).click();
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(page.getByText("We sent a sign-in link")).toBeVisible();
  await shot(page, "04-sign-in-magic-link-sent");

  await page.goto("/sign-up");
  await shot(page, "05-sign-up");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await shot(page, "06-sign-up-errors");

  await page.goto("/forgot-password");
  await shot(page, "08-forgot-password");
  await page.getByLabel("Email").fill("riya@billora.example");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("a reset link is on its way")).toBeVisible();
  await shot(page, "09-forgot-password-sent");

  await page.goto("/reset-password?error=INVALID_TOKEN");
  await shot(page, "11-reset-password-expired");

  await page.goto("/invite/not-a-real-token");
  await shot(page, "21-invite-not-found");

  await page.goto("/this-page-does-not-exist");
  await shot(page, "25-not-found");
});

test("sign up, verify, onboarding", async ({ page }) => {
  const email = `asha.${run}.${test.info().project.name}@studio.example`;
  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill("Asha Iyer");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByLabel(/I agree/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/verify-email**");
  await shot(page, "07-verify-email");

  await page.goto("/dev/mail");
  await shot(page, "12-dev-mail");
  const link = await latestLink(page, email);
  await shot(page, "13-dev-mail-message");

  await page.goto(link!);
  await page.waitForURL("**/onboarding**");
  await shot(page, "14-onboarding");
  await page.getByLabel("Business name").fill("A");
  await page.getByLabel("GSTIN").fill("29ABCDE1234F1Z0");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByText("Use at least 2 characters.")).toBeVisible();
  await shot(page, "15-onboarding-errors");
  await page.getByLabel("Business name").fill("Asha Iyer Consulting");
  await page.getByLabel("State").selectOption({ label: "Tamil Nadu" });
  await page.getByLabel("GSTIN").fill("");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await page.waitForURL("**/app?welcome=1");
  await shot(page, "16-dashboard-new");
});

test("reset password with the emailed link", async ({ page }) => {
  const link = await latestLink(page, "riya@billora.example");
  await page.goto(link!);
  await page.waitForURL("**/reset-password?token=**");
  await shot(page, "10-reset-password");
});

test("app shell, dashboard and settings as the owner", async ({ page }) => {
  await signIn(page, "riya@billora.example");
  await shot(page, "17-dashboard");

  if (mobile()) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await shot(page, "18-mobile-drawer", { fullPage: false });
    await page.getByRole("dialog").getByRole("button", { name: /Switch workspace/ }).click();
    await shot(page, "19-workspace-switcher", { fullPage: false });
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  } else {
    await page.getByRole("button", { name: /Switch workspace/ }).click();
    await shot(page, "19-workspace-switcher", { fullPage: false });
    await page.keyboard.press("Escape");
  }

  await page.getByRole("button", { name: /Account menu/ }).click();
  await shot(page, "20-user-menu", { fullPage: false });
  await page.keyboard.press("Escape");

  await page.goto("/app/settings/workspace");
  await shot(page, "30-settings-workspace");
  await page.getByLabel("GSTIN").fill("27ABCPS1234K1Z5");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/registered in Maharashtra/)).toBeVisible();
  await shot(page, "31-settings-workspace-error");

  await page.goto("/app/settings/team");
  await shot(page, "32-settings-team");
  await page.getByRole("button", { name: "Invite people" }).click();
  await shot(page, "33-team-invite-dialog", { fullPage: false });
  const invitee = `meera.${run}.${test.info().project.name}@accounts.example`;
  await page.getByLabel("Email").fill(invitee);
  await page.getByLabel("Role").selectOption("admin");
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByText(`Invitation sent to ${invitee}`)).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await shot(page, "34-settings-team-invited");
  await page.getByRole("button", { name: "Actions for Arjun Mehta" }).click();
  await shot(page, "35-team-member-actions", { fullPage: false });
  await page.getByRole("menuitem", { name: "Remove from workspace" }).click();
  await shot(page, "36-team-remove-confirm", { fullPage: false });
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.goto("/app/settings/profile");
  await shot(page, "37-settings-profile");

  // Invite acceptance, signed out, in a fresh context.
  const inviteLink = await latestLink(page, invitee);
  const ctx = await page.context().browser()!.newContext({ viewport: page.viewportSize()!, ...(mobile() ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
  const guest = await ctx.newPage();
  await guest.goto(inviteLink!);
  await shot(guest, "22-invite-signed-out");
  await ctx.close();
});

test("member view and invite acceptance", async ({ page }) => {
  await signIn(page, "arjun@billora.example");
  await page.goto("/app/settings/workspace");
  await shot(page, "38-settings-workspace-member");
  await page.goto("/app/settings/team");
  await shot(page, "39-settings-team-member");

  // Kabir invites a new person, who signs up from the link and joins.
  await page.getByRole("button", { name: /Account menu/ }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("**/sign-in");

  await signIn(page, "kabir@billora.example");
  const email = `dev.${run}.${test.info().project.name}@traders.example`;
  await page.goto("/app/settings/team");
  await page.getByRole("button", { name: "Invite people" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByText(`Invitation sent to ${email}`)).toBeVisible();
  const link = await latestLink(page, email);

  await page.goto(link!);
  await shot(page, "23-invite-wrong-account");
  await page.getByRole("button", { name: "Sign out and switch account" }).click();
  await page.waitForURL("**/sign-in");
  await page.goto(link!);
  await page.getByRole("link", { name: "Create an account to join" }).click();
  await page.getByLabel("Your name").fill("Dev Patel");
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByLabel(/I agree/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/verify-email**");
  const verify = await latestLink(page, email);
  await page.goto(verify!);
  await page.waitForURL("**/invite/**");
  await shot(page, "24-invite-accept");
  await page.getByRole("button", { name: /Join Kabir Traders/ }).click();
  await page.waitForURL("**/app");
  await expect(page.getByText(/how Kabir Traders is doing/)).toBeVisible();
});
