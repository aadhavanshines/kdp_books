import { Hono } from 'hono';
import { z } from 'zod';
import type { Banner, Cuisine, PlatterHome, PlatterSearchResult } from '@pro/api/types';

import type { Deps } from '../deps';
import type { AppEnv } from '../lib/auth';
import { validate } from '../lib/validate';
import { DEFAULT_ORIGIN, getRestaurant, listRestaurants, searchPlatter } from '../services/platter';
import { defaultAddress } from '../services/users';
import { listBanners } from './shared';
import { queryBool } from './common';

const restaurantQuery = z.object({
  q: z.string().optional(),
  cuisine: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  fast: queryBool,
  veg: queryBool,
  offers: queryBool,
  sort: z.enum(['relevance', 'rating', 'delivery_time', 'cost_low', 'cost_high']).optional(),
});

export function platterRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  const origin = (userId: string | null) => defaultAddress(deps.db, userId)?.location ?? DEFAULT_ORIGIN;
  const cuisines = () => deps.db.prepare('SELECT id, name, art FROM cuisines ORDER BY sort').all() as Cuisine[];

  app.get('/home', (c) => {
    const body: PlatterHome = {
      banners: listBanners(deps.db, 'platter') as Banner[],
      cuisines: cuisines(),
      restaurants: listRestaurants(deps.db, {}, origin(c.get('userId'))),
    };
    return c.json(body);
  });
  app.get('/cuisines', (c) => c.json(cuisines()));
  app.get('/restaurants', validate('query', restaurantQuery), (c) =>
    c.json(listRestaurants(deps.db, c.req.valid('query'), origin(c.get('userId')))),
  );
  app.get('/restaurants/:id', (c) => c.json(getRestaurant(deps.db, c.req.param('id'), origin(c.get('userId')))));
  app.get('/search', validate('query', z.object({ q: z.string().default('') })), (c) =>
    c.json<PlatterSearchResult>(searchPlatter(deps.db, c.req.valid('query').q, origin(c.get('userId')))),
  );
  return app;
}
