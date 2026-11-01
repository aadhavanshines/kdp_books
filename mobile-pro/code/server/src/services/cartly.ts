import type {
  ArtName,
  ArtTone,
  DeliveryEstimate,
  Offer,
  Product,
  ProductListResponse,
  ProductQuery,
  ProductSummary,
  RatingSummary,
  Review,
  ReviewPage,
  SearchSuggestion,
  VariantGroup,
} from '@pro/api/types';

import type { DB } from '../db';
import { notFound } from '../lib/errors';
import { parseJson } from '../lib/json';
import { discountPercent } from '../lib/pricing';
import { DAY, iso, shortDate } from '../lib/time';
import { ratingBreakdown } from '../seed/breakdown';

export interface ProductRow {
  id: string;
  title: string;
  brand: string;
  category_id: string;
  art: string;
  tone: string;
  gallery_json: string;
  price: number;
  mrp: number;
  rating: number;
  rating_count: number;
  badge: string | null;
  fast_delivery: number;
  description: string;
  highlights_json: string;
  specs_json: string;
  variants_json: string;
  offers_json: string;
  seller: string;
  return_days: number;
  warranty: string | null;
  stock: number;
  added_at: number;
}

interface ReviewRow {
  id: string;
  product_id: string;
  author: string;
  avatar: string | null;
  rating: number;
  title: string;
  body: string;
  variant_label: string | null;
  verified: number;
  helpful: number;
  created_at: number;
}

export function wishlistSet(db: DB, userId: string | null): Set<string> {
  if (!userId) return new Set();
  return new Set(
    (db.prepare('SELECT product_id FROM wishlist WHERE user_id = ?').all(userId) as { product_id: string }[]).map((r) => r.product_id),
  );
}

export function toProductSummary(p: ProductRow, wished: Set<string>): ProductSummary {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    categoryId: p.category_id,
    art: p.art as ArtName,
    tone: p.tone as ArtTone,
    price: p.price,
    mrp: p.mrp,
    discountPercent: discountPercent(p.price, p.mrp),
    rating: p.rating,
    ratingCount: p.rating_count,
    badge: p.badge,
    fastDelivery: p.fast_delivery === 1,
    isWishlisted: wished.has(p.id),
  };
}

const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  productId: r.product_id,
  author: r.author,
  avatar: r.avatar as ArtName | null,
  rating: r.rating,
  title: r.title,
  body: r.body,
  variantLabel: r.variant_label,
  verifiedPurchase: r.verified === 1,
  helpfulCount: r.helpful,
  createdAt: iso(r.created_at),
});

export function getProductRow(db: DB, id: string): ProductRow {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined;
  if (!row) throw notFound('Product');
  return row;
}

export function ratingSummary(p: ProductRow): RatingSummary {
  return { average: p.rating, count: p.rating_count, breakdown: ratingBreakdown(p.rating, p.rating_count) };
}

export function getProduct(db: DB, id: string, userId: string | null): Product {
  const p = getProductRow(db, id);
  const topReviews = (
    db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY helpful DESC, created_at DESC LIMIT 3').all(id) as ReviewRow[]
  ).map(toReview);
  return {
    ...toProductSummary(p, wishlistSet(db, userId)),
    gallery: parseJson<{ art: ArtName; tone: ArtTone }[]>(p.gallery_json, []),
    description: p.description,
    highlights: parseJson<string[]>(p.highlights_json, []),
    specs: parseJson<{ label: string; value: string }[]>(p.specs_json, []),
    variants: parseJson<VariantGroup[]>(p.variants_json, []),
    offers: parseJson<Offer[]>(p.offers_json, []),
    ratingSummary: ratingSummary(p),
    topReviews,
    seller: p.seller,
    returnDays: p.return_days,
    warranty: p.warranty,
    stock: p.stock,
  };
}

