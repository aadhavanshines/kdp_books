import type { GroceryItem, GrocerySort } from '@pro/api';

export const SORT_OPTIONS: { key: GrocerySort; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc', label: 'Price: high to low' },
  { key: 'discount', label: 'Discount' },
];

export function sortLabel(sort: GrocerySort): string {
  return SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Relevance';
}

/** "14% OFF" for a ribbon, or null under 1%. */
export function discountLabel(item: Pick<GroceryItem, 'discountPercent'>): string | null {
  return item.discountPercent >= 1 ? `${Math.round(item.discountPercent)}% OFF` : null;
}

/** Rotating hints in the search bar. */
export const SEARCH_HINTS = ['milk', 'bread', 'chips', 'mango', 'paneer'] as const;

/** Popular searches shown before you type. */
export const TRENDING = ['Milk', 'Eggs', 'Bread', 'Banana', 'Chips', 'Paneer', 'Coffee', 'Ice cream'] as const;

/** Out-of-stock items sink to the bottom; the server's order is kept otherwise. */
export function inStockFirst<T extends Pick<GroceryItem, 'inStock'>>(items: readonly T[]): T[] {
  return [...items.filter((i) => i.inStock), ...items.filter((i) => !i.inStock)];
}
