// Called by pg_cron every minute: demo simulator and unpaid-order expiry.
import { serve } from '../_shared/app.ts';

serve('scheduledJobs');
