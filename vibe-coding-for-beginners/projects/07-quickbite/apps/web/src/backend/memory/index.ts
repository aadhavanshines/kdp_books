/**
 * In-memory backend built from the seed catalog. It is used for local
 * development without emulators and for component tests.
 *
 * Orders run through the real server code (@quickbite/server) with an
 * in-memory store and the fake payment provider, so quotes, idempotency,
 * signed webhooks and the status simulator behave exactly like Cloud Functions.
 */
import { addressPoint, searchCatalog, type Menu, type Order } from '@quickbite/core';
import {
  advanceDemoOrders,
  DEFAULT_DEMO_STEP_SECONDS,
  emptyMemoryState,
  expireUnpaidOrders,
  fakePay,
  FakeGateway,
  InMemoryOrderStore,
  OrderService,
  ServerError,
  type MemoryStoreState,
} from '@quickbite/server';
import { buildCatalog, type Catalog } from '@quickbite/seed';
import { SignInRequiredError } from '../errors';
import type { Address, Backend, Profile, User } from '../types';

export interface MemoryBackendOptions {
  /** Simulated network delay in ms (keeps loading states honest in dev). */
  latencyMs?: number;
  /** Where the session, profile and addresses are kept. Defaults to localStorage when available. */
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
  now?: () => Date;
  catalog?: Catalog;
  /** Start signed in as this user (tests). */
  user?: User | null;
  /** Seconds per order tracking step; 0 turns the status simulator off. */
  demoStepSeconds?: number;
}

const USER_KEY = 'quickbite.memory.user';
const ORDERS_KEY = 'quickbite.memory.orders';
/** Not a secret: the in-memory backend signs its own test webhooks. */
const MEMORY_WEBHOOK_SECRET = 'memory-backend-fake-webhook-secret';
const addressKey = (uid: string) => `quickbite.memory.addresses.${uid}`;
const profileKey = (uid: string) => `quickbite.memory.profile.${uid}`;

