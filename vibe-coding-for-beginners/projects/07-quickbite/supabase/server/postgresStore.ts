/**
 * The Postgres adapter for @quickbite/server's OrderStore. Like the Firestore
 * adapter it only maps reads and writes to tables; the order and payment
 * logic lives in packages/server and is shared by every backend.
 *
 * Transactions are real SERIALIZABLE Postgres transactions. Writes are
 * buffered and run in order after the work's reads, inside the same
 * transaction, so markOrderPaid and order creation are atomic. Unique keys
 * (order id, user + idempotency key, provider + event id, one redemption per
 * order) are enforced by the schema; a transaction that loses a race is
 * retried and then sees the winner's row.
 *
 * The server connects as the table owner, which RLS doesn't restrict: these
 * are the only writes to orders, payments, webhook_events and
 * coupon_redemptions.
 */
import type { Coupon, MenuItem, Order, OrderStatus, PaymentProvider } from '@quickbite/core';
import { randomId, type OrderStore, type StoredAddress, type StoreTx } from '@quickbite/server';
import {
  areaFromRow,
  couponFromRow,
  menuItemFromRow,
  ORDER_COLUMNS,
  orderFromRow,
  orderItemsToRows,
  orderToRow,
  regionFromRow,
  restaurantFromRow,
  type AreaRow,
  type CouponRow,
  type MenuItemRow,
  type OrderItemRow,
  type OrderRow,
  type RegionRow,
  type RestaurantRow,
} from './rows';
import type { Sql } from './sql';

/** One order with its items (as a JSON array), optionally locked for the transaction. */
const ORDER_SELECT = `
  select o.*,
    coalesce(
      (select jsonb_agg(to_jsonb(i) order by i.line_no) from public.order_items i where i.order_id = o.id),
      '[]'::jsonb
    ) as items
  from public.orders o`;

type OrderRowWithItems = OrderRow & { items: OrderItemRow[] };

const toOrder = (row: OrderRowWithItems): Order => orderFromRow(row, row.items);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Column casts for order writes, so every parameter has an explicit type. */
const ORDER_CASTS: Record<keyof OrderRow, string> = {
  id: 'text',
  user_id: 'uuid',
  restaurant_id: 'text',
  restaurant: 'jsonb',
  status: 'text',
  status_history: 'jsonb',
  address: 'jsonb',
  bill: 'jsonb',
  distance_km: 'float8',
  currency: 'text',
  coupon_code: 'text',
  note: 'text',
  payment_provider: 'text',
  payment_status: 'text',
  provider_order_id: 'text',
  provider_payment_id: 'text',
  idempotency_key: 'text',
  needs_review: 'boolean',
  eta_minutes: 'jsonb',
  created_at: 'timestamptz',
  updated_at: 'timestamptz',
  status_updated_at: 'timestamptz',
};

export class PostgresOrderStore implements OrderStore {
  constructor(private readonly sql: Sql) {}

  private async one<T>(text: string, params: unknown[]): Promise<T | null> {
    return (await this.sql.query<T>(text, params))[0] ?? null;
  }

  // ---- CatalogReader --------------------------------------------------------
  async getRestaurant(id: string) {
    const row = await this.one<RestaurantRow>(
      'select * from public.restaurants where id = $1::text',
      [id],
    );
    return row && restaurantFromRow(row);
  }
  async getMenuItems(restaurantId: string, itemIds: string[]): Promise<MenuItem[]> {
    if (itemIds.length === 0) return [];
    const rows = await this.sql.query<MenuItemRow>(
      'select * from public.menu_items where restaurant_id = $1::text and id = any($2::text[])',
      [restaurantId, itemIds],
    );
    return rows.map(menuItemFromRow);
  }
  async getRegion(id: string) {
    const row = await this.one<RegionRow>('select * from public.regions where id = $1::text', [id]);
    return row && regionFromRow(row);
  }
  async getArea(id: string) {
    const row = await this.one<AreaRow>('select * from public.areas where id = $1::text', [id]);
    return row && areaFromRow(row);
  }
  async getCoupon(code: string): Promise<Coupon | null> {
    const row = await this.one<CouponRow>('select * from public.coupons where code = $1::text', [
      code,
    ]);
    return row && couponFromRow(row);
  }

  // ---- OrderStore -----------------------------------------------------------
  async getAddress(userId: string, addressId: string): Promise<StoredAddress | null> {
    if (!UUID.test(userId)) return null;
    return this.one<StoredAddress>(
      `select id, label, name, phone, line1, line2, landmark, area_id as "areaId", pincode
       from public.addresses where id = $1::text and user_id = $2::uuid`,
      [addressId, userId],
    );
  }
  countCouponRedemptions(userId: string, code: string) {
    return countRedemptions(this.sql, userId, code);
  }
  async getOrder(id: string) {
    const row = await this.one<OrderRowWithItems>(`${ORDER_SELECT} where o.id = $1::text`, [id]);
    return row && toOrder(row);
  }
  async findOrderIdByProviderOrderId(provider: PaymentProvider, providerOrderId: string) {
    const row = await this.one<{ id: string }>(
      'select id from public.orders where payment_provider = $1::text and provider_order_id = $2::text',
      [provider, providerOrderId],
    );
    return row?.id ?? null;
  }
  async listOrdersByStatus(statuses: readonly OrderStatus[], changedBefore: string, limit: number) {
    const rows = await this.sql.query<OrderRowWithItems>(
      `${ORDER_SELECT}
       where o.status = any($1::text[]) and o.status_updated_at <= $2::timestamptz
       order by o.status_updated_at
       limit $3::int`,
      [[...statuses], changedBefore, limit],
    );
    return rows.map(toOrder);
  }
  newOrderId() {
    return `ord_${randomId(16)}`;
  }

