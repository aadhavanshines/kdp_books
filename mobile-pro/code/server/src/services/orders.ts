import type {
  Address,
  ArtName,
  Bill,
  CommerceApp,
  MapPoint,
  Order,
  OrderLine,
  OrderRating,
  OrderStatus,
  OrderStep,
  OrderSummary,
  PaymentInput,
  PaymentMethod,
  PlaceOrderInput,
  RateOrderInput,
  ReturnInput,
  ReturnRequest,
  Rider,
  Tracking,
} from '@pro/api/types';

import type { Deps } from '../deps';
import type { DB } from '../db';
import { badRequest, conflict, notFound } from '../lib/errors';
import { pointAlong, streetRoute } from '../lib/geo';
import { hashString } from '../lib/rng';
import { newId, orderNumber } from '../lib/ids';
import { parseJson } from '../lib/json';
import { round2 } from '../lib/pricing';
import { DAY, iso, isoOrNull, MINUTE } from '../lib/time';
import { riders } from '../seed/common';
import { MOVING_STATUS, progressAt, scheduleFor, statusAt, stepCopy, type ScheduledStep } from '../sim/schedule';
import { getCart } from './cart';
import { nearestStore } from './minutely';
import { DEFAULT_ORIGIN, getRestaurantRow, toRestaurantSummary } from './platter';
import { getAddress } from './users';

export interface OrderRow {
  id: string;
  number: string;
  user_id: string;
  app: CommerceApp;
  status: OrderStatus;
  items_json: string;
  bill_json: string;
  coupon_code: string | null;
  address_json: string;
  payment_json: string;
  instructions: string | null;
  restaurant_id: string | null;
  origin_json: string | null;
  route_json: string | null;
  rider_json: string | null;
  schedule_json: string;
  placed_at: number;
  eta_at: number;
  delivered_at: number | null;
  cancelled_at: number | null;
  rating_json: string | null;
}

interface Origin {
  label: string;
  point: MapPoint;
  art: ArtName;
}

const TERMINAL: ReadonlySet<OrderStatus> = new Set(['delivered', 'cancelled']);
/** The rider card appears from this status on. */
const RIDER_FROM: Record<CommerceApp, OrderStatus> = { platter: 'picked_up', minutely: 'on_the_way', cartly: 'out_for_delivery' };
const CARTLY_HUB: Origin = { label: 'Cartly hub, Garden Colony', point: { x: 100, y: 900 }, art: 'delivery-truck' };
const RETURN_WINDOW_DAYS = 10;

export function getOrderRow(db: DB, userId: string, id: string): OrderRow {
  const row = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, userId) as OrderRow | undefined;
  if (!row) throw notFound('Order');
  return row;
}

function paymentLabel(p: PaymentInput, name: string): PaymentMethod {
  switch (p.kind) {
    case 'upi':
      return { kind: 'upi', label: `UPI · ${p.upiId ?? `${name.split(' ')[0]!.toLowerCase()}@nbbank.example`}` };
    case 'card':
      return { kind: 'card', label: `Card •••• ${p.cardLast4 ?? '4242'}` };
    case 'wallet':
      return { kind: 'wallet', label: 'Northbay Wallet' };
    default:
      return { kind: 'cash', label: 'Cash on delivery' };
  }
}

/**
 * Brings an order's status up to date with the clock. Returns true if the
 * status changed. Safe to call any number of times.
 */
export function syncOrder(deps: Deps, row: OrderRow): boolean {
  if (TERMINAL.has(row.status)) return false;
  const { db, clock } = deps;
  const now = clock();
  const schedule = parseJson<ScheduledStep[]>(row.schedule_json, []);
  const next = statusAt(schedule, now - row.placed_at);
  if (next === row.status) return false;
  db.transaction(() => {
    for (const step of schedule) {
      if (step.offsetMs <= now - row.placed_at) {
        db.prepare('INSERT OR IGNORE INTO order_events (order_id, status, at) VALUES (?, ?, ?)').run(row.id, step.status, row.placed_at + step.offsetMs);
      }
    }
    const deliveredAt = next === 'delivered' ? row.placed_at + schedule.find((s) => s.status === 'delivered')!.offsetMs : null;
    db.prepare('UPDATE orders SET status = ?, delivered_at = ? WHERE id = ?').run(next, deliveredAt, row.id);
    if (next === 'delivered') {
      const items = parseJson<OrderLine[]>(row.items_json, []);
      db.prepare(
        `INSERT INTO notifications (id, user_id, app, kind, title, body, art, link, created_at, read)
         VALUES (?, ?, ?, 'order', 'Order delivered', ?, ?, ?, ?, 0)`,
      ).run(newId('nt'), row.user_id, row.app, `Order ${row.number} was delivered. Enjoy!`, items[0]?.art ?? 'package', `/orders/${row.id}`, deliveredAt);
    }
  })();
  row.status = next;
  if (next === 'delivered') row.delivered_at = row.placed_at + schedule.find((s) => s.status === 'delivered')!.offsetMs;
  return true;
}