/** A stable fake uid for an email, so signing in again finds the same addresses. */
function uidFor(email: string): string {
  let h = 2166136261;
  for (const ch of email.toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `mem_${(h >>> 0).toString(36)}`;
}

export function createMemoryBackend(options: MemoryBackendOptions = {}): Backend {
  const catalog = options.catalog ?? buildCatalog();
  const latency = options.latencyMs ?? (import.meta.env.MODE === 'test' ? 0 : 250);
  const storage = options.storage === undefined ? safeLocalStorage() : options.storage;
  const now = options.now ?? (() => new Date());

  const areasById = new Map(catalog.areas.map((a) => [a.id, a]));

  const wait = <T>(value: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), latency));

  // A tiny key-value layer: storage when available, a Map otherwise.
  const memory = new Map<string, string>();
  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = storage ? storage.getItem(key) : (memory.get(key) ?? null);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  };
  const write = (key: string, value: unknown) => {
    const raw = JSON.stringify(value);
    memory.set(key, raw);
    try {
      storage?.setItem(key, raw);
    } catch {
      // Storage full or blocked: keep the in-memory copy.
    }
  };
  const remove = (key: string) => {
    memory.delete(key);
    try {
      storage?.removeItem(key);
    } catch {
      // Ignore blocked storage.
    }
  };

  // ---- Auth ---------------------------------------------------------------
  if (options.user !== undefined) {
    if (options.user) write(USER_KEY, options.user);
    else remove(USER_KEY);
  }
  let user: User | null = read<User | null>(USER_KEY, null);
  const listeners = new Set<(u: User | null) => void>();
  const setUser = (next: User | null) => {
    user = next;
    if (next) write(USER_KEY, next);
    else remove(USER_KEY);
    for (const l of listeners) l(next);
  };
  const requireUser = (): User => {
    if (!user) throw new SignInRequiredError();
    return user;
  };
  const signedIn = <T>(fn: (u: User) => T): Promise<T> => {
    try {
      return wait(fn(requireUser()));
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const readAddresses = (uid: string) => read<Address[]>(addressKey(uid), []);

  const restaurantsInArea = (areaId: string) =>
    catalog.restaurants.filter((r) => r.areaIds.includes(areaId));

  // ---- Orders: the real server workflow on an in-memory store --------------
  const store = new InMemoryOrderStore({
    catalog,
    getAddress: (uid, id) => readAddresses(uid).find((a) => a.id === id) ?? null,
    state: read<MemoryStoreState>(ORDERS_KEY, emptyMemoryState()),
    onChange: (state) => write(ORDERS_KEY, state),
  });
  const gateway = new FakeGateway(MEMORY_WEBHOOK_SECRET);
  const service = new OrderService({ store, gateways: { fake: gateway }, now });
  /** Server errors become plain errors, the way a network client would see them. */
  const server = <T>(fn: (u: User) => Promise<T>): Promise<T> =>
    signedIn((u) => u).then(async (u) => {
      try {
        return structuredClone(await fn(u));
      } catch (error) {
        if (error instanceof ServerError) throw new Error(error.message, { cause: error });
        throw error;
      }
    });

  const stepSeconds =
    options.demoStepSeconds ??
    (import.meta.env.MODE === 'test'
      ? 0
      : Number(import.meta.env.VITE_DEMO_STEP_SECONDS ?? DEFAULT_DEMO_STEP_SECONDS));
  if (stepSeconds > 0 && typeof window !== 'undefined') {
    // The demo simulator (on Firebase this is a scheduled function).
    setInterval(
      () => {
        void advanceDemoOrders(store, { now: now(), stepSeconds });
        void expireUnpaidOrders(store, { now: now() });
      },
      Math.max(500, (stepSeconds * 1000) / 5),
    );
  }

  return {
    name: 'memory',

    auth: {
      currentUser: () => user,
      onChange: (listener) => {
        listeners.add(listener);
        queueMicrotask(() => listeners.has(listener) && listener(user));
        return () => void listeners.delete(listener);
      },
      sendSignInLink: (email, continueUrl) => {
        // There is no email server: hand the link straight back, like the emulator helper does.
        const url = new URL(continueUrl);
        url.searchParams.set('mode', 'signIn');
        url.searchParams.set('oobCode', `memory-${Math.random().toString(36).slice(2, 10)}`);
        url.searchParams.set('memoryEmail', email.trim().toLowerCase());
        return wait({ devLink: url.toString() });
      },
      isSignInLink: (link) => {
        const params = new URL(link, 'http://localhost').searchParams;
        return params.get('mode') === 'signIn' && Boolean(params.get('oobCode'));
      },
      completeSignIn: (email, link) => {
        const linked = new URL(link, 'http://localhost').searchParams.get('memoryEmail');
        const normalized = email.trim().toLowerCase();
        if (linked && linked !== normalized) {
          return Promise.reject(new Error('This sign-in link was sent to a different email.'));
        }
        const next = { uid: uidFor(normalized), email: normalized };
        // Like a real backend, the session changes when the call completes.
        return wait(next).then((u) => {
          setUser(u);
          return u;
        });
      },
      signOut: () => wait(undefined).then(() => setUser(null)),
    },

    profile: {
      get: () => signedIn((u) => read<Profile | null>(profileKey(u.uid), null)),
      save: (profile) =>
        signedIn((u) => {
          const saved = { name: profile.name.trim(), phone: profile.phone.trim() };
          write(profileKey(u.uid), saved);
          return saved;
        }),
    },

    catalog: {
      listRegions: () => wait(catalog.regions),
      listAreas: () => wait(catalog.areas),
      listRestaurants: (areaId) => wait(restaurantsInArea(areaId)),
      getRestaurantBySlug: (slug) => wait(catalog.restaurants.find((r) => r.slug === slug) ?? null),
      getMenu: (restaurantId) => {
        const menu: Menu = {
          categories: catalog.categories.filter((c) => c.restaurantId === restaurantId),
          items: catalog.items.filter((i) => i.restaurantId === restaurantId),
        };
        return wait(menu);
      },
      search: (areaId, query) => {
        const restaurants = restaurantsInArea(areaId);
        const ids = new Set(restaurants.map((r) => r.id));
        return wait(
          searchCatalog(
            query,
            restaurants,
            catalog.items.filter((i) => ids.has(i.restaurantId)),
          ),
        );
      },
      listCoupons: (brandId) =>
        wait(
          catalog.coupons.filter(
            (c) =>
              c.active &&
              (c.brandId === null || c.brandId === brandId) &&
              new Date(c.validTo) > now(),
          ),
        ),
    },

    addresses: {
      list: () => signedIn((u) => readAddresses(u.uid)),
      save: (input) =>
        signedIn((u) => {
          const area = areasById.get(input.areaId);
          if (!area) throw new Error('Unknown area');
          const list = readAddresses(u.uid);
          const existing = input.id ? list.find((a) => a.id === input.id) : undefined;
          const address: Address = {
            ...input,
            id:
              existing?.id ??
              `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            ...addressPoint(area),
          };
          write(
            addressKey(u.uid),
            existing ? list.map((a) => (a.id === address.id ? address : a)) : [address, ...list],
          );
          return address;
        }),
      remove: (id) =>
        signedIn((u) => {
          write(
            addressKey(u.uid),
            readAddresses(u.uid).filter((a) => a.id !== id),
          );
        }),
    },

    orders: {
      quote: (request) => server((u) => service.quote(u.uid, request)),
      place: (request) => server((u) => service.placeOrder(u.uid, request)),
      payFake: (orderId, outcome) =>
        server(async (u) => {
          await fakePay({
            store,
            gateway,
            userId: u.uid,
            input: { orderId, outcome },
            deliver: (rawBody, headers) => service.handleWebhook('fake', rawBody, headers),
            now,
          });
        }),
      startPayment: (orderId) => server((u) => service.startPayment(u.uid, { orderId })),
      // The in-memory backend only has the fake provider.
      confirmRazorpay: () => Promise.reject(new Error('Razorpay is not available in memory mode')),
      get: (orderId) =>
        signedIn((u) => u).then(async (u) => {
          const order = await store.getOrder(orderId);
          return order?.userId === u.uid ? order : null;
        }),
      watch: (orderId, onChange, onError) => {
        const uid = user?.uid;
        if (!uid) {
          queueMicrotask(() => onError?.(new SignInRequiredError()));
          return () => undefined;
        }
        let last = '';
        const emit = (order: Order | null) => {
          const own = order?.userId === uid ? order : null;
          const key = JSON.stringify(own);
          if (key !== last) {
            last = key;
            onChange(structuredClone(own));
          }
        };
        void store.getOrder(orderId).then(emit);
        return store.subscribe((state) => emit(state.orders[orderId] ?? null));
      },
      list: () => signedIn((u) => store.listOrdersForUser(u.uid)),
    },
  };
}

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