  transaction<T>(work: (tx: StoreTx) => Promise<T>): Promise<T> {
    return this.sql.transaction(async (sql) => {
      const writes: (() => Promise<unknown>)[] = [];
      const result = await work(this.wrap(sql, writes));
      for (const write of writes) await write();
      return result;
    });
  }

  private wrap(sql: Sql, writes: (() => Promise<unknown>)[]): StoreTx {
    const later = (text: string, params: unknown[]) =>
      void writes.push(() => sql.query(text, params));
    return {
      getOrder: async (id) => {
        const rows = await sql.query<OrderRowWithItems>(
          `${ORDER_SELECT} where o.id = $1::text for update of o`,
          [id],
        );
        return rows[0] ? toOrder(rows[0]) : null;
      },
      findOrderIdByIdempotencyKey: async (userId, key) => {
        if (!UUID.test(userId)) return null;
        const rows = await sql.query<{ id: string }>(
          'select id from public.orders where user_id = $1::uuid and idempotency_key = $2::text',
          [userId, key],
        );
        return rows[0]?.id ?? null;
      },
      countOrdersSince: async (userId, since) => {
        const rows = await sql.query<{ n: number }>(
          'select count(*)::int as n from public.orders where user_id = $1::uuid and created_at >= $2::timestamptz',
          [userId, since],
        );
        return rows[0]!.n;
      },
      hasWebhookEvent: async (provider, eventId) =>
        (
          await sql.query(
            'select 1 from public.webhook_events where provider = $1::text and event_id = $2::text',
            [provider, eventId],
          )
        ).length > 0,
      countCouponRedemptions: (userId, code) => countRedemptions(sql, userId, code),

      createOrder: (order) => {
        const row = orderToRow(order);
        const columns = Object.keys(row) as (keyof OrderRow)[];
        later(
          `insert into public.orders (${columns.join(', ')})
           values (${columns.map((c, i) => `$${i + 1}::${ORDER_CASTS[c]}`).join(', ')})`,
          columns.map((c) => row[c]),
        );
        const items = orderItemsToRows(order);
        if (items.length > 0) {
          later(
            `insert into public.order_items
               (order_id, line_no, menu_item_id, name, unit_price, qty, is_veg, line_total)
             select $1::text, t.ordinality - 1, t.line->>'itemId', t.line->>'name',
               (t.line->>'unitPrice')::int, (t.line->>'qty')::int, (t.line->>'isVeg')::boolean,
               (t.line->>'lineTotal')::int
             from jsonb_array_elements($2::jsonb) with ordinality as t(line, ordinality)`,
            [order.id, order.items],
          );
        }
      },
      updateOrder: (id, patch) => {
        const entries = Object.entries(patch).filter(([field]) => field !== 'items');
        if ('items' in patch) throw new Error('Order items never change after the order is placed');
        if (entries.length === 0) return;
        const params: unknown[] = [id];
        const sets = entries.map(([field, value]) => {
          const column = ORDER_COLUMNS[field as keyof typeof ORDER_COLUMNS];
          if (!column) throw new Error(`Unknown order field ${field}`);
          params.push(value);
          return `${column} = $${params.length}::${ORDER_CASTS[column]}`;
        });
        writes.push(async () => {
          const updated = await sql.query(
            `update public.orders set ${sets.join(', ')} where id = $1::text returning id`,
            params,
          );
          if (updated.length === 0) throw new Error(`Order ${id} not found`);
        });
      },
      createPayment: (p) =>
        later(
          `insert into public.payments (id, order_id, user_id, provider, provider_order_id,
             provider_payment_id, amount, currency, status, event_id, created_at)
           values ($1::text, $2::text, $3::uuid, $4::text, $5::text, $6::text, $7::int, $8::text,
             $9::text, $10::text, $11::timestamptz)`,
          [
            p.id,
            p.orderId,
            p.userId,
            p.provider,
            p.providerOrderId,
            p.providerPaymentId,
            p.amount,
            p.currency,
            p.status,
            p.eventId,
            p.createdAt,
          ],
        ),
      recordWebhookEvent: (e) =>
        later(
          `insert into public.webhook_events (provider, event_id, type, outcome, order_id, received_at)
           values ($1::text, $2::text, $3::text, $4::text, $5::text, $6::timestamptz)`,
          [e.provider, e.eventId, e.type, e.outcome, e.orderId, e.receivedAt],
        ),
      createCouponRedemption: (r) =>
        later(
          `insert into public.coupon_redemptions (order_id, user_id, coupon_code, created_at)
           values ($1::text, $2::uuid, $3::text, $4::timestamptz)`,
          [r.orderId, r.userId, r.couponCode, r.createdAt],
        ),
    };
  }
}

async function countRedemptions(sql: Sql, userId: string, code: string): Promise<number> {
  if (!UUID.test(userId)) return 0;
  const rows = await sql.query<{ n: number }>(
    'select count(*)::int as n from public.coupon_redemptions where user_id = $1::uuid and coupon_code = $2::text',
    [userId, code],
  );
  return rows[0]!.n;
}
