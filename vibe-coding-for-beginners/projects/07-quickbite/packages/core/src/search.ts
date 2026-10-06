import type { MenuItem, Restaurant } from './types';

/** Lower-cases, strips accents and punctuation: "Crème Brûlée!" → "creme brulee". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scores how well `text` matches `query`. 0 means no match.
 * Every query word must appear as the start of some word in the text.
 */
export function matchScore(text: string, query: string): number {
  const q = normalizeText(query);
  if (!q) return 0;
  const t = normalizeText(text);
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  const words = t.split(' ');
  const terms = q.split(' ');
  const allTermsMatch = terms.every((term) => words.some((w) => w.startsWith(term)));
  if (allTermsMatch) return 60;
  if (t.includes(q)) return 30;
  return 0;
}

export interface DishSearchHit {
  item: MenuItem;
  restaurant: Restaurant;
  score: number;
}

export interface RestaurantSearchHit {
  restaurant: Restaurant;
  score: number;
}

export interface SearchResults {
  restaurants: RestaurantSearchHit[];
  dishes: DishSearchHit[];
}

/** Searches restaurant names, cuisines and dish names. Used by the in-memory backend. */
export function searchCatalog(
  query: string,
  restaurants: readonly Restaurant[],
  items: readonly MenuItem[],
  limit = 30,
): SearchResults {
  const byId = new Map(restaurants.map((r) => [r.id, r]));

  const restaurantHits: RestaurantSearchHit[] = [];
  for (const restaurant of restaurants) {
    const score = Math.max(
      matchScore(restaurant.name, query),
      ...restaurant.cuisines.map((c) => matchScore(c, query) * 0.8),
    );
    if (score > 0) restaurantHits.push({ restaurant, score: score + restaurant.rating });
  }

  const dishHits: DishSearchHit[] = [];
  for (const item of items) {
    const restaurant = byId.get(item.restaurantId);
    if (!restaurant || !item.isAvailable) continue;
    const score = Math.max(matchScore(item.name, query), matchScore(item.description, query) * 0.3);
    if (score > 0) {
      dishHits.push({
        item,
        restaurant,
        score: score + (item.isBestseller ? 5 : 0) + restaurant.rating,
      });
    }
  }

  return {
    restaurants: restaurantHits.sort((a, b) => b.score - a.score).slice(0, limit),
    dishes: dishHits.sort((a, b) => b.score - a.score).slice(0, limit),
  };
}
