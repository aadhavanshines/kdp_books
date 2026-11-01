import type { SearchSuggestion } from '@pro/api';

import type { AppHref } from './links';

export const MAX_RECENT = 8;

export const TRENDING_SEARCHES = ['wireless earbuds', 'running shoes', 'smartwatch', '5G phones', 'air fryer', 'backpack'];

/** Adds a search to the front of the recent list (deduplicated, capped). */
export function addRecent(list: readonly string[], term: string, max = MAX_RECENT): string[] {
  const t = term.trim();
  if (!t) return [...list];
  return [t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, max);
}

/** Splits text around the first case-insensitive match of `query`, for bold highlights. */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, at), match: false },
    { text: text.slice(at, at + q.length), match: true },
    { text: text.slice(at + q.length), match: false },
  ].filter((p) => p.text.length > 0);
}

/** Where tapping a suggestion goes. */
export function suggestionHref(s: SearchSuggestion): AppHref {
  switch (s.kind) {
    case 'product':
      return s.id ? `/product/${s.id}` : { pathname: '/products', params: { q: s.text } };
    case 'category':
      return { pathname: '/products', params: s.id ? { category: s.id } : { q: s.text } };
    case 'brand':
      return { pathname: '/products', params: { brand: s.text } };
    default:
      return { pathname: '/products', params: { q: s.text } };
  }
}

