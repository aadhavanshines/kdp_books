/**
 * Who runs this QuickBite, shown on the About, Contact and policy pages.
 * Razorpay checks these pages (and that they match your KYC documents) before it
 * activates an account, so replace every `[bracketed]` value with the real one.
 * `pnpm launch:check` fails while any is left, and the live deploy runs it.
 */
export const business = {
  /** Registered name, exactly as on your PAN / GST / incorporation papers. */
  legalName: '[Registered business name]',
  /** Name customers see; may be the same as legalName. */
  tradeName: 'QuickBite',
  /** Registered office, as one line. */
  address: '[Registered office address, city, state, PIN]',
  supportEmail: '[support@your-domain]',
  /** With country code, e.g. +91 98xxxxxxxx. */
  supportPhone: '[+91 phone number]',
  /** Hours the phone and email are answered. */
  supportHours: '10:00 am to 7:00 pm IST, Monday to Saturday',
  /** Person named for complaints under the Consumer Protection (E-Commerce) Rules. */
  grievanceOfficer: '[Grievance officer name]',
  /** Shown on the policy pages; bump it when the wording changes. */
  policiesUpdated: '6 October 2026',
  /** Where orders are delivered today (the areas in the app). */
  serviceCities: ['Bengaluru'],
  /** Days an unpaid-for refund normally takes to reach the customer's account. */
  refundDays: '5 to 7 business days',
};

export const PLACEHOLDER = /^\[.*\]$/;

/** The business fields still holding their `[placeholder]` text. */
export function unsetBusinessFields(values: Record<string, unknown> = business): string[] {
  return Object.entries(values)
    .filter(([, v]) => typeof v === 'string' && PLACEHOLDER.test(v))
    .map(([k]) => k);
}
