import type { RestaurantQuery, RestaurantSort } from '@pro/api';

export const FILTERS = [
  { key: 'rating', label: 'Rating 4.0+' },
  { key: 'fast', label: 'Fast delivery' },
  { key: 'veg', label: 'Pure veg' },
  { key: 'offers', label: 'Offers' },
] as const;
export type FilterKey = (typeof FILTERS)[number]['key'];

export const SORTS: { key: RestaurantSort; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'rating', label: 'Rating: high to low' },
  { key: 'delivery_time', label: 'Delivery time' },
  { key: 'cost_low', label: 'Cost: low to high' },
  { key: 'cost_high', label: 'Cost: high to low' },
];

export interface FilterState {
  active: readonly FilterKey[];
  sort: RestaurantSort;
}

export const NO_FILTERS: FilterState = { active: [], sort: 'relevance' };

export function toggleFilter(state: FilterState, key: FilterKey): FilterState {
  const active = state.active.includes(key) ? state.active.filter((k) => k !== key) : [...state.active, key];
  return { ...state, active };
}

export function hasFilters(state: FilterState): boolean {
  return state.active.length > 0 || state.sort !== 'relevance';
}

/** Home chips to the restaurant list query. Unset filters are left out. */
export function toRestaurantQuery(state: FilterState, extra: Pick<RestaurantQuery, 'q' | 'cuisine'> = {}): RestaurantQuery {
  const query: RestaurantQuery = { ...extra };
  if (state.active.includes('rating')) query.minRating = 4;
  if (state.active.includes('fast')) query.fast = true;
  if (state.active.includes('veg')) query.veg = true;
  if (state.active.includes('offers')) query.offers = true;
  if (state.sort !== 'relevance') query.sort = state.sort;
  return query;
}

export type SearchParams = {
  q?: string;
  cuisine?: string;
  offers?: string;
};

/**
 * Where a server banner link goes in the app. Banners name web-style paths
 * ("/offers", "/cuisine/biryani", "/restaurant/r-01"); unknown ones open search.
 */
export function bannerRoute(link: string | null): { pathname: string; params?: SearchParams } {
  if (!link) return { pathname: '/search' };
  const [, section, value] = link.split('/');
  if (section === 'restaurant' && value) return { pathname: `/restaurant/${value}` };
  if (section === 'cuisine' && value) return { pathname: '/search', params: { cuisine: titleCase(value) } };
  if (section === 'offers') return { pathname: '/search', params: { offers: '1' } };
  if (section === 'collection' && value) return { pathname: '/search', params: { q: value.replace(/-/g, ' ') } };
  return { pathname: '/search' };
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
