import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import type { CommerceApp, OrderStreamEvent } from '@pro/api/types';

import type { Deps } from '../deps';
import { currentUser, requireAuth, type AppEnv } from '../lib/auth';
import { badRequest } from '../lib/errors';
import { validate } from '../lib/validate';
import * as cart from '../services/cart';
import * as orders from '../services/orders';
import { orderTopic } from '../sim/simulator';
import { commerceApp } from './common';

function appParam(value: string): CommerceApp {
  const parsed = commerceApp.safeParse(value);
  if (!parsed.success) throw badRequest(`Unknown app "${value}"`);
  return parsed.data;
}

export function cartRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  const { db } = deps;
  app.use('*', requireAuth(deps.config.jwtSecret));

  app.get('/:app', (c) => c.json(cart.getCart(db, currentUser(c), appParam(c.req.param('app')), deps.clock())));
  app.put(
    '/:app/items',
    validate(
      'json',
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(0).max(50),
        options: z.array(z.object({ groupId: z.string(), optionId: z.string() })).optional(),
        variant: z.object({ color: z.string().optional(), size: z.string().optional(), storage: z.string().optional() }).optional(),
        replaceCart: z.boolean().optional(),
      }),
    ),
    (c) => c.json(cart.setItem(db, currentUser(c), appParam(c.req.param('app')), c.req.valid('json'), deps.clock())),
  );
  app.patch(
    '/:app/lines/:lineId',
    validate('json', z.object({ quantity: z.number().int().min(0).max(50).optional(), savedForLater: z.boolean().optional() })),
    (c) =>
      c.json(cart.updateLine(db, currentUser(c), appParam(c.req.param('app')), c.req.param('lineId'), c.req.valid('json'), deps.clock())),
  );
  app.delete('/:app/lines/:lineId', (c) =>
    c.json(cart.removeLine(db, currentUser(c), appParam(c.req.param('app')), c.req.param('lineId'), deps.clock())),
  );
  app.delete('/:app', (c) => c.json(cart.clearCart(db, currentUser(c), appParam(c.req.param('app')), deps.clock())));
  app.post('/:app/coupon', validate('json', z.object({ code: z.string().trim().min(1).max(30) })), (c) =>
    c.json(cart.applyCoupon(db, currentUser(c), appParam(c.req.param('app')), c.req.valid('json').code, deps.clock())),
  );
  app.delete('/:app/coupon', (c) => c.json(cart.removeCoupon(db, currentUser(c), appParam(c.req.param('app')), deps.clock())));
  app.put('/:app/tip', validate('json', z.object({ amount: z.number().min(0).max(500) })), (c) =>
    c.json(cart.setTip(db, currentUser(c), appParam(c.req.param('app')), c.req.valid('json').amount, deps.clock())),
  );
  app.put('/:app/address', validate('json', z.object({ addressId: z.string().min(1) })), (c) =>
    c.json(cart.setCartAddress(db, currentUser(c), appParam(c.req.param('app')), c.req.valid('json').addressId, deps.clock())),
  );
  return app;
}

export function orderRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  app.use('*', requireAuth(deps.config.jwtSecret));

  app.post(
    '/',
    validate(
      'json',
      z.object({
        app: commerceApp,
        addressId: z.string().min(1),
        payment: z.object({
          kind: z.enum(['upi', 'card', 'cash', 'wallet']),
          upiId: z.string().max(60).optional(),
          cardLast4: z.string().regex(/^\d{4}$/).optional(),
        }),
        instructions: z.string().max(300).optional(),
      }),
    ),
    (c) => c.json(orders.placeOrder(deps, currentUser(c), c.req.valid('json')), 201),
  );
  app.get('/', validate('query', z.object({ app: commerceApp.optional() })), (c) =>
    c.json(orders.listOrders(deps, currentUser(c), c.req.valid('query').app)),
  );
  app.get('/:id', (c) => c.json(orders.getOrder(deps, currentUser(c), c.req.param('id'))));
  app.post('/:id/cancel', (c) => c.json(orders.cancelOrder(deps, currentUser(c), c.req.param('id'))));
  app.post(
    '/:id/rating',
    validate(
      'json',
      z.object({ stars: z.number().int().min(1).max(5), comment: z.string().max(500).optional(), tags: z.array(z.string().max(40)).max(10).optional() }),
    ),
    (c) => c.json(orders.rateOrder(deps, currentUser(c), c.req.param('id'), c.req.valid('json'))),
  );
  app.post(
    '/:id/returns',
    validate('json', z.object({ lineIds: z.array(z.string()).min(1), reason: z.string().trim().min(3).max(120), comment: z.string().max(500).optional() })),
    (c) => c.json(orders.requestReturn(deps, currentUser(c), c.req.param('id'), c.req.valid('json')), 201),
  );

  /**
   * Live order status as Server-Sent Events. Sends a `snapshot` first, then
   * `status` and `location` events, and closes after delivery or cancellation.
   * Auth: Bearer header or ?token= (EventSource cannot set headers).
   */
  app.get('/:id/events', (c) => {
    const userId = currentUser(c);
    const first = orders.getOrder(deps, userId, c.req.param('id'));
    return streamSSE(c, async (stream) => {
      let closed = false;
      let seq = 0;
      let done: () => void = () => undefined;
      const finished = new Promise<void>((resolve) => (done = resolve));
      const isFinal = (e: OrderStreamEvent) => e.type !== 'location' && (e.order.status === 'delivered' || e.order.status === 'cancelled');
      // Writes are chained so events go out in order, and the stream closes
      // only after the final status has been written.
      let queue = Promise.resolve();
      const send = (event: OrderStreamEvent) => {
        queue = queue.then(async () => {
          if (closed) return;
          await stream.writeSSE({ event: event.type, data: JSON.stringify(event), id: String(++seq) });
          if (isFinal(event)) done();
        });
        return queue;
      };
      // Subscribe before the snapshot so no change in between is missed.
      const topic = orderTopic(first.id);
      const listener = (event: OrderStreamEvent) => void send(event);
      deps.bus.on(topic, listener);
      stream.onAbort(() => {
        closed = true;
        done();
      });
      void send({ type: 'snapshot', order: first });
      // Comments keep proxies from closing an idle stream.
      const ping = setInterval(() => void stream.write(': ping\n\n'), 15_000);
      await finished;
      clearInterval(ping);
      deps.bus.off(topic, listener);
      await queue;
      closed = true;
    });
  });
  return app;
}
