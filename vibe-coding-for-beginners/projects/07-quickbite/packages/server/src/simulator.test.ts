import { describe, expect, it } from 'vitest';
import { fakePay } from './orderService';
import { advanceDemoOrders, expireUnpaidOrders } from './simulator';
import { ASHA, placed, setup } from './testSetup';

describe('demo simulator', () => {
  it('moves paid orders one step per interval until delivered', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    const unpaid = (await placed(ctx)).order;
    await fakePay({
      ...ctx,
      userId: ASHA,
      input: { orderId: order.id, outcome: 'success' },
      deliver: (b, h) => ctx.service.handleWebhook('fake', b, h),
    });

    // Not yet: the order only just became "placed".
    expect(await advanceDemoOrders(ctx.store, { now: ctx.now(), stepSeconds: 5 })).toBe(0);
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      ctx.advance(5);
      await advanceDemoOrders(ctx.store, { now: ctx.now(), stepSeconds: 5 });
      seen.push((await ctx.store.getOrder(order.id))!.status);
    }
    expect(seen).toEqual([
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
      'delivered',
      'delivered',
    ]);
    const history = (await ctx.store.getOrder(order.id))!.statusHistory.map((s) => s.status);
    expect(history).toEqual([
      'pending_payment',
      'placed',
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
    ]);
    // Unpaid orders are never advanced.
    expect((await ctx.store.getOrder(unpaid.id))!.status).toBe('pending_payment');
  });

  it('expires orders left unpaid for 30 minutes, and only those', async () => {
    const ctx = setup();
    const old = (await placed(ctx)).order;
    const paid = (await placed(ctx)).order;
    await fakePay({
      ...ctx,
      userId: ASHA,
      input: { orderId: paid.id, outcome: 'success' },
      deliver: (b, h) => ctx.service.handleWebhook('fake', b, h),
    });
    ctx.advance(29 * 60);
    const fresh = (await placed(ctx)).order;
    expect(await expireUnpaidOrders(ctx.store, { now: ctx.now() })).toBe(0);
    ctx.advance(2 * 60);
    expect(await expireUnpaidOrders(ctx.store, { now: ctx.now() })).toBe(1);
    expect((await ctx.store.getOrder(old.id))!.status).toBe('expired');
    expect((await ctx.store.getOrder(fresh.id))!.status).toBe('pending_payment');
    expect((await ctx.store.getOrder(paid.id))!.status).toBe('placed');
  });
});
