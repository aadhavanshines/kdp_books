import type { MenuCategory } from '@pro/api';

export interface MenuFilter {
  veg: boolean;
  bestseller: boolean;
  /** Matches dish names and descriptions, case-insensitively. */
  text: string;
}

/** The menu with only matching dishes; empty categories are dropped. */
export function filterMenu(menu: readonly MenuCategory[], filter: MenuFilter): MenuCategory[] {
  const text = filter.text.trim().toLowerCase();
  return menu
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          (!filter.veg || i.isVeg) &&
          (!filter.bestseller || i.isBestseller) &&
          (!text || i.name.toLowerCase().includes(text) || i.description.toLowerCase().includes(text)),
      ),
    }))
    .filter((c) => c.items.length > 0);
}
