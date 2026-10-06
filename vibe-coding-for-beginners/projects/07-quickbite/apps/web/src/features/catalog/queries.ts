import { useQuery } from '@tanstack/react-query';
import { getBackend } from '../../backend';

/** Catalog data changes rarely, so it stays fresh for a few minutes. */
const CATALOG_STALE_MS = 5 * 60_000;

export const catalogKeys = {
  areas: ['areas'] as const,
  restaurants: (areaId: string) => ['restaurants', areaId] as const,
  restaurant: (slug: string) => ['restaurant', slug] as const,
  menu: (restaurantId: string) => ['menu', restaurantId] as const,
  search: (areaId: string, q: string) => ['search', areaId, q] as const,
  coupons: (brandId: string) => ['coupons', brandId] as const,
};

export function useAreas() {
  return useQuery({
    queryKey: catalogKeys.areas,
    queryFn: async () => (await getBackend()).catalog.listAreas(),
    staleTime: Infinity,
  });
}

export function useArea(areaId: string | null) {
  const areas = useAreas();
  return { ...areas, data: areas.data?.find((a) => a.id === areaId) ?? null };
}

export function useRestaurants(areaId: string | null) {
  return useQuery({
    queryKey: catalogKeys.restaurants(areaId ?? ''),
    queryFn: async () => (await getBackend()).catalog.listRestaurants(areaId!),
    enabled: Boolean(areaId),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: catalogKeys.restaurant(slug),
    queryFn: async () => (await getBackend()).catalog.getRestaurantBySlug(slug),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useMenu(restaurantId: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.menu(restaurantId ?? ''),
    queryFn: async () => (await getBackend()).catalog.getMenu(restaurantId!),
    enabled: Boolean(restaurantId),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useSearch(areaId: string | null, query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: catalogKeys.search(areaId ?? '', q.toLowerCase()),
    queryFn: async () => (await getBackend()).catalog.search(areaId!, q),
    enabled: Boolean(areaId) && q.length >= 2,
    staleTime: CATALOG_STALE_MS,
    placeholderData: (previous) => previous,
  });
}

export function useCoupons(brandId: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.coupons(brandId ?? ''),
    queryFn: async () => (await getBackend()).catalog.listCoupons(brandId!),
    enabled: Boolean(brandId),
    staleTime: CATALOG_STALE_MS,
  });
}
