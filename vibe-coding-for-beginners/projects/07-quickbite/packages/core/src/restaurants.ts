import type { Restaurant } from './types';

export interface RestaurantFilters {
  ratingFourPlus?: boolean;
  pureVeg?: boolean;
  fastDelivery?: boolean;
  offers?: boolean;
  cuisine?: string | null;
}

export type RestaurantSort =
  'relevance' | 'rating' | 'deliveryTime' | 'costLowToHigh' | 'costHighToLow';

/** "Fast delivery" means the upper estimate is at most this many minutes. */
export const FAST_DELIVERY_MINUTES = 30;

export function matchesFilters(r: Restaurant, f: RestaurantFilters): boolean {
  if (f.ratingFourPlus && r.rating < 4) return false;
  if (f.pureVeg && !r.isPureVeg) return false;
  if (f.fastDelivery && r.deliveryTimeMax > FAST_DELIVERY_MINUTES) return false;
  if (f.offers && !r.offer) return false;
  if (f.cuisine && !r.cuisines.some((c) => c.toLowerCase() === f.cuisine!.toLowerCase())) {
    return false;
  }
  return true;
}

const comparators: Record<RestaurantSort, (a: Restaurant, b: Restaurant) => number> = {
  // Promoted first, then a blend of rating and speed, like the big apps' default ordering.
  relevance: (a, b) =>
    Number(!!b.isPromoted) - Number(!!a.isPromoted) ||
    b.rating * 10 - b.deliveryTimeMax / 5 - (a.rating * 10 - a.deliveryTimeMax / 5),
  rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
  deliveryTime: (a, b) => a.deliveryTimeMax - b.deliveryTimeMax || b.rating - a.rating,
  costLowToHigh: (a, b) => a.costForTwo - b.costForTwo,
  costHighToLow: (a, b) => b.costForTwo - a.costForTwo,
};

/** Filters and sorts restaurants. Open restaurants always come before closed ones. */
export function filterRestaurants(
  restaurants: readonly Restaurant[],
  filters: RestaurantFilters,
  sort: RestaurantSort = 'relevance',
): Restaurant[] {
  return restaurants
    .filter((r) => matchesFilters(r, filters))
    .sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || comparators[sort](a, b));
}

export function activeFilterCount(f: RestaurantFilters): number {
  return [f.ratingFourPlus, f.pureVeg, f.fastDelivery, f.offers, f.cuisine].filter(Boolean).length;
}
