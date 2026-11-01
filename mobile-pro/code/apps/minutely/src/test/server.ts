import type { Cart, CartLine, Order, SetCartItemInput } from '@pro/api';

import { fakeClient, type Route } from './render';
import { apple, banana, cart, categories, home, homeFeed, line, mango, order } from './fixtures';

const CATALOG = [apple, banana, mango];

/**
 * A small stateful Minutely backend for screen tests: home feed, catalog,
 * a cart that recalculates its bill, and order placement. `extra` answers
 * first, for test-specific routes.
 */
export function minutelyServer(initial: CartLine[] = [], extra?: Route) {
  let current: Cart = cart(initial);
  let placed: Order | null = null;
  const result = fakeClient((method, path, body) => {
    const own = extra?.(method, path, body);
    if (own) return own;
    if (path === '/minutely/home') return { body: homeFeed };
    if (path === '/minutely/categories') return { body: categories };
    if (path.startsWith('/minutely/products/')) {
      const item = CATALOG.find((g) => path.endsWith(g.id));
      return item ? { body: { ...item, description: 'Crisp and sweet.', highlights: [{ label: 'Origin', value: 'Hill farms' }], similar: [banana] } } : undefined;
    }
    if (path.startsWith('/minutely/products')) {
      const q = new URLSearchParams(path.split('?')[1] ?? '');
      let items = CATALOG.filter((g) => !q.get('category') || g.categoryId === q.get('category'));
      if (q.get('subcategory')) items = items.filter((g) => g.subcategory === q.get('subcategory'));
      if (q.get('q')) items = items.filter((g) => g.name.toLowerCase().includes(q.get('q')!.toLowerCase()));
      if (q.get('sort') === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
      return { body: items };
    }
    if (path === '/cart/minutely' && method === 'GET') return { body: current };
    if (path === '/cart/minutely/items' && method === 'PUT') {
      const input = body as SetCartItemInput;
      const item = CATALOG.find((g) => g.id === input.productId)!;
      const others = current.items.filter((l) => l.productId !== input.productId);
      current = cart(input.quantity > 0 ? [...others, line(item, input.quantity)] : others);
      return { body: current };
    }
    if (path === '/cart/minutely/tip') {
      const amount = (body as { amount: number }).amount;
      current = { ...current, tip: amount, bill: { ...current.bill, tip: amount, total: current.bill.total + amount } };
      return { body: current };
    }
    if (path === '/me/addresses') return { body: [home] };
    if (path === '/coupons?app=minutely') return { body: [] };
    if (path === '/orders' && method === 'POST') {
      placed = order('confirmed', { id: 'ord_new' });
      current = cart();
      return { status: 201, body: placed };
    }
    return undefined;
  });
  return { ...result, cart: () => current };
}
