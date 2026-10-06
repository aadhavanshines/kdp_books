import type { RestaurantFilters, RestaurantSort } from '@quickbite/core';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

const SORTS: RestaurantSort[] = [
  'relevance',
  'rating',
  'deliveryTime',
  'costLowToHigh',
  'costHighToLow',
];

export const SORT_LABELS: Record<RestaurantSort, string> = {
  relevance: 'Relevance (default)',
  rating: 'Rating: high to low',
  deliveryTime: 'Delivery time',
  costLowToHigh: 'Cost: low to high',
  costHighToLow: 'Cost: high to low',
};

/**
 * Filters live in the URL (?veg=1&rating=4&sort=rating&cuisine=Biryani) so the
 * back button, refresh and shared links all keep them.
 */
export function useRestaurantFilters() {
  const [params, setParams] = useSearchParams();

  const filters: RestaurantFilters = useMemo(
    () => ({
      ratingFourPlus: params.get('rating') === '4',
      pureVeg: params.get('veg') === '1',
      fastDelivery: params.get('fast') === '1',
      offers: params.get('offers') === '1',
      cuisine: params.get('cuisine'),
    }),
    [params],
  );
  const rawSort = params.get('sort') as RestaurantSort | null;
  const sort: RestaurantSort = rawSort && SORTS.includes(rawSort) ? rawSort : 'relevance';

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );

  return {
    filters,
    sort,
    toggleRating: () => update({ rating: filters.ratingFourPlus ? null : '4' }),
    togglePureVeg: () => update({ veg: filters.pureVeg ? null : '1' }),
    toggleFast: () => update({ fast: filters.fastDelivery ? null : '1' }),
    toggleOffers: () => update({ offers: filters.offers ? null : '1' }),
    setCuisine: (cuisine: string | null) => update({ cuisine }),
    setSort: (s: RestaurantSort) => update({ sort: s === 'relevance' ? null : s }),
    clearAll: () =>
      update({ rating: null, veg: null, fast: null, offers: null, cuisine: null, sort: null }),
  };
}

export type RestaurantFiltersApi = ReturnType<typeof useRestaurantFilters>;
