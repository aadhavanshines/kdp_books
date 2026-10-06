-- Who may read and write what (docs/PLAN.md §4). Deny by default, then open
-- only what each role needs:
--
--   anon, authenticated   read the catalog and active coupons
--   authenticated         read/write their own profile and addresses (listed
--                         columns only), read their own orders and order items
--   nobody (browser)      coupons, payments, webhook events, coupon redemptions
--
-- Orders and payments are written only by server code (Edge Functions), which
-- connects as the table owner. Supabase grants anon and authenticated every
-- privilege on new tables by default, so everything is revoked first and
-- granted back explicitly; RLS then limits the rows.

-- Tables and functions created later by this role are private until granted.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

alter table public.regions enable row level security;
alter table public.areas enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.coupons enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.coupon_redemptions enable row level security;

-- ---- Public catalog: read-only for everyone -----------------------------------

grant select on public.regions, public.areas, public.restaurants, public.menu_categories,
  public.menu_items to anon, authenticated;

create policy "Catalog is public" on public.regions for select to anon, authenticated using (true);
create policy "Catalog is public" on public.areas for select to anon, authenticated using (true);
create policy "Catalog is public" on public.restaurants for select to anon, authenticated using (true);
create policy "Catalog is public" on public.menu_categories for select to anon, authenticated using (true);
create policy "Catalog is public" on public.menu_items for select to anon, authenticated using (true);

-- Coupons stay private; this view shows active ones (with the fields the
-- checkout needs to explain eligibility). It runs with its owner's rights so it
-- can read the private table, and exposes nothing else.
create view public.public_coupons with (security_invoker = false) as
  select code, title, description, type, value, max_discount, min_order, brand_id, region_id,
    valid_from, valid_to, per_user_limit, active
  from public.coupons
  where active;

grant select on public.public_coupons to anon, authenticated;

-- ---- Profile and addresses: the owner only, listed columns only ---------------

-- user_id defaults to auth.uid() and is not in any grant, so it can't be set or changed.
grant select on public.profiles to authenticated;
grant insert (name, phone), update (name, phone) on public.profiles to authenticated;

create policy "Read own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Create own profile" on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Update own profile" on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, delete on public.addresses to authenticated;
grant insert (label, name, phone, line1, line2, landmark, area_id, pincode),
  update (label, name, phone, line1, line2, landmark, area_id, pincode)
  on public.addresses to authenticated;

create policy "Read own addresses" on public.addresses for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Create own addresses" on public.addresses for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Update own addresses" on public.addresses for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Delete own addresses" on public.addresses for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---- Orders: read your own, never write -----------------------------------------

grant select on public.orders, public.order_items to authenticated;

create policy "Read own orders" on public.orders for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Read own order items" on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())
  ));

-- ---- Server-only ----------------------------------------------------------------
-- coupons, payments, webhook_events and coupon_redemptions have RLS enabled,
-- no policies and no grants: only the owner (server code) can touch them.
