/**
 * An OrderStore kept in memory. Used by the server tests and by the web
 * app's in-memory backend, so both run the exact same order workflow as
 * Cloud Functions.
 *
 * Transactions run one at a time; writes are buffered and applied together
 * at the end, and the unique keys (order id, webhook event id) are enforced.
 */
import type {
  Area,
  Coupon,
  MenuItem,
  Order,
  OrderStatus,
  Region,
  Restaurant,
} from '@quickbite/core';
import { randomId } from './crypto';
import type {
  CouponRedemption,
  OrderStore,
  PaymentRecord,
  StoredAddress,
  StoreTx,
  WebhookEventRecord,
} from './store';

export interface MemoryStoreState {
  orders: Record<string, Order>;
  /** `${userId}:${idempotencyKey}` → order id */
  idempotencyKeys: Record<string, string>;
  payments: PaymentRecord[];
  /** `${provider}:${eventId}` → event */
  webhookEvents: Record<string, WebhookEventRecord>;
  redemptions: CouponRedemption[];
}

export interface MemoryCatalog {
  restaurants: readonly Restaurant[];
  items: readonly MenuItem[];
  regions: readonly Region[];
  areas: readonly Area[];
  coupons: readonly Coupon[];
}

export interface InMemoryOrderStoreOptions {
  catalog: MemoryCatalog;
  getAddress: (userId: string, addressId: string) => StoredAddress | null;
  state?: MemoryStoreState;
  /** Called after every committed transaction (persistence, realtime listeners). */
  onChange?: (state: MemoryStoreState) => void;
}

export const emptyMemoryState = (): MemoryStoreState => ({
  orders: {},
  idempotencyKeys: {},
  payments: [],
  webhookEvents: {},
  redemptions: [],
});

const clone = <T>(value: T): T => structuredClone(value);

export class InMemoryOrderStore implements OrderStore {
  private state: MemoryStoreState;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly listeners = new Set<(state: MemoryStoreState) => void>();
  private readonly restaurants: Map<string, Restaurant>;
  private readonly items: Map<string, MenuItem>;
  private readonly regions: Map<string, Region>;
  private readonly areas: Map<string, Area>;
  private readonly coupons: Map<string, Coupon>;

  constructor(private readonly options: InMemoryOrderStoreOptions) {
    const c = options.catalog;
    this.restaurants = new Map(c.restaurants.map((r) => [r.id, r]));
    this.items = new Map(c.items.map((i) => [i.id, i]));
    this.regions = new Map(c.regions.map((r) => [r.id, r]));
    this.areas = new Map(c.areas.map((a) => [a.id, a]));
    this.coupons = new Map(c.coupons.map((x) => [x.code, x]));
    this.state = clone(options.state ?? emptyMemoryState());
  }

  /** A copy of everything stored (tests inspect payments and events through this). */
  snapshot(): MemoryStoreState {
    return clone(this.state);
  }

  subscribe(listener: (state: MemoryStoreState) => void): () => void {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  listOrdersForUser(userId: string): Order[] {
    return Object.values(this.state.orders)
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  // ---- CatalogReader --------------------------------------------------------
  async getRestaurant(id: string) {
    return clone(this.restaurants.get(id) ?? null);
  }
  async getMenuItems(restaurantId: string, itemIds: string[]) {
    return itemIds
      .map((id) => this.items.get(id))
      .filter((i): i is MenuItem => Boolean(i && i.restaurantId === restaurantId))
      .map(clone);
  }
  async getRegion(id: string) {
    return clone(this.regions.get(id) ?? null);
  }
  async getArea(id: string) {
    return clone(this.areas.get(id) ?? null);
  }
  async getCoupon(code: string) {
    return clone(this.coupons.get(code) ?? null);
  }

  // ---- OrderStore -----------------------------------------------------------
  async getAddress(userId: string, addressId: string) {
    return clone(this.options.getAddress(userId, addressId));
  }
  async countCouponRedemptions(userId: string, code: string) {
    return this.state.redemptions.filter((r) => r.userId === userId && r.couponCode === code)
      .length;
  }
  async getOrder(id: string) {
    return clone(this.state.orders[id] ?? null);
  }
  async findOrderIdByProviderOrderId(provider: Order['paymentProvider'], providerOrderId: string) {
    return (
      Object.values(this.state.orders).find(
        (o) => o.paymentProvider === provider && o.providerOrderId === providerOrderId,
      )?.id ?? null
    );
  }
  async listOrdersByStatus(statuses: readonly OrderStatus[], changedBefore: string, limit: number) {
    return Object.values(this.state.orders)
      .filter((o) => statuses.includes(o.status) && o.statusUpdatedAt <= changedBefore)
      .sort((a, b) => a.statusUpdatedAt.localeCompare(b.statusUpdatedAt))
      .slice(0, limit)
      .map(clone);
  }
  newOrderId() {
    return `ord_${randomId()}`;
  }

  transaction<T>(work: (tx: StoreTx) => Promise<T>): Promise<T> {
    const run = this.queue.then(() => this.runTransaction(work));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async runTransaction<T>(work: (tx: StoreTx) => Promise<T>): Promise<T> {
    const state = this.state;
    const writes: ((draft: MemoryStoreState) => void)[] = [];
    const tx: StoreTx = {
      getOrder: async (id) => clone(state.orders[id] ?? null),
      findOrderIdByIdempotencyKey: async (userId, key) =>
        state.idempotencyKeys[`${userId}:${key}`] ?? null,
      countOrdersSince: async (userId, since) =>
        Object.values(state.orders).filter((o) => o.userId === userId && o.createdAt >= since)
          .length,
      hasWebhookEvent: async (provider, eventId) => `${provider}:${eventId}` in state.webhookEvents,
      countCouponRedemptions: (userId, code) => this.countCouponRedemptions(userId, code),

      createOrder: (order) =>
        writes.push((d) => {
          if (d.orders[order.id]) throw new Error(`Order ${order.id} already exists`);
          d.orders[order.id] = clone(order);
          d.idempotencyKeys[`${order.userId}:${order.idempotencyKey}`] = order.id;
        }),
      updateOrder: (id, patch) =>
        writes.push((d) => {
          const current = d.orders[id];
          if (!current) throw new Error(`Order ${id} not found`);
          d.orders[id] = { ...current, ...clone(patch) };
        }),
      createPayment: (payment) => writes.push((d) => void d.payments.push(clone(payment))),
      recordWebhookEvent: (event) =>
        writes.push((d) => {
          const key = `${event.provider}:${event.eventId}`;
          if (d.webhookEvents[key]) throw new Error(`Webhook event ${key} already recorded`);
          d.webhookEvents[key] = clone(event);
        }),
      createCouponRedemption: (redemption) =>
        writes.push((d) => void d.redemptions.push(clone(redemption))),
    };

    const result = await work(tx);
    if (writes.length > 0) {
      const draft = clone(this.state);
      for (const write of writes) write(draft);
      this.state = draft;
      const snapshot = this.snapshot();
      this.options.onChange?.(snapshot);
      for (const listener of this.listeners) listener(snapshot);
    }
    return result;
  }
}
