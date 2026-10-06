import { filterRestaurants } from '@quickbite/core';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useArea, useRestaurants } from '../features/catalog/queries';
import { useLocationStore } from '../features/location/locationStore';
import { OFFER_BANNERS } from '../features/restaurants/offers';
import { RestaurantCard, RestaurantCardSkeleton } from '../features/restaurants/RestaurantCard';

export function OffersPage() {
  const areaId = useLocationStore((s) => s.areaId);
  const { data: area } = useArea(areaId);
  const { data: restaurants, isLoading } = useRestaurants(areaId);
  const withOffers = useMemo(
    () => filterRestaurants(restaurants ?? [], { offers: true }, 'rating'),
    [restaurants],
  );

  return (
    <div className="container-page pt-6 md:pt-10">
      <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white md:p-10">
        <h1 className="text-3xl font-extrabold tracking-[-0.01em] md:text-4xl">Offers for you</h1>
        <p className="mt-2 max-w-md opacity-90">
          Apply a code at checkout. The best deal is checked on our servers, so what you see is what
          you pay.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="codes-heading">
        <h2 id="codes-heading" className="text-xl font-extrabold">
          Coupon codes
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {OFFER_BANNERS.map((o) => (
            <li
              key={o.code}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4"
            >
              <div>
                <p className="text-lg font-extrabold">{o.headline}</p>
                <p className="text-sm text-muted">{o.detail}</p>
              </div>
              <span className="rounded-lg border border-dashed border-brand-400 bg-brand-50 px-3 py-1.5 text-sm font-extrabold tracking-wider text-brand-700">
                {o.code}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="deals-heading">
        <h2 id="deals-heading" className="text-xl font-extrabold">
          Restaurants with great offers {area ? `in ${area.name}` : 'near you'}
        </h2>
        {!areaId ? (
          <EmptyState
            title="Set your location"
            description="Pick your area to see restaurant deals near you."
            action={
              <Link to="/">
                <Button>Choose location</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => <RestaurantCardSkeleton key={i} />)
              : withOffers.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </section>
    </div>
  );
}
