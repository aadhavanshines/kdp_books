/**
 * Supabase backend: Auth (emailed one-time code, as a link or typed in),
 * Postgres reads through the REST API (limited by Row Level Security),
 * Realtime for live orders, and Edge Functions for anything that involves money.
 *
 * The browser only reads the public catalog and its own data, and writes only
 * its own profile and addresses (see supabase/migrations).
 */
import {
  addressPoint,
  primarySearchToken,
  searchCatalog,
  type Area,
  type Order,
  type PaymentStart,
  type PlaceOrderRequest,
  type PlaceOrderResult,
  type Quote,
  type QuoteRequest,
  type RazorpayCheckoutResponse,
} from '@quickbite/core';
import {
  areaFromRow,
  categoryFromRow,
  couponFromRow,
  MENU_ITEM_COLUMNS,
  menuItemFromRow,
  orderFromRow,
  regionFromRow,
  restaurantFromRow,
  type AddressRow,
  type AreaRow,
  type CouponRow,
  type MenuCategoryRow,
  type MenuItemRow,
  type OrderItemRow,
  type OrderRow,
  type RegionRow,
  type RestaurantRow,
} from '@quickbite/supabase/rows';
import {
  createClient,
  FunctionsHttpError,
  type RealtimeChannel,
  type SupabaseClient,
  type User as SupabaseUser,
} from '@supabase/supabase-js';
import { SignInRequiredError } from '../errors';
import type { Address, Backend, Profile, User } from '../types';
import type { SupabaseBackendOptions } from './config';

export type { SupabaseBackendOptions } from './config';

export interface SupabaseBackend extends Backend {
  client: SupabaseClient;
}

type Result<T> = { data: T; error: { message: string } | null };

/** Unwraps a supabase-js result, turning its error into a thrown Error. */
function must<T>({ data, error }: Result<T>): T {
  if (error) throw new Error(error.message);
  return data;
}

