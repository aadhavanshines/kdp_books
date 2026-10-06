-- ============================================================================
--  TEST-ONLY STAND-IN for the parts of a Supabase database that plain
--  PostgreSQL doesn't have. NEVER run this against a real Supabase project:
--  Supabase creates all of this itself (with more detail).
--
--  It mirrors what the QuickBite migrations and RLS tests rely on:
--    - the API roles anon, authenticated and service_role, and authenticator
--      (the login role PostgREST switches from)
--    - Supabase's default privileges: anon and authenticated get every
--      privilege on new public tables and functions (so the migrations must
--      revoke them, exactly as on a real project)
--    - the extensions schema and the supabase_realtime publication
--
--  The auth schema is in supabase-auth.sql (skipped when a real Supabase Auth
--  server creates it with its own migrations).
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit password 'postgres';
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login createrole noinherit password 'postgres';
  end if;
end
$$;

grant anon, authenticated, service_role to authenticator;
grant anon, authenticated, service_role to postgres;

create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

create schema if not exists auth authorization supabase_auth_admin;
grant usage on schema auth to anon, authenticated, service_role;
do $$ begin
  execute format('grant create on database %I to supabase_auth_admin', current_database());
end $$;

create publication supabase_realtime;
