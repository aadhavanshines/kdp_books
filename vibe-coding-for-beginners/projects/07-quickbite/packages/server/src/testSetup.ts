/** Shared fixtures for the server tests: the seed catalog, a store, a service and a clock. */
import type { PaymentProvider } from '@quickbite/core';
import { buildCatalog, type Catalog } from '@quickbite/seed';
import type { RealProvider } from './config';
import { FakeGateway } from './gateways/fake';
import type { PaymentGateway } from './gateways/types';
import { InMemoryOrderStore } from './memoryStore';
import { OrderService, type RateLimit } from './orderService';
import type { StoredAddress } from './store';

export const SECRET = 'test-fake-webhook-secret';
export const catalog = buildCatalog();
export const restaurant = catalog.restaurants.find((r) => r.slug === 'tandoor-tales-koramangala')!;
export const menu = catalog.items.filter((i) => i.restaurantId === restaurant.id);
export const butterChicken = menu.find((i) => i.name === 'Butter Chicken')!;
export const garlicNaan = menu.find((i) => i.name === 'Garlic Naan')!;

export const ASHA = 'asha';
export const RAVI = 'ravi';

const home = (id: string, areaId = 'blr-koramangala'): StoredAddress => ({
  id,
  label: 'Home',
  name: 'Asha Rao',
  phone: '9876543210',
  line1: 'Flat 4B',
  line2: '5th Block',
  landmark: '',
  areaId,
  pincode: '560095',
});

export interface SetupOptions {
  rateLimit?: RateLimit;
  start?: string;
  /** Payment gateways; the fake provider by default. */
  gateways?: Partial<Record<PaymentProvider, PaymentGateway>>;
  regionProviders?: Record<string, RealProvider>;
  catalog?: Catalog;
}

/** The seed catalog with the India region switched to another provider (an "international" region). */
export function catalogWithProvider(provider: RealProvider): Catalog {
  return { ...catalog, regions: catalog.regions.map((r) => ({ ...r, paymentProvider: provider })) };
}

export function setup(options: SetupOptions = {}) {
  const clock = { now: new Date(options.start ?? '2026-10-06T10:00:00.000Z') };
  const addresses: Record<string, StoredAddress[]> = {
    [ASHA]: [home('asha-home'), home('asha-far', 'mum-bandra-west')],
    [RAVI]: [home('ravi-home')],
  };
  const store = new InMemoryOrderStore({
    catalog: options.catalog ?? catalog,
    getAddress: (uid, id) => addresses[uid]?.find((a) => a.id === id) ?? null,
  });
  const gateway = new FakeGateway(SECRET);
  const now = () => clock.now;
  const service = new OrderService({
    store,
    gateways: options.gateways ?? { fake: gateway },
    regionProviders: options.regionProviders,
    now,
    rateLimit: options.rateLimit,
  });
  const advance = (seconds: number) => {
    clock.now = new Date(clock.now.getTime() + seconds * 1000);
  };
  let keys = 0;
  const cart = (overrides: Record<string, unknown> = {}) => ({
    restaurantId: restaurant.id,
    items: [
      { itemId: butterChicken.id, qty: 2 },
      { itemId: garlicNaan.id, qty: 1 },
    ],
    addressId: 'asha-home',
    idempotencyKey: `checkout-${++keys}-abcdef`,
    ...overrides,
  });
  return { store, gateway, service, clock, now, advance, cart };
}

/** Places an order and returns it (throws if the service refused). */
export async function placed(ctx: ReturnType<typeof setup>, overrides = {}, userId = ASHA) {
  const result = await ctx.service.placeOrder(userId, ctx.cart(overrides));
  if (!result.ok) throw new Error(result.error);
  return { result, order: (await ctx.store.getOrder(result.orderId))! };
}