export function listProducts(db: DB, query: ProductQuery, userId: string | null): ProductListResponse {
  const all = db.prepare('SELECT * FROM products').all() as ProductRow[];
  const q = query.q?.trim().toLowerCase();
  const terms = q ? q.split(/\s+/).filter(Boolean) : [];
  const categoryNames = new Map(
    (db.prepare('SELECT id, name FROM product_categories').all() as { id: string; name: string }[]).map((c) => [c.id, c.name.toLowerCase()]),
  );
  // Facets reflect the search and category, before brand/price/rating filters.
  const base = all.filter((p) => {
    if (query.category && p.category_id !== query.category) return false;
    if (terms.length) {
      const hay = `${p.title} ${p.brand} ${categoryNames.get(p.category_id) ?? ''}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const brandCounts = new Map<string, number>();
  for (const p of base) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const prices = base.map((p) => p.price);

  let list = base.filter((p) => {
    if (query.brand?.length && !query.brand.includes(p.brand)) return false;
    if (query.minPrice != null && p.price < query.minPrice) return false;
    if (query.maxPrice != null && p.price > query.maxPrice) return false;
    if (query.minRating != null && p.rating < query.minRating) return false;
    if (query.minDiscount != null && discountPercent(p.price, p.mrp) < query.minDiscount) return false;
    return true;
  });
  const score = (p: ProductRow) => p.rating * Math.log10(p.rating_count + 10) + (p.badge ? 1 : 0);
  switch (query.sort) {
    case 'price_asc':
      list = list.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      list = list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list = list.sort((a, b) => b.rating - a.rating || b.rating_count - a.rating_count);
      break;
    case 'discount':
      list = list.sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp));
      break;
    case 'newest':
      list = list.sort((a, b) => b.added_at - a.added_at);
      break;
    default:
      list = list.sort((a, b) => score(b) - score(a));
  }
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));
  const wished = wishlistSet(db, userId);
  const items = list.slice((page - 1) * pageSize, page * pageSize).map((p) => toProductSummary(p, wished));
  return {
    items,
    page,
    pageSize,
    total: list.length,
    hasMore: page * pageSize < list.length,
    facets: {
      brands: [...brandCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      price: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    },
  };
}

export function listReviews(db: DB, productId: string, page: number, pageSize: number, sort: 'helpful' | 'recent' | 'rating_high' | 'rating_low'): ReviewPage {
  const p = getProductRow(db, productId);
  const order = {
    helpful: 'helpful DESC, created_at DESC',
    recent: 'created_at DESC',
    rating_high: 'rating DESC, created_at DESC',
    rating_low: 'rating ASC, created_at DESC',
  }[sort];
  const total = (db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE product_id = ?').get(productId) as { n: number }).n;
  const rows = db
    .prepare(`SELECT * FROM reviews WHERE product_id = ? ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(productId, pageSize, (page - 1) * pageSize) as ReviewRow[];
  return { items: rows.map(toReview), page, pageSize, total, hasMore: page * pageSize < total, summary: ratingSummary(p) };
}

export function suggestions(db: DB, q: string): SearchSuggestion[] {
  const term = q.trim().toLowerCase();
  if (term.length < 1) return [];
  const like = `%${term}%`;
  const categories = (db.prepare('SELECT id, name FROM product_categories WHERE lower(name) LIKE ? LIMIT 3').all(like) as {
    id: string;
    name: string;
  }[]).map((c): SearchSuggestion => ({ text: c.name, kind: 'category', id: c.id }));
  const brands = (db.prepare('SELECT DISTINCT brand FROM products WHERE lower(brand) LIKE ? LIMIT 3').all(like) as { brand: string }[]).map(
    (b): SearchSuggestion => ({ text: b.brand, kind: 'brand', id: null }),
  );
  const products = (db.prepare('SELECT id, title FROM products WHERE lower(title) LIKE ? ORDER BY rating_count DESC LIMIT 6').all(like) as {
    id: string;
    title: string;
  }[]).map((p): SearchSuggestion => ({ text: p.title, kind: 'product', id: p.id }));
  return [{ text: q.trim(), kind: 'query', id: null }, ...categories, ...brands, ...products];
}

/** Northbay pincodes (560101..560110) get fast delivery; other valid pincodes take longer. */
export function deliveryEstimate(pincode: string, product: ProductRow | null, now: number): DeliveryEstimate {
  if (!/^[1-9]\d{5}$/.test(pincode)) {
    return { pincode, serviceable: false, date: null, label: 'Enter a valid 6-digit pincode', fee: 0, cashOnDelivery: false };
  }
  const local = /^5601(0\d|10)$/.test(pincode);
  const days = local ? (product?.fast_delivery ? 1 : 2) : product?.fast_delivery ? 3 : 5;
  const date = now + days * DAY;
  return {
    pincode,
    serviceable: true,
    date: iso(date),
    label: days === 1 ? `Delivery by tomorrow, ${shortDate(date)}` : `Delivery by ${shortDate(date)}`,
    fee: product && product.price >= 499 ? 0 : 40,
    cashOnDelivery: local,
  };
}
