import { filterRestaurants } from '@quickbite/core';
import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { HorizontalScroller } from '../components/ui/HorizontalScroller';
import { useArea, useRestaurants } from '../features/catalog/queries';
import { Landing } from '../features/location/Landing';
import { useLocationStore } from '../features/location/locationStore';
import { CuisineRail } from '../features/restaurants/CuisineRail';
import { FilterBar } from '../features/restaurants/FilterBar';
import { OfferBanners } from '../features/restaurants/OfferBanners';
import { RestaurantCard, RestaurantCardSkeleton } from '../features/restaurants/RestaurantCard';
import { useRestaurantFilters } from '../features/restaurants/useRestaurantFilters';

export function HomePage() {
  const areaId = useLocationStore((s) => s.areaId);
  if (!areaId) return <Landing />;
  return <Feed areaId={areaId} />;
}

function Feed({ areaId }: { areaId: string }) {
  const { data: area } = useArea(areaId);
  const { data: restaurants, isLoading, isError, refetch } = useRestaurants(areaId);
  const filterApi = useRestaurantFilters();
  const { filters, sort } = filterApi;

  const visible = useMemo(
    () => filterRestaurants(restaurants ?? [], filters, sort),
    [restaurants, filters, sort],
  );
  const topChains = useMemo(
    () =>
      filterRestaurants(restaurants ?? [], { ratingFourPlus: true }, 'rating')
        .filter((r) => r.isOpen)
        .slice(0, 10),
    [restaurants],
  );
  const placeName = area?.name ?? 'your area';

  if (isError) {
    return (
      <EmptyState
        title="Couldn't load restaurants"
        description="Check your connection and try again."
        action={<Button onClick={() => refetch()}>Try again</Button>}
      />
    );
  }

  return (
    <div className="container-page space-y-10 pt-4 md:space-y-12 md:pt-8">
      <OfferBanners />
      <CuisineRail
        title={`What's on your mind?`}
        selected={filters.cuisine ?? null}
        onSelect={(c) => {
          filterApi.setCuisine(c);
          document.getElementById('all-restaurants')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <hr className="border-line" />
      {(isLoading || topChains.length > 0) && (
        <>
          <HorizontalScroller title={`Top-rated restaurants in ${placeName}`} titleId="top-heading">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="w-[270px] shrink-0">
                    <RestaurantCardSkeleton />
                  </div>
                ))
              : topChains.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    priority={i < 2}
                    className="w-[270px] shrink-0 snap-start"
                  />
                ))}
          </HorizontalScroller>
          <hr className="border-line" />
        </>
      )}

      <section
        id="all-restaurants"
        aria-labelledby="all-heading"
        className="scroll-mt-20 md:scroll-mt-24"
      >
        <h2 id="all-heading" className="text-xl font-extrabold tracking-[-0.01em] md:text-2xl">
          Restaurants with online food delivery in {placeName}
        </h2>
        <FilterBar api={filterApi} className="sticky top-16 z-30 bg-white md:top-20" />
        {!isLoading && (
          <p className="sr-only" aria-live="polite">
            {visible.length} restaurants
          </p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <RestaurantCardSkeleton key={i} />)
            : visible.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
        {!isLoading && visible.length === 0 && (
          <EmptyState
            title="No restaurants match"
            description="Try removing a filter to see more places."
            action={
              <Button variant="outline" onClick={filterApi.clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
