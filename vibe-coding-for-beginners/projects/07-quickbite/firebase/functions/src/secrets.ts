/**
 * Payment secrets live in Google Secret Manager, never in the repo or in
 * `.env` files. Naming them here makes Firebase mount each one into the
 * functions that list it, as an environment variable of the same name (which is
 * what paymentsConfigFromEnv reads). Deploying fails if one hasn't been created:
 *
 *   firebase functions:secrets:set RAZORPAY_KEY_ID      (see docs/LAUNCH.md)
 *
 * Stripe (for countries outside India): create the three STRIPE_* secrets, add
 * them to this list and deploy. Until then Stripe is simply not configured.
 *
 * The emulators never contact Secret Manager (no credentials needed): nothing is
 * bound there, PAYMENTS_MODE defaults to fake, and real test keys can be put in
 * the environment or in firebase/functions/.env.local (git-ignored).
 */
import { defineSecret } from 'firebase-functions/params';

export const paymentSecrets =
  process.env.FUNCTIONS_EMULATOR === 'true'
    ? []
    : [
        defineSecret('RAZORPAY_KEY_ID'),
        defineSecret('RAZORPAY_KEY_SECRET'),
        defineSecret('RAZORPAY_WEBHOOK_SECRET'),
      ];
