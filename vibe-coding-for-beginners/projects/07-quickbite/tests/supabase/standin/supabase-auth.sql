-- ============================================================================
--  TEST-ONLY STAND-IN for Supabase Auth's database objects. NEVER run this
--  against a real Supabase project, where Supabase Auth owns the auth schema.
--
--  Just enough for the migrations and RLS tests: an auth.users table (only
--  the columns tests use) and auth.uid() / auth.role() / auth.jwt(), defined
--  the way Supabase defines them: they read the JWT claims that PostgREST
--  puts in the request.jwt.claims setting. Tests "sign in" by setting that
--  claim and switching to the authenticated role inside a transaction.
-- ============================================================================

create table auth.users (
  id uuid primary key,
  email text unique,
  created_at timestamptz not null default now()
);

create function auth.jwt() returns jsonb
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

create function auth.uid() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

create function auth.role() returns text
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;

grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;
