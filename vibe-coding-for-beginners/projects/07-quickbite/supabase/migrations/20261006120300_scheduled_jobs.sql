-- The demo simulator and unpaid-order expiry (docs/PLAN.md §6), run every
-- minute by pg_cron calling the scheduled-jobs Edge Function through pg_net.
--
-- The call needs two Vault secrets, created once per project (see README):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<same value as the CRON_SECRET function secret>', 'cron_secret');
-- Until they exist the job does nothing, so local stacks don't call anything
-- (locally `pnpm sim:supabase` runs the same jobs in a loop instead).
--
-- Plain Postgres without pg_cron/pg_net (the stand-in used by the RLS tests)
-- skips this migration.
do $migration$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron')
    or not exists (select 1 from pg_available_extensions where name = 'pg_net') then
    raise notice 'pg_cron or pg_net is not available: scheduled jobs not created';
    return;
  end if;

  create extension if not exists pg_cron;
  create extension if not exists pg_net with schema extensions;

  perform cron.schedule(
    'quickbite-order-jobs',
    '* * * * *',
    $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
          || '/functions/v1/scheduled-jobs',
        headers := jsonb_build_object(
          'content-type', 'application/json',
          'x-cron-secret',
          (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 60000
      )
      where exists (select 1 from vault.decrypted_secrets where name = 'project_url')
        and exists (select 1 from vault.decrypted_secrets where name = 'cron_secret');
    $job$
  );
end
$migration$;
