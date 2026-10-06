import { matchScore, type Menu, type MenuItem } from '@quickbite/core';
import { useMemo } from 'react';

export interface MenuFilters {
  vegOnly: boolean;
  nonVegOnly: boolean;
  bestsellerOnly: boolean;
  query: string;
}

export interface MenuSectionData {
  id: string;
  name: string;
  items: MenuItem[];
}

/** Groups menu items by category and applies the menu toolbar filters. */
export function useMenuSections(menu: Menu | undefined, filters: MenuFilters): MenuSectionData[] {
  return useMemo(() => {
    if (!menu) return [];
    const q = filters.query.trim();
    const keep = (item: MenuItem) =>
      (!filters.vegOnly || item.isVeg) &&
      (!filters.nonVegOnly || !item.isVeg) &&
      (!filters.bestsellerOnly || item.isBestseller) &&
      (!q || matchScore(item.name, q) > 0 || matchScore(item.description, q) > 0);

    return [...menu.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        id: `cat-${c.id.replace(/[^a-z0-9-]/gi, '-')}`,
        name: c.name,
        items: menu.items.filter((i) => i.categoryId === c.id && keep(i)),
      }))
      .filter((s) => s.items.length > 0);
  }, [menu, filters.vegOnly, filters.nonVegOnly, filters.bestsellerOnly, filters.query]);
}