export function buildOrder(deps: Deps, row: OrderRow): Order {
  const { db, clock } = deps;
  const now = clock();
  const app = row.app;
  const schedule = parseJson<ScheduledStep[]>(row.schedule_json, []);
  const events = new Map(
    (db.prepare('SELECT status, at FROM order_events WHERE order_id = ?').all(row.id) as { status: OrderStatus; at: number }[]).map((e) => [
      e.status,
      e.at,
    ]),
  );
  const steps: OrderStep[] = schedule
    .filter((s) => row.status !== 'cancelled' || events.has(s.status))
    .map((s) => {
      const at = events.get(s.status) ?? null;
      const copy = stepCopy(app, s.status);
      return { status: s.status, label: copy.label, description: copy.description, at: isoOrNull(at), done: at != null };
    });
  if (row.status === 'cancelled') {
    const copy = stepCopy(app, 'cancelled');
    steps.push({ status: 'cancelled', label: copy.label, description: copy.description, at: isoOrNull(row.cancelled_at), done: true });
  }

  const elapsed = now - row.placed_at;
  const route = parseJson<MapPoint[] | null>(row.route_json, null);
  const origin = parseJson<Origin | null>(row.origin_json, null);
  const address = parseJson<Address>(row.address_json, {} as Address);
  let tracking: Tracking | null = null;
  if (route && origin) {
    const progress = row.status === 'cancelled' ? null : row.status === 'delivered' ? 1 : progressAt(app, schedule, elapsed);
    const atPickup = row.status === RIDER_FROM[app];
    tracking = {
      route,
      origin,
      destination: { label: address.label, point: address.location },
      progress,
      riderPosition: progress != null ? pointAlong(route, progress) : atPickup ? origin.point : null,
    };
  }
  const order = schedule.map((s) => s.status);
  const reached = (s: OrderStatus) => row.status !== 'cancelled' && order.indexOf(row.status) >= order.indexOf(s);
  const rating = parseJson<OrderRating | null>(row.rating_json, null);
  const returns = (db.prepare('SELECT * FROM returns WHERE order_id = ? ORDER BY created_at').all(row.id) as {
    id: string;
    line_ids_json: string;
    reason: string;
    comment: string | null;
    status: ReturnRequest['status'];
    refund_amount: number;
    pickup_date: number;
    created_at: number;
  }[]).map(
    (r): ReturnRequest => ({
      id: r.id,
      lineIds: parseJson<string[]>(r.line_ids_json, []),
      reason: r.reason,
      comment: r.comment,
      status: r.status,
      refundAmount: r.refund_amount,
      pickupDate: iso(r.pickup_date),
      createdAt: iso(r.created_at),
    }),
  );
  const items = parseJson<OrderLine[]>(row.items_json, []);
  const returned = new Set(returns.flatMap((r) => r.lineIds));
  const cancellable: OrderStatus[] = app === 'cartly' ? ['confirmed', 'packed'] : ['confirmed'];

  return {
    id: row.id,
    number: row.number,
    app,
    status: row.status,
    statusLabel: stepCopy(app, row.status).label,
    items,
    bill: parseJson<Bill>(row.bill_json, {} as Bill),
    coupon: row.coupon_code,
    address,
    payment: parseJson<PaymentMethod>(row.payment_json, { kind: 'cash', label: 'Cash on delivery' }),
    instructions: row.instructions,
    timeline: steps,
    tracking,
    rider: reached(RIDER_FROM[app]) ? parseJson<Rider | null>(row.rider_json, null) : null,
    restaurant: row.restaurant_id ? toRestaurantSummary(getRestaurantRow(db, row.restaurant_id), address.location ?? DEFAULT_ORIGIN) : null,
    placedAt: iso(row.placed_at),
    etaAt: iso(row.eta_at),
    etaMinutes: TERMINAL.has(row.status) ? 0 : Math.max(1, Math.ceil((row.eta_at - now) / MINUTE)),
    deliveredAt: isoOrNull(row.delivered_at),
    cancelledAt: isoOrNull(row.cancelled_at),
    rating,
    returns,
    canCancel: cancellable.includes(row.status),
    canRate: row.status === 'delivered' && rating == null,
    canReturn:
      app === 'cartly' &&
      row.status === 'delivered' &&
      row.delivered_at != null &&
      now - row.delivered_at < RETURN_WINDOW_DAYS * DAY &&
      items.some((i) => !returned.has(i.id)),
  };
}

