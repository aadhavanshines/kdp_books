-- QuickBite schema (docs/PLAN.md §2).
--
-- Money is always an integer in minor units (paise) next to a currency code.
-- Timestamps are timestamptz; the app reads and writes them as ISO 8601 UTC.
-- Who may read or write each table is set in the next migration (security).

create extension if not exists pg_trgm with schema extensions;

-- ---- Public catalog ---------------------------------------------------------

create table public.regions (
  id text primary key,
  name text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  locale text not null,
  timezone text not null,
  payment_provider text not null check (payment_provider in ('razorpay', 'stripe')),
  platform_fee integer not null check (platform_fee >= 0),
  food_tax_bps integer not null check (food_tax_bps between 0 and 10000),
  fee_tax_bps integer not null check (fee_tax_bps between 0 and 10000),
  -- [{ "upToKm": 3, "fee": 2500 }, …], ascending
  delivery_fee_bands jsonb not null check (jsonb_typeof(delivery_fee_bands) = 'array')
);

create table public.areas (
  id text primary key,
  name text not null,
  city text not null,
  region_id text not null references public.regions (id),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180)
);

create table public.restaurants (
  id text primary key,
  brand_id text not null,
  slug text not null unique,
  name text not null,
  image_url text not null,
  cuisines text[] not null,
  rating double precision not null check (rating between 0 and 5),
  rating_count integer not null check (rating_count >= 0),
  cost_for_two integer not null check (cost_for_two >= 0),
  delivery_time_min integer not null check (delivery_time_min > 0),
  delivery_time_max integer not null check (delivery_time_max >= delivery_time_min),
  is_pure_veg boolean not null,
  is_open boolean not null,
  area_ids text[] not null,
  region_id text not null references public.regions (id),
  locality text not null,
  -- { "headline", "subline", "couponCode"? } or null
  offer jsonb,
  is_promoted boolean,
  lat double precision not null,
  lng double precision not null,
  -- Keeps listings in a stable order.
  sort_order integer not null default 0
);

create index restaurants_area_ids_idx on public.restaurants using gin (area_ids);

create table public.menu_categories (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  name text not null,
  sort_order integer not null
);

create index menu_categories_restaurant_idx on public.menu_categories (restaurant_id, sort_order);

create table public.menu_items (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  category_id text not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  is_veg boolean not null,
  image_url text,
  is_available boolean not null,
  is_bestseller boolean not null,
  tags text[],
  -- Original menu order.
  position integer not null,
  -- Lower-cased, accent-free name and description (core normalizeText), for dish search.
  search_text text not null
);

create index menu_items_restaurant_idx on public.menu_items (restaurant_id, position);
create index menu_items_search_idx on public.menu_items using gin (search_text extensions.gin_trgm_ops);

-- Private: the full coupon rules. Customers see active coupons through the
-- public_coupons view (security migration).
create table public.coupons (
  code text primary key check (code ~ '^[A-Z0-9]{3,20}$'),
  title text not null,
  description text not null,
  type text not null check (type in ('percent', 'flat', 'free_delivery')),
  value integer not null check (value >= 0),
  max_discount integer check (max_discount >= 0),
  min_order integer not null check (min_order >= 0),
  brand_id text,
  region_id text not null references public.regions (id),
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  per_user_limit integer check (per_user_limit > 0),
  active boolean not null
);

-- ---- Customer data -----------------------------------------------------------

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  phone text not null default '' check (phone ~ '^[0-9]{0,15}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coordinates are not stored: the server works them out from the area, so a
-- customer can't move an address closer to get a cheaper delivery.
create table public.addresses (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text not null check (label in ('Home', 'Work', 'Other')),
  name text not null check (char_length(name) between 2 and 60),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  line1 text not null check (char_length(line1) between 3 and 120),
  line2 text not null check (char_length(line2) between 3 and 120),
  landmark text not null default '' check (char_length(landmark) <= 80),
  area_id text not null references public.areas (id),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id, created_at desc);

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger addresses_touch before update on public.addresses
  for each row execute function public.touch_updated_at();

-- ---- Orders and payments (written only by server code) -----------------------

-- Items, address and restaurant are snapshots taken when the order was placed,
-- so later menu edits never change a past order.
create table public.orders (
  id text primary key,
  -- No cascade: orders are financial records. Deleting an account must
  -- anonymise its orders first (delete-my-account arrives with phase 7).
  user_id uuid not null references auth.users (id),
  restaurant_id text not null references public.restaurants (id),
  restaurant jsonb not null,
  status text not null check (status in (
    'pending_payment', 'placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered',
    'payment_failed', 'expired', 'cancelled'
  )),
  status_history jsonb not null check (jsonb_typeof(status_history) = 'array'),
  address jsonb not null,
  bill jsonb not null check ((bill ->> 'grandTotal')::integer >= 0),
  distance_km double precision not null check (distance_km >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  coupon_code text,
  note text not null default '' check (char_length(note) <= 200),
  payment_provider text not null check (payment_provider in ('fake', 'razorpay', 'stripe')),
  payment_status text not null check (payment_status in ('pending', 'paid', 'failed')),
  provider_order_id text,
  provider_payment_id text,
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9_-]{8,64}$'),
  needs_review boolean not null default false,
  eta_minutes jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  status_updated_at timestamptz not null,
  -- A retried checkout returns the same order instead of creating another.
  unique (user_id, idempotency_key)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, status_updated_at);
create unique index orders_provider_order_idx on public.orders (payment_provider, provider_order_id)
  where provider_order_id is not null;

create table public.order_items (
  order_id text not null references public.orders (id) on delete cascade,
  line_no integer not null check (line_no >= 0),
  menu_item_id text not null,
  name text not null,
  unit_price integer not null check (unit_price >= 0),
  qty integer not null check (qty between 1 and 20),
  is_veg boolean not null,
  line_total integer not null check (line_total = unit_price * qty),
  primary key (order_id, line_no)
);

create table public.payments (
  id text primary key,
  order_id text not null references public.orders (id),
  user_id uuid not null,
  provider text not null check (provider in ('fake', 'razorpay', 'stripe')),
  provider_order_id text not null,
  provider_payment_id text not null,
  amount integer not null check (amount >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('captured', 'failed', 'amount_mismatch', 'duplicate')),
  event_id text not null,
  created_at timestamptz not null
);

create index payments_order_idx on public.payments (order_id);

-- The primary key makes a repeated webhook a no-op.
create table public.webhook_events (
  provider text not null check (provider in ('fake', 'razorpay', 'stripe')),
  event_id text not null,
  type text not null,
  outcome text not null,
  order_id text references public.orders (id),
  received_at timestamptz not null,
  primary key (provider, event_id)
);

-- One redemption per order; counted per customer to enforce per-user limits.
create table public.coupon_redemptions (
  order_id text primary key references public.orders (id),
  user_id uuid not null,
  coupon_code text not null,
  created_at timestamptz not null
);

create index coupon_redemptions_user_idx on public.coupon_redemptions (user_id, coupon_code);
