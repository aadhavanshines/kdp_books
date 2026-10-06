import type { MenuItem, Restaurant } from '@quickbite/core';
import { ArrowLeft, Clock3, Loader2, Search, X } from 'lucide-react';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Img } from '../components/ui/Img';
import { useSearch } from '../features/catalog/queries';
import { useLocationStore } from '../features/location/locationStore';
import { CUISINE_SHORTCUTS } from '../features/restaurants/cuisines';
import { useRecentSearches } from '../features/search/recentSearches';
import { DishResult, RestaurantResult } from '../features/search/SearchResultCards';
import { cn } from '../lib/cn';

type Tab = 'dishes' | 'restaurants';

export interface SearchPageProps {
  renderAction?: (item: MenuItem, restaurant: Restaurant) => ReactNode;
}

export function SearchPage({ renderAction }: SearchPageProps = {}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const areaId = useLocationStore((s) => s.areaId);
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [chosenTab, setTab] = useState<Tab>('dishes');
  const recent = useRecentSearches();
  const { data, isFetching } = useSearch(areaId, q);
  const tabsId = useId();

  // Keep the URL in sync with what's typed (debounced), so results are shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim() !== q) setParams(input.trim() ? { q: input.trim() } : {}, { replace: true });
    }, 250);
    return () => clearTimeout(t);
  }, [input, q, setParams]);

  useEffect(() => {
    if (q.length >= 2 && data) recent.add(q);
    // Remember the term only once results arrived.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, data]);

  // If the chosen tab has no matches but the other one does, show the other one.
  const counts = { dishes: data?.dishes.length ?? 0, restaurants: data?.restaurants.length ?? 0 };
  const other: Tab = chosenTab === 'dishes' ? 'restaurants' : 'dishes';
  const tab: Tab = counts[chosenTab] === 0 && counts[other] > 0 ? other : chosenTab;

  if (!areaId) {
    return (
      <EmptyState
        title="Set your location first"
        description="We need to know where to deliver to show you dishes nearby."
        action={
          <Link to="/">
            <Button>Choose location</Button>
          </Link>
        }
      />
    );
  }

  const searching = q.length >= 2;

  return (
    <div className="container-page max-w-3xl pt-4 pb-24 md:pt-8">
      <div className="sticky top-16 z-20 -mx-4 bg-white px-4 pb-3 md:top-20 md:mx-0 md:px-0">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-sunken md:hidden"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <label className="relative flex-1">
            <span className="sr-only">Search for restaurants and food</span>
            <input
              autoFocus
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search for restaurants and food"
              className="h-12 w-full rounded-xl border border-line bg-white pr-11 pl-4 text-[15px] font-semibold placeholder:font-medium placeholder:text-muted focus:border-ink/40 focus:outline-none md:h-14 md:text-base"
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">
              {isFetching ? (
                <Loader2 className="size-5 animate-spin" aria-label="Searching" />
              ) : input ? (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  aria-label="Clear search"
                  className="inline-flex"
                >
                  <X className="size-5" />
                </button>
              ) : (
                <Search className="size-5" aria-hidden />
              )}
            </span>
          </label>
        </div>

        {searching && data && (
          <div role="tablist" aria-label="Result type" className="mt-3 flex gap-2">
            {(['dishes', 'restaurants'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                id={`${tabsId}-${t}`}
                aria-selected={tab === t}
                aria-controls={`${tabsId}-panel`}
                onClick={() => setTab(t)}
                className={cn(
                  'h-9 rounded-full border px-4 text-sm font-bold transition-colors',
                  tab === t
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-white text-ink-soft hover:border-ink/30',
                )}
              >
                {t === 'dishes' ? 'Dishes' : 'Restaurants'} ({counts[t]})
              </button>
            ))}
          </div>
        )}
      </div>

      {!searching && (
        <div className="mt-4 space-y-8">
          {recent.terms.length > 0 && (
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Recent searches</h2>
                <button
                  type="button"
                  onClick={recent.clear}
                  className="text-sm font-bold text-brand-600"
                >
                  Clear
                </button>
              </div>
              <ul className="mt-2">
                {recent.terms.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => setInput(t)}
                      className="flex w-full items-center gap-3 py-2.5 text-left font-medium hover:text-brand-600"
                    >
                      <Clock3 className="size-4 text-muted" aria-hidden /> {t}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-lg font-extrabold">Popular cuisines</h2>
            <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5">
              {CUISINE_SHORTCUTS.map((c) => (
                <button
                  key={c.cuisine}
                  type="button"
                  onClick={() => setInput(c.label === 'Healthy' ? 'Healthy' : c.cuisine)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <Img
                    src={c.image}
                    kind="dish"
                    alt=""
                    sizes="72px"
                    className="size-16 rounded-full md:size-20"
                  />
                  <span className="text-xs font-semibold text-ink-soft md:text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {searching && data && (
        <div
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${tab}`}
          className="-mx-4 mt-1 min-h-[50vh] bg-sunken px-4 py-4 md:mx-0 md:rounded-3xl"
        >
          {tab === 'dishes' ? (
            data.dishes.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.dishes.map((hit) => (
                  <DishResult
                    key={hit.item.id}
                    hit={hit}
                    action={renderAction?.(hit.item, hit.restaurant)}
                  />
                ))}
              </div>
            ) : (
              <NoResults q={q} />
            )
          ) : data.restaurants.length ? (
            <div className="space-y-3">
              {data.restaurants.map((hit) => (
                <RestaurantResult key={hit.restaurant.id} restaurant={hit.restaurant} />
              ))}
            </div>
          ) : (
            <NoResults q={q} />
          )}
        </div>
      )}
    </div>
  );
}

function NoResults({ q }: { q: string }) {
  return (
    <EmptyState
      title={`No results for "${q}"`}
      description="Check the spelling or try something more general, like 'biryani' or 'pizza'."
    />
  );
}
