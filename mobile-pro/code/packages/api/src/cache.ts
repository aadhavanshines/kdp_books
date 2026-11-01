/**
 * Walks JSON-like data and replaces every object that matches `match` with
 * `update(object)`. Returns the same reference when nothing changed, so
 * React Query does not re-render untouched queries.
 *
 * Used to keep one entity consistent everywhere it is cached: liking a post
 * updates it in the feed, explore, the profile grid and the detail screen.
 */
export function updateDeep<T>(data: T, match: (value: Record<string, unknown>) => boolean, update: (value: Record<string, unknown>) => Record<string, unknown>): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      let changed = false;
      const next = value.map((item) => {
        const n = visit(item);
        if (n !== item) changed = true;
        return n;
      });
      return changed ? next : value;
    }
    if (value !== null && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (match(obj)) return update(obj);
      let changed = false;
      const next: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(obj)) {
        const n = visit(child);
        if (n !== child) changed = true;
        next[key] = n;
      }
      return changed ? next : value;
    }
    return value;
  };
  return visit(data) as T;
}

/** Matches an entity by id that has a given field (e.g. a Post has likeCount). */
export const byIdWith =
  (id: string, field: string) =>
  (value: Record<string, unknown>): boolean =>
    value.id === id && field in value;
