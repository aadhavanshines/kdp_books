import { featuredTitles, visibleTitles, type Section, type Title } from '../data/catalog';

/**
 * The titles a section's billboard rotates through. Never empty: if a
 * profile has nothing for the section (a Kids profile has no sports), it
 * falls back to that profile's featured titles, then to anything it may watch.
 */
export function heroPool(section: Section, kids: boolean): Title[] {
  const profile = { kids };
  const pool = visibleTitles(profile);
  const pick =
    section === 'home'
      ? featuredTitles(profile)
      : section === 'movies'
        ? pool.filter((t) => t.kind === 'movie')
        : section === 'series'
          ? pool.filter((t) => t.kind === 'series')
          : pool.filter((t) => t.genres.some((g) => g === 'Sports' || g === 'Adventure'));
  const sorted = [...pick].sort((a, b) => Number(b.featured) - Number(a.featured) || b.match - a.match).slice(0, 4);
  if (sorted.length > 0) return sorted;
  const fallback = featuredTitles(profile);
  return fallback.length > 0 ? fallback.slice(0, 4) : pool.slice(0, 4);
}
