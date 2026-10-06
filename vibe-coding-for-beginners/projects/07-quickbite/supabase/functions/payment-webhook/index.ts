// Payment provider webhooks (?provider=fake). No user JWT: the body's signature is checked.
import { serve } from '../_shared/app.ts';

serve('paymentWebhook');
