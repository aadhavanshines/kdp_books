import { Hono } from 'hono';
import { z } from 'zod';
import type { ArtName, ArtTone, CartlyHome, Deal, ProductCategory, ProductSummary } from '@pro/api/types';

import type { Deps } from '../deps';
import { currentUser, requireAuth, type AppEnv } from '../lib/auth';
import { iso, nextMidnightIST } from '../lib/time';
import { validate } from '../lib/validate';
import {
  deliveryEstimate,
  getProduct,
  getProductRow,
  listProducts,
  listReviews,
  suggestions,
  toProductSummary,
  wishlistSet,
  type ProductRow,
} from '../services/cartly';
import { listBanners } from './shared';

const productQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'discount', 'newest']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export function cartlyRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  const { db } = deps;
  const auth = requireAuth(deps.config.jwtSecret);

  const categories = () =>
    (db.prepare('SELECT id, name, art, tone FROM product_categories ORDER BY sort').all() as ProductCategory[]).map((c) => ({
      ...c,
      art: c.art as ArtName,
      tone: c.tone as ArtTone,
    }));
  const summaries = (rows: ProductRow[], userId: string | null) => {
    const wished = wishlistSet(db, userId);
    return rows.map((r) => toProductSummary(r, wished));
  };
  const deals = (userId: string | null): Deal[] => {
    const endsAt = iso(nextMidnightIST(deps.clock()));
    const rows = db
      .prepare('SELECT p.*, d.claimed_percent FROM deals d JOIN products p ON p.id = d.product_id ORDER BY d.sort')
      .all() as (ProductRow & { claimed_percent: number })[];
    const wished = wishlistSet(db, userId);
    return rows.map((r) => ({ product: toProductSummary(r, wished), endsAt, claimedPercent: r.claimed_percent }));
  };
  const recentlyViewed = (userId: string | null): ProductSummary[] =>
    userId
      ? summaries(
          db
            .prepare('SELECT p.* FROM recently_viewed v JOIN products p ON p.id = v.product_id WHERE v.user_id = ? ORDER BY v.viewed_at DESC LIMIT 12')
            .all(userId) as ProductRow[],
          userId,
        )
      : [];

  app.get('/home', (c) => {
    const userId = c.get('userId');
    const body: CartlyHome = {
      banners: listBanners(db, 'cartly'),
      categories: categories(),
      deals: deals(userId),
      dealsEndAt: iso(nextMidnightIST(deps.clock())),
      topPicks: listProducts(db, { sort: 'relevance', pageSize: 12 }, userId).items,
      recentlyViewed: recentlyViewed(userId),
    };
    return c.json(body);
  });
  app.get('/categories', (c) => c.json(categories()));
  app.get('/deals', (c) => c.json(deals(c.get('userId'))));
  app.get('/products', validate('query', productQuery), (c) => {
    // `brand` may repeat (?brand=A&brand=B) or be comma separated.
    const brand = (c.req.queries('brand') ?? []).flatMap((b) => b.split(',')).map((b) => b.trim()).filter(Boolean);
    return c.json(listProducts(db, { ...c.req.valid('query'), brand }, c.get('userId')));
  });
  app.get('/products/:id', (c) => {
    const userId = c.get('userId');
    const product = getProduct(db, c.req.param('id'), userId);
    if (userId) {
      db.prepare(
        'INSERT INTO recently_viewed (user_id, product_id, viewed_at) VALUES (?, ?, ?) ON CONFLICT(user_id, product_id) DO UPDATE SET viewed_at = excluded.viewed_at',
      ).run(userId, product.id, deps.clock());
    }
    return c.json(product);
  });
  app.get(
    '/products/:id/reviews',
    validate(
      'query',
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(50).default(10),
        sort: z.enum(['helpful', 'recent', 'rating_high', 'rating_low']).default('helpful'),
      }),
    ),
    (c) => {
      const q = c.req.valid('query');
      return c.json(listReviews(db, c.req.param('id'), q.page, q.pageSize, q.sort));
    },
  );
  app.get('/search/suggestions', validate('query', z.object({ q: z.string().default('') })), (c) =>
    c.json(suggestions(db, c.req.valid('query').q)),
  );
  app.get('/brands', validate('query', z.object({ category: z.string().optional() })), (c) => {
    const { category } = c.req.valid('query');
    const rows = (
      category
        ? db.prepare('SELECT DISTINCT brand FROM products WHERE category_id = ? ORDER BY brand').all(category)
        : db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all()
    ) as { brand: string }[];
    return c.json(rows.map((r) => r.brand));
  });
  app.get('/delivery-estimate', validate('query', z.object({ pincode: z.string(), productId: z.string().optional() })), (c) => {
    const { pincode, productId } = c.req.valid('query');
    return c.json(deliveryEstimate(pincode, productId ? getProductRow(db, productId) : null, deps.clock()));
  });

  app.get('/wishlist', auth, (c) =>
    c.json(
      summaries(
        db.prepare('SELECT p.* FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at DESC').all(currentUser(c)) as ProductRow[],
        currentUser(c),
      ),
    ),
  );
  app.put('/wishlist/:productId', auth, (c) => {
    const userId = currentUser(c);
    const row = getProductRow(db, c.req.param('productId'));
    db.prepare('INSERT OR IGNORE INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)').run(userId, row.id, deps.clock());
    return c.json(toProductSummary(row, wishlistSet(db, userId)));
  });
  app.delete('/wishlist/:productId', auth, (c) => {
    const userId = currentUser(c);
    const row = getProductRow(db, c.req.param('productId'));
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(userId, row.id);
    return c.json(toProductSummary(row, wishlistSet(db, userId)));
  });
  app.get('/recently-viewed', auth, (c) => c.json(recentlyViewed(currentUser(c))));
  return app;
}
