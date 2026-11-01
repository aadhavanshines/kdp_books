import type { ProductQuery, ProductSort } from '@pro/api';
import { formatINR } from '@pro/ui';

export interface PriceRange {
  min?: number;
  max?: number;
}

/** Filters a shopper can set on a listing (on top of the search or category). */
export interface FilterState {
  brands: string[];
  price: PriceRange | null;
  minRating: number | null;
  minDiscount: number | null;
  sort: ProductSort;
}

export const NO_FILTERS: FilterState = { brands: [], price: null, minRating: null, minDiscount: null, sort: 'relevance' };

export const SORTS: { key: ProductSort; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'rating', label: 'Customer rating' },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc', label: 'Price: high to low' },
  { key: 'discount', label: 'Discount' },
  { key: 'newest', label: 'Newest first' },
];

export const PRICE_BUCKETS: PriceRange[] = [
  { max: 499 },
  { min: 500, max: 999 },
  { min: 1000, max: 4999 },
  { min: 5000, max: 19999 },
  { min: 20000 },
];

export const RATING_OPTIONS = [4, 3] as const;
export const DISCOUNT_OPTIONS = [10, 30, 50, 70] as const;

export function priceLabel(range: PriceRange): string {
  if (range.min == null && range.max != null) return `Under ${formatINR(range.max + 1)}`;
  if (range.max == null && range.min != null) return `Over ${formatINR(range.min)}`;
  return `${formatINR(range.min ?? 0)} to ${formatINR(range.max ?? 0)}`;
}

export const ratingLabel = (stars: number) => `${stars}★ & above`;
export const discountLabel = (percent: number) => `${percent}% off or more`;

export function samePrice(a: PriceRange | null, b: PriceRange | null): boolean {
  return (a?.min ?? null) === (b?.min ?? null) && (a?.max ?? null) === (b?.max ?? null);
}

/** The API query for a listing: the base (search or category) plus filters. */
export function toProductQuery(base: Pick<ProductQuery, 'q' | 'category'>, f: FilterState): Omit<ProductQuery, 'page'> {
  const query: Omit<ProductQuery, 'page'> = {};
  if (base.q) query.q = base.q;
  if (base.category) query.category = base.category;
  if (f.brands.length) query.brand = [...f.brands].sort();
  if (f.price?.min != null) query.minPrice = f.price.min;
  if (f.price?.max != null) query.maxPrice = f.price.max;
  if (f.minRating != null) query.minRating = f.minRating;
  if (f.minDiscount != null) query.minDiscount = f.minDiscount;
  if (f.sort !== 'relevance') query.sort = f.sort;
  return query;
}

/** Number of filter groups in use (sort is not a filter), for the "Filter (2)" button. */
export function activeFilterCount(f: FilterState): number {
  return (f.brands.length ? 1 : 0) + (f.price ? 1 : 0) + (f.minRating != null ? 1 : 0) + (f.minDiscount != null ? 1 : 0);
}

export function toggleBrand(f: FilterState, brand: string): FilterState {
  return { ...f, brands: f.brands.includes(brand) ? f.brands.filter((b) => b !== brand) : [...f.brands, brand] };
}

export type AppliedFilter = { key: string; label: string; remove: (f: FilterState) => FilterState };

/** One removable chip per applied filter value. */
export function appliedFilters(f: FilterState): AppliedFilter[] {
  const out: AppliedFilter[] = [];
  if (f.price) out.push({ key: 'price', label: priceLabel(f.price), remove: (s) => ({ ...s, price: null }) });
  if (f.minRating != null) out.push({ key: 'rating', label: ratingLabel(f.minRating), remove: (s) => ({ ...s, minRating: null }) });
  if (f.minDiscount != null) out.push({ key: 'discount', label: discountLabel(f.minDiscount), remove: (s) => ({ ...s, minDiscount: null }) });
  for (const b of f.brands) out.push({ key: `brand:${b}`, label: b, remove: (s) => toggleBrand(s, b) });
  return out;
}

export interface ListingParams {
  q?: string;
  category?: string;
  brand?: string;
  minDiscount?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
  title?: string;
}

const num = (v: string | undefined): number | undefined => {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** Route params (from search, banners, categories) to the base query and starting filters. */
export function fromParams(p: ListingParams): { base: Pick<ProductQuery, 'q' | 'category'>; filters: FilterState } {
  const minPrice = num(p.minPrice);
  const maxPrice = num(p.maxPrice);
  const sort = SORTS.some((s) => s.key === p.sort) ? (p.sort as ProductSort) : 'relevance';
  return {
    base: { q: p.q?.trim() || undefined, category: p.category || undefined },
    filters: {
      brands: p.brand ? p.brand.split(',').map((b) => b.trim()).filter(Boolean) : [],
      price: minPrice != null || maxPrice != null ? { min: minPrice, max: maxPrice } : null,
      minRating: num(p.minRating) ?? null,
      minDiscount: num(p.minDiscount) ?? null,
      sort,
    },
  };
}

/** "Results for “earbuds”", the category name, or a banner's title. */
export function listingTitle(p: ListingParams, categoryName: string | undefined): string {
  if (p.title) return p.title;
  if (p.q) return `“${p.q.trim()}”`;
  if (categoryName) return categoryName;
  if (p.brand) return p.brand;
  return 'All products';
}