export function getOrder(deps: Deps, userId: string, id: string): Order {
  const row = getOrderRow(deps.db, userId, id);
  syncOrder(deps, row);
  return buildOrder(deps, row);
}

export function listOrders(deps: Deps, userId: string, app: CommerceApp | undefined): OrderSummary[] {
  const rows = (
    app
      ? deps.db.prepare('SELECT * FROM orders WHERE user_id = ? AND app = ? ORDER BY placed_at DESC').all(userId, app)
      : deps.db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY placed_at DESC').all(userId)
  ) as OrderRow[];
  return rows.map((row) => {
    syncOrder(deps, row);
    const items = parseJson<OrderLine[]>(row.items_json, []);
    const origin = parseJson<Origin | null>(row.origin_json, null);
    const restaurant = row.restaurant_id ? getRestaurantRow(deps.db, row.restaurant_id) : null;
    return {
      id: row.id,
      number: row.number,
      app: row.app,
      status: row.status,
      statusLabel: stepCopy(row.app, row.status).label,
      title: restaurant?.name ?? (items.length > 1 ? `${items[0]!.name} and ${items.length - 1} more` : (items[0]?.name ?? 'Order')),
      art: (restaurant?.art as ArtName | undefined) ?? items[0]?.art ?? origin?.art ?? 'package',
      itemsPreview: items.map((i) => `${i.quantity} x ${i.name}`).join(', '),
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      total: parseJson<Bill>(row.bill_json, {} as Bill).total,
      placedAt: iso(row.placed_at),
      deliveredAt: isoOrNull(row.delivered_at),
      rating: parseJson<OrderRating | null>(row.rating_json, null)?.stars ?? null,
    };
  });
}