/** The emailed link carries the one-time code in its fragment: …/login/finish?next=/#otp=123456 */
function codeFromLink(link: string): string | null {
  try {
    const code = new URLSearchParams(new URL(link, 'http://localhost').hash.slice(1)).get('otp');
    return code && /^\d{6,10}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

const ORDER_SELECT = '*, order_items(*)';
type OrderRowWithItems = OrderRow & { order_items: OrderItemRow[] };
const toOrder = (row: OrderRowWithItems): Order => orderFromRow(row, row.order_items);

export function createSupabaseBackend(options: SupabaseBackendOptions): SupabaseBackend {
  const client = createClient(options.url, options.anonKey, {
    auth: {
      storage: options.storage,
      persistSession: true,
      autoRefreshToken: true,
      // Sign-in links are completed by completeSignIn(), not by the client on load.
      detectSessionInUrl: false,
    },
  });
  const pollMs = options.pollMs ?? 4000;

  // ---- Session -------------------------------------------------------------
  const toUser = (u: SupabaseUser | null | undefined): User | null =>
    u ? { uid: u.id, email: u.email ?? null } : null;
  let user: User | null = null;
  let markReady: () => void;
  const ready = new Promise<void>((resolve) => (markReady = resolve));
  const listeners = new Set<(u: User | null) => void>();
  const setUser = (next: User | null) => {
    if (next?.uid === user?.uid) {
      user = next;
      return;
    }
    user = next;
    for (const l of listeners) l(next);
  };
  client.auth.onAuthStateChange((event, session) => {
    setUser(toUser(session?.user));
    if (event === 'INITIAL_SESSION') markReady();
  });

  const withUid = async <T>(fn: (uid: string) => Promise<T>): Promise<T> => {
    await ready;
    if (!user) throw new SignInRequiredError();
    return fn(user.uid);
  };

  const verify = async (email: string, code: string): Promise<User> => {
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: 'email',
    });
    if (error || !data.user) throw new Error(error?.message ?? 'This code didn’t work.');
    const signedIn = toUser(data.user)!;
    setUser(signedIn);
    return signedIn;
  };

  /** On the local stack no email leaves the machine: read the link from Mailpit, like an inbox. */
  async function mailpitSignInLink(email: string, since: number): Promise<string | undefined> {
    if (!options.mailpitUrl) return undefined;
    const base = options.mailpitUrl.replace(/\/$/, '');
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const res = await fetch(
          `${base}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=5`,
        );
        const { messages = [] } = (await res.json()) as {
          messages?: { ID: string; Created: string }[];
        };
        const latest = messages.find((m) => new Date(m.Created).getTime() >= since - 2000);
        if (latest) {
          const message = (await (await fetch(`${base}/api/v1/message/${latest.ID}`)).json()) as {
            HTML?: string;
          };
          const href = /href="([^"]*#otp=\d+)"/.exec(message.HTML ?? '')?.[1];
          if (href) return href.replaceAll('&amp;', '&');
        }
      } catch {
        // Mailpit unreachable (or blocked by CORS): the customer uses the email or the code instead.
        return undefined;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    return undefined;
  }

  // ---- Catalog helpers -----------------------------------------------------
  let areasPromise: Promise<Area[]> | null = null;
  const listAreas = () => {
    areasPromise ??= Promise.resolve(client.from('areas').select('*')).then((r) =>
      must(r as Result<AreaRow[]>).map(areaFromRow),
    );
    areasPromise.catch(() => (areasPromise = null));
    return areasPromise;
  };
  const listRestaurants = async (areaId: string) =>
    must(
      (await client
        .from('restaurants')
        .select('*')
        .contains('area_ids', [areaId])
        .order('sort_order')) as Result<RestaurantRow[]>,
    ).map(restaurantFromRow);

  const toAddress = (row: AddressRow, areas: Area[]): Address => {
    const area = areas.find((a) => a.id === row.area_id);
    const point = area ? addressPoint(area) : { lat: 0, lng: 0 };
    return {
      id: row.id,
      label: row.label as Address['label'],
      name: row.name,
      phone: row.phone,
      line1: row.line1,
      line2: row.line2,
      landmark: row.landmark,
      areaId: row.area_id,
      pincode: row.pincode,
      ...point,
    };
  };

  /** Calls an Edge Function as the signed-in customer. */
  const call =
    <Req, Res>(name: string) =>
    (request: Req): Promise<Res> =>
      withUid(async () => {
        const { data, error } = await client.functions.invoke<Res>(name, {
          body: request as object,
        });
        if (!error) return data as Res;
        if (error instanceof FunctionsHttpError) {
          const response = error.context as Response;
          if (response.status === 401) throw new SignInRequiredError();
          const body = (await response.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(body?.error?.message ?? `Request failed (${response.status})`);
        }
        throw new Error(error.message);
      });
  const quoteOrder = call<QuoteRequest, Quote>('quote-order');
  const createOrder = call<PlaceOrderRequest, PlaceOrderResult>('create-order');
  const fakePay = call<{ orderId: string; outcome: 'success' | 'failure' }, unknown>('fake-pay');
  const startPayment = call<{ orderId: string }, PaymentStart>('start-payment');
  const verifyRazorpay = call<{ orderId: string } & RazorpayCheckoutResponse, { outcome: string }>(
    'verify-razorpay',
  );

  const getOrder = async (orderId: string) => {
    const row = must(
      (await client
        .from('orders')
        .select(ORDER_SELECT)
        .eq('id', orderId)
        .maybeSingle()) as Result<OrderRowWithItems | null>,
    );
    // RLS hides other people's orders and missing ones alike: both read as "no order".
    return row ? toOrder(row) : null;
  };

  return {
    name: 'supabase',
    client,

    auth: {
      currentUser: () => user,
      onChange: (listener) => {
        listeners.add(listener);
        void ready.then(() => listeners.has(listener) && listener(user));
        return () => void listeners.delete(listener);
      },
      sendSignInLink: async (email, continueUrl) => {
        const address = email.trim().toLowerCase();
        const since = Date.now();
        const { error } = await client.auth.signInWithOtp({
          email: address,
          options: { emailRedirectTo: continueUrl, shouldCreateUser: true },
        });
        if (error) throw new Error(error.message);
        return { devLink: await mailpitSignInLink(address, since) };
      },
      isSignInLink: (link) => codeFromLink(link) !== null,
      completeSignIn: async (email, link) => {
        const code = codeFromLink(link);
        if (!code) throw new Error('This is not a sign-in link.');
        return verify(email, code);
      },
      verifyCode: (email, code) => verify(email, code.trim()),
      signOut: async () => {
        // This device only, like signing out of the Firebase backend.
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error) throw new Error(error.message);
        setUser(null);
      },
    },

    profile: {
      get: () =>
        withUid(async (uid) => {
          const row = must(
            (await client
              .from('profiles')
              .select('name, phone')
              .eq('user_id', uid)
              .maybeSingle()) as Result<Profile | null>,
          );
          return row ? { name: row.name, phone: row.phone } : null;
        }),
      save: (profile) =>
        withUid(async () => {
          const saved: Profile = { name: profile.name.trim(), phone: profile.phone.trim() };
          // user_id defaults to the signed-in customer; it isn't sent (or allowed).
          must(await client.from('profiles').upsert(saved, { onConflict: 'user_id' }));
          return saved;
        }),
    },

    catalog: {
      listRegions: async () =>
        must((await client.from('regions').select('*').order('id')) as Result<RegionRow[]>).map(
          regionFromRow,
        ),
      listAreas,
      listRestaurants,
      getRestaurantBySlug: async (slug) => {
        const row = must(
          (await client
            .from('restaurants')
            .select('*')
            .eq('slug', slug)
            .maybeSingle()) as Result<RestaurantRow | null>,
        );
        return row && restaurantFromRow(row);
      },
      getMenu: async (restaurantId) => {
        const [categories, items] = await Promise.all([
          client
            .from('menu_categories')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('sort_order'),
          client
            .from('menu_items')
            .select(MENU_ITEM_COLUMNS)
            .eq('restaurant_id', restaurantId)
            .order('position'),
        ]);
        return {
          categories: must(categories as Result<MenuCategoryRow[]>).map(categoryFromRow),
          items: must(items as unknown as Result<MenuItemRow[]>).map(menuItemFromRow),
        };
      },
      search: async (areaId, text) => {
        const token = primarySearchToken(text);
        const [restaurants, items] = await Promise.all([
          listRestaurants(areaId),
          token
            ? client
                .rpc('search_menu_items', { p_area_id: areaId, p_term: token })
                .select(MENU_ITEM_COLUMNS)
                .then((r) => must(r as unknown as Result<MenuItemRow[]>).map(menuItemFromRow))
            : [],
        ]);
        return searchCatalog(text, restaurants, items);
      },
      listCoupons: async (brandId) => {
        const now = new Date();
        return must((await client.from('public_coupons').select('*')) as Result<CouponRow[]>)
          .map(couponFromRow)
          .filter(
            (c) =>
              c.active &&
              (c.brandId === null || c.brandId === brandId) &&
              new Date(c.validTo) > now,
          );
      },
    },

    addresses: {
      list: () =>
        withUid(async (uid) => {
          const [rows, areas] = await Promise.all([
            client
              .from('addresses')
              .select('*')
              .eq('user_id', uid)
              .order('created_at', { ascending: false }),
            listAreas(),
          ]);
          return must(rows as Result<AddressRow[]>).map((row) => toAddress(row, areas));
        }),
      save: (input) =>
        withUid(async () => {
          const areas = await listAreas();
          if (!areas.some((a) => a.id === input.areaId)) throw new Error('Unknown area');
          // Only these columns are writable (column grants); user_id and coordinates are not.
          const fields = {
            label: input.label,
            name: input.name,
            phone: input.phone,
            line1: input.line1,
            line2: input.line2,
            landmark: input.landmark,
            area_id: input.areaId,
            pincode: input.pincode,
          };
          const query = input.id
            ? client.from('addresses').update(fields).eq('id', input.id)
            : client.from('addresses').insert(fields);
          const row = must((await query.select('*').single()) as Result<AddressRow>);
          return toAddress(row, areas);
        }),
      remove: (id) =>
        withUid(async () => {
          must(await client.from('addresses').delete().eq('id', id));
        }),
    },

    orders: {
      quote: (request) => quoteOrder(request),
      place: (request) => createOrder(request),
      payFake: async (orderId, outcome) => {
        await fakePay({ orderId, outcome });
      },
      startPayment: (orderId) => startPayment({ orderId }),
      confirmRazorpay: (orderId, response) => verifyRazorpay({ orderId, ...response }),
      get: (orderId) => withUid(() => getOrder(orderId)),
      watch: (orderId, onChange, onError) => {
        let stopped = false;
        let channel: RealtimeChannel | null = null;
        let poll: ReturnType<typeof setInterval> | null = null;
        let last: string | undefined;

        const refresh = async () => {
          try {
            const order = await getOrder(orderId);
            const key = JSON.stringify(order);
            if (stopped || key === last) return;
            last = key;
            onChange(order);
          } catch (error) {
            if (!stopped) onError?.(error as Error);
          }
        };
        // Until Realtime confirms the subscription (or whenever it drops: blocked
        // websockets, an outage), re-read the order every few seconds.
        const startPolling = () => {
          poll ??= setInterval(() => void refresh(), pollMs);
        };
        const stopPolling = () => {
          if (poll) clearInterval(poll);
          poll = null;
        };

        void ready.then(() => {
          if (stopped) return;
          if (!user) {
            onError?.(new SignInRequiredError());
            return;
          }
          void refresh();
          startPolling();
          // RLS applies to Realtime too: only the owner hears about changes to this order.
          channel = client
            .channel(`order-${orderId}-${Math.random().toString(36).slice(2, 8)}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
              () => void refresh(),
            )
            .subscribe((status) => {
              if (stopped) return;
              if (status === 'SUBSCRIBED') {
                stopPolling();
                // Catch anything that changed between the first read and the subscription.
                void refresh();
              } else {
                startPolling();
              }
            });
        });

        return () => {
          stopped = true;
          stopPolling();
          if (channel) void client.removeChannel(channel);
        };
      },
      list: () =>
        withUid(async (uid) =>
          must(
            (await client
              .from('orders')
              .select(ORDER_SELECT)
              .eq('user_id', uid)
              .order('created_at', { ascending: false })
              .limit(50)) as Result<OrderRowWithItems[]>,
          ).map(toOrder),
        ),
    },
  };
}
