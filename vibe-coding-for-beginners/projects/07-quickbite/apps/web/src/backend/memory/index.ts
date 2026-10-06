/**
 * In-memory backend built from the seed catalog. It is used for local
 * development before a real backend exists and for component tests.
 *
 * It deliberately behaves like a server: `orders.quote` looks prices up in its
 * own data and ignores anything else, exactly like the real Cloud Function will.
 */
import {
  distanceKm,
  normalizeCouponCode,
  priceOrder,
  searchCatalog,
  type Coupon,
  type Menu,
  type MenuItem,
  type Restaurant,
} from '@quickbite/core';
import { buildCatalog, type Catalog } from '@quickbite/seed';
import type { Address, Backend, Quote, QuoteRequest } from '../types';

export interface MemoryBackendOptions {
  /** Simulated network delay in ms (keeps loading states honest in dev). */
  latencyMs?: number;
  /** Where addresses are kept. Defaults to localStorage when available. */
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
  now?: () => Date;
  catalog?: Catalog;
}

const ADDRESS_KEY = 'quickbite.memory.addresses';

export function createMemoryBackend(options: MemoryBackendOptions = {}): Backend {
  const catalog = options.catalog ?? buildCatalog();
  const latency = options.latencyMs ?? (import.meta.env.MODE === 'test' ? 0 : 250);
  const storage = options.storage === undefined ? safeLocalStorage() : options.storage;
  const now = options.now ?? (() => new Date());

  const restaurantsById = new Map(catalog.restaurants.map((r) => [r.id, r]));
  const itemsById = new Map(catalog.items.map((i) => [i.id, i]));
  const areasById = new Map(catalog.areas.map((a) => [a.id, a]));
  const couponsByCode = new Map(catalog.coupons.map((c) => [c.code, c]));
  const regionsById = new Map(catalog.regions.map((r) => [r.id, r]));

  const wait = <T>(value: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), latency));

  let memoryAddresses: Address[] = [];
  const readAddresses = (): Address[] => {
    if (!storage) return memoryAddresses;
    try {
      return JSON.parse(storage.getItem(ADDRESS_KEY) ?? '[]') as Address[];
    } catch {
      return [];
    }
  };
  const writeAddresses = (list: Address[]) => {
    memoryAddresses = list;
    try {
      storage?.setItem(ADDRESS_KEY, JSON.stringify(list));
    } catch {
      // Storage full or blocked: keep the in-memory copy.
    }
  };

  const restaurantsInArea = (areaId: string) =>
    catalog.restaurants.filter((r) => r.areaIds.includes(areaId));

  return {
    name: 'memory',
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
      list: () => wait(readAddresses()),
      save: (input) => {
        const area = areasById.get(input.areaId);
        if (!area) return Promise.reject(new Error('Unknown area'));
        const list = readAddresses();
        const existing = input.id ? list.find((a) => a.id === input.id) : undefined;
        const address: Address = {
          ...input,
          id:
            existing?.id ??
            `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          // Without a map pin we place the address near the area's centre.
          lat: existing?.areaId === input.areaId ? existing.lat : area.lat + 0.002,
          lng: existing?.areaId === input.areaId ? existing.lng : area.lng + 0.002,
        };
        writeAddresses(
          existing ? list.map((a) => (a.id === address.id ? address : a)) : [address, ...list],
        );
        return wait(address);
      },
      remove: (id) => {
        writeAddresses(readAddresses().filter((a) => a.id !== id));
        return wait(undefined);
      },
    },

    orders: {
      quote: (request) => wait(quote(request)),
    },
  };

  function quote(request: QuoteRequest): Quote {
    const restaurant: Restaurant | undefined = restaurantsById.get(request.restaurantId);
    if (!restaurant) return { ok: false, error: 'RESTAURANT_NOT_FOUND' };
    if (!restaurant.isOpen) return { ok: false, error: 'RESTAURANT_CLOSED' };
    const address = readAddresses().find((a) => a.id === request.addressId);
    if (!address) return { ok: false, error: 'ADDRESS_NOT_FOUND' };
    const region = regionsById.get(restaurant.regionId)!;

    const unavailableItemIds: string[] = [];
    const lines: { item: MenuItem; qty: number }[] = [];
    for (const { itemId, qty } of request.items) {
      const item = itemsById.get(itemId);
      if (!item || item.restaurantId !== restaurant.id || !item.isAvailable) {
        unavailableItemIds.push(itemId);
        continue;
      }
      lines.push({ item, qty });
    }

    const code = request.couponCode ? normalizeCouponCode(request.couponCode) : undefined;
    const coupon: Coupon | undefined = code ? couponsByCode.get(code) : undefined;
    const distance = distanceKm(restaurant, address);
    const priced = priceOrder({
      lines: lines.map(({ item, qty }) => ({ itemId: item.id, unitPrice: item.price, qty })),
      region,
      brandId: restaurant.brandId,
      distanceKm: distance,
      coupon,
      now: now(),
    });
    if (!priced.ok) return { ok: false, error: priced.error };

    return {
      ok: true,
      bill: priced.bill,
      lines: lines.map(({ item, qty }) => ({
        itemId: item.id,
        name: item.name,
        isVeg: item.isVeg,
        unitPrice: item.price,
        qty,
        lineTotal: item.price * qty,
      })),
      unavailableItemIds,
      couponNotFound: Boolean(code && !coupon),
      distanceKm: Math.round(distance * 10) / 10,
    };
  }
}

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
