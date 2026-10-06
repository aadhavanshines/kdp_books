/**
 * `pnpm launch:check`: stops a live deploy while the site still has placeholder
 * business details (Razorpay reviews the About, Contact and policy pages).
 */
import { business, unsetBusinessFields } from '../apps/web/src/config/business';

const unset = unsetBusinessFields(business);
if (unset.length > 0) {
  console.error(
    `apps/web/src/config/business.ts still has placeholder values for: ${unset.join(', ')}.\n` +
      'Fill them in with your real business details before going live (docs/LAUNCH.md, step 1).',
  );
  process.exit(1);
}
console.log('Business details are filled in.');
