import { createHmac, timingSafeEqual } from "node:crypto";

export function hmacSha256Hex(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

/** Constant-time comparison of two hex strings. */
export function safeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b) || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/**
 * Razorpay webhooks: `X-Razorpay-Signature` is the hex HMAC-SHA256 of the raw
 * request body, keyed with the webhook secret. Verify the exact bytes received:
 * re-serialising parsed JSON changes them.
 */
export function verifyRazorpayWebhook(rawBody: string, signature: string | null | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  return safeEqualHex(hmacSha256Hex(secret, rawBody), signature.trim());
}

export function signRazorpayWebhook(rawBody: string, secret: string): string {
  return hmacSha256Hex(secret, rawBody);
}

/** Razorpay Checkout result for an order: HMAC(order_id + "|" + payment_id, key_secret). */
export function verifyRazorpayPayment(p: { orderId: string; paymentId: string; signature: string }, keySecret: string): boolean {
  return safeEqualHex(hmacSha256Hex(keySecret, `${p.orderId}|${p.paymentId}`), p.signature);
}

/** Razorpay Checkout result for a subscription: HMAC(payment_id + "|" + subscription_id, key_secret). */
export function verifyRazorpaySubscriptionPayment(p: { subscriptionId: string; paymentId: string; signature: string }, keySecret: string): boolean {
  return safeEqualHex(hmacSha256Hex(keySecret, `${p.paymentId}|${p.subscriptionId}`), p.signature);
}

export const STRIPE_TOLERANCE_SECONDS = 300;

/**
 * Stripe webhooks: `Stripe-Signature: t=<unix>,v1=<hex>[,v1=…]` where v1 is
 * HMAC-SHA256 of `${t}.${rawBody}` keyed with the endpoint secret. Events older
 * than the tolerance are rejected, which limits replays of captured requests.
 */
export function verifyStripeWebhook(rawBody: string, header: string | null | undefined, secret: string, now = new Date(), toleranceSeconds = STRIPE_TOLERANCE_SECONDS): boolean {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.trim().split("=", 2) as [string, string | undefined]);
  const t = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v ?? "");
  if (!t || !/^\d+$/.test(t) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(now.getTime() / 1000) - Number(t)) > toleranceSeconds) return false;
  const expected = hmacSha256Hex(secret, `${t}.${rawBody}`);
  return signatures.some((s) => safeEqualHex(expected, s));
}

export function signStripeWebhook(rawBody: string, secret: string, now = new Date()): string {
  const t = Math.floor(now.getTime() / 1000);
  return `t=${t},v1=${hmacSha256Hex(secret, `${t}.${rawBody}`)}`;
}