export function placeOrder(deps: Deps, userId: string, input: PlaceOrderInput): Order {
  const { db, clock, config } = deps;
  const now = clock();
  const cart = getCart(db, userId, input.app, now);
  const active = cart.items.filter((l) => l.inStock);
  if (active.length === 0) throw badRequest('Your cart is empty');
  const address = getAddress(db, userId, input.addressId);
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string };

  let origin: Origin;
  if (input.app === 'platter') {
    if (!cart.restaurant) throw conflict('CART_INVALID', 'Your cart has no restaurant');
    const r = getRestaurantRow(db, cart.restaurant.id);
    origin = { label: r.name, point: { x: r.x, y: r.y }, art: r.art as ArtName };
  } else if (input.app === 'minutely') {
    const { store } = nearestStore(db, address.location);
    origin = { label: store.name, point: { x: store.x, y: store.y }, art: 'shopping-trolley' };
  } else {
    origin = CARTLY_HUB;
  }
  const schedule = scheduleFor(input.app, config.simSpeed);
  const deliveredOffset = schedule.find((s) => s.status === 'delivered')!.offsetMs;
  const id = newId('ord');
  const items: OrderLine[] = active.map((l, i) => ({
    id: `l${i + 1}`,
    productId: l.productId,
    name: l.name,
    art: l.art,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
    optionsLabel: l.optionsLabel,
    isVeg: l.isVeg,
  }));
  const couponUsed = cart.coupon && (cart.bill.couponDiscount > 0 || cart.bill.deliveryFeeWaived > 0) ? cart.coupon.code : null;
  const rider = riders[hashString(id) % riders.length]!;

  db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, number, user_id, app, status, items_json, bill_json, coupon_code, address_json, payment_json,
         instructions, restaurant_id, origin_json, route_json, rider_json, schedule_json, placed_at, eta_at, delivered_at,
         cancelled_at, rating_json)
       VALUES (@id, @number, @userId, @app, 'confirmed', @items, @bill, @coupon, @address, @payment, @instructions,
         @restaurantId, @origin, @route, @rider, @schedule, @now, @etaAt, NULL, NULL, NULL)`,
    ).run({
      id,
      number: orderNumber(input.app),
      userId,
      app: input.app,
      items: JSON.stringify(items),
      bill: JSON.stringify(cart.bill),
      coupon: couponUsed,
      address: JSON.stringify(address),
      payment: JSON.stringify(paymentLabel(input.payment, user.name)),
      instructions: input.instructions?.trim() || null,
      restaurantId: cart.restaurant?.id ?? null,
      origin: JSON.stringify(origin),
      route: JSON.stringify(streetRoute(origin.point, address.location)),
      rider: JSON.stringify(rider),
      schedule: JSON.stringify(schedule),
      now,
      etaAt: now + deliveredOffset,
    });
    db.prepare("INSERT INTO order_events (order_id, status, at) VALUES (?, 'confirmed', ?)").run(id, now);
    db.prepare('DELETE FROM cart_lines WHERE user_id = ? AND app = ? AND saved_for_later = 0').run(userId, input.app);
    db.prepare('UPDATE carts SET coupon_code = NULL, tip = 0, restaurant_id = NULL, updated_at = ? WHERE user_id = ? AND app = ?').run(
      now,
      userId,
      input.app,
    );
  })();
  const order = getOrder(deps, userId, id);
  deps.bus.emit(`order:${id}`, { type: 'status', order });
  return order;
}

export function cancelOrder(deps: Deps, userId: string, id: string): Order {
  const before = getOrder(deps, userId, id);
  if (!before.canCancel) throw conflict('CANNOT_CANCEL', 'This order can no longer be cancelled');
  const now = deps.clock();
  deps.db.transaction(() => {
    deps.db.prepare("UPDATE orders SET status = 'cancelled', cancelled_at = ? WHERE id = ?").run(now, id);
    deps.db.prepare("INSERT OR IGNORE INTO order_events (order_id, status, at) VALUES (?, 'cancelled', ?)").run(id, now);
  })();
  const order = getOrder(deps, userId, id);
  deps.bus.emit(`order:${id}`, { type: 'status', order });
  return order;
}

export function rateOrder(deps: Deps, userId: string, id: string, input: RateOrderInput): Order {
  const order = getOrder(deps, userId, id);
  if (order.status !== 'delivered') throw conflict('NOT_DELIVERED', 'You can rate an order after it is delivered');
  if (order.rating) throw conflict('ALREADY_RATED', 'You have already rated this order');
  const rating: OrderRating = {
    stars: input.stars,
    comment: input.comment?.trim() || null,
    tags: input.tags ?? [],
    createdAt: iso(deps.clock()),
  };
  deps.db.prepare('UPDATE orders SET rating_json = ? WHERE id = ?').run(JSON.stringify(rating), id);
  return getOrder(deps, userId, id);
}

export function requestReturn(deps: Deps, userId: string, id: string, input: ReturnInput): Order {
  const order = getOrder(deps, userId, id);
  if (!order.canReturn) throw conflict('CANNOT_RETURN', 'This order is not eligible for a return');
  const already = new Set(order.returns.flatMap((r) => r.lineIds));
  const lines = input.lineIds.map((lineId) => {
    const line = order.items.find((i) => i.id === lineId);
    if (!line) throw badRequest(`Unknown item ${lineId}`);
    if (already.has(lineId)) throw conflict('ALREADY_RETURNED', `${line.name} already has a return request`);
    return line;
  });
  const now = deps.clock();
  deps.db
    .prepare(
      `INSERT INTO returns (id, order_id, line_ids_json, reason, comment, status, refund_amount, pickup_date, created_at)
       VALUES (?, ?, ?, ?, ?, 'pickup_scheduled', ?, ?, ?)`,
    )
    .run(newId('ret'), id, JSON.stringify(input.lineIds), input.reason, input.comment?.trim() || null, round2(lines.reduce((s, l) => s + l.lineTotal, 0)), now + DAY, now);
  return getOrder(deps, userId, id);
}

export { MOVING_STATUS };
