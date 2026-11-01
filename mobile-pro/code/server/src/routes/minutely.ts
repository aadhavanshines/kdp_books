import { Hono } from 'hono';
import { z } from 'zod';
import type { MinutelyHome, Rail } from '@pro/api/types';

import type { Deps } from '../deps';
import type { AppEnv } from '../lib/auth';
import { validate } from '../lib/validate';
import { DEFAULT_ORIGIN } from '../services/platter';
import { getGrocery, listGroceries, listGroceryCategories, nearestStore } from '../services/minutely';
import { defaultAddress } from '../services/users';
import { listBanners } from './shared';

const RAILS: { id: string; title: string; categoryId: string }[] = [
  { id: 'fresh-fruits', title: 'Fresh fruits', categoryId: 'fruits' },
  { id: 'dairy', title: 'Dairy, bread & more', categoryId: 'dairy' },
  { id: 'snacks', title: 'Snacks for movie night', categoryId: 'snacks' },
  { id: 'vegetables', title: 'Daily vegetables', categoryId: 'vegetables' },
];

export function minutelyRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  const { db } = deps;

  app.get('/home', (c) => {
    const location = defaultAddress(db, c.get('userId'))?.location ?? DEFAULT_ORIGIN;
    const { store, etaMinutes } = nearestStore(db, location);
    const rails: Rail[] = RAILS.map((r) => ({
      ...r,
      items: listGroceries(db, { category: r.categoryId }).filter((g) => g.inStock).slice(0, 10),
    }));
    // A cross-category rail of the best deals.
    const deals = listGroceries(db, { sort: 'discount' }).filter((g) => g.inStock).slice(0, 10);
    rails.splice(1, 0, { id: 'deals', title: 'Biggest savings today', categoryId: null, items: deals });
    const body: MinutelyHome = {
      etaMinutes,
      store: { id: store.id, name: store.name, locality: store.locality },
      banners: listBanners(db, 'minutely'),
      categories: listGroceryCategories(db),
      rails,
    };
    return c.json(body);
  });
  app.get('/categories', (c) => c.json(listGroceryCategories(db)));
  app.get(
    '/products',
    validate(
      'query',
      z.object({
        category: z.string().optional(),
        subcategory: z.string().optional(),
        q: z.string().optional(),
        sort: z.enum(['relevance', 'price_asc', 'price_desc', 'discount']).optional(),
      }),
    ),
    (c) => c.json(listGroceries(db, c.req.valid('query'))),
  );
  app.get('/products/:id', (c) => c.json(getGrocery(db, c.req.param('id'))));
  return app;
}
