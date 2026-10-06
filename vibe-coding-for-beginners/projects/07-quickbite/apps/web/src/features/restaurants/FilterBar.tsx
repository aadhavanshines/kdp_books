import { activeFilterCount, type RestaurantSort } from '@quickbite/core';
import { ChevronDown, SlidersHorizontal, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Sheet } from '../../components/ui/Sheet';
import { VegMark } from '../../components/ui/VegMark';
import { cn } from '../../lib/cn';
import { SORT_LABELS, type RestaurantFiltersApi } from './useRestaurantFilters';

export function FilterBar({ api, className }: { api: RestaurantFiltersApi; className?: string }) {
  const [sortOpen, setSortOpen] = useState(false);
  const { filters, sort } = api;
  const count = activeFilterCount(filters) + (sort === 'relevance' ? 0 : 1);

  return (
    <div
      className={cn(
        'no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0',
        className,
      )}
      role="toolbar"
      aria-label="Filters"
    >
      <Chip
        onClick={() => setSortOpen(true)}
        icon={<SlidersHorizontal className="size-4" />}
        selected={count > 0}
      >
        Filter
        {count > 0 && (
          <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">
            {count}
          </span>
        )}
      </Chip>
      <Chip onClick={() => setSortOpen(true)}>
        {sort === 'relevance' ? 'Sort by' : SORT_LABELS[sort].split(':')[0]}
        <ChevronDown className="size-4" aria-hidden />
      </Chip>
      <Chip
        selected={filters.fastDelivery}
        removable
        onClick={api.toggleFast}
        icon={<Zap className="size-4 text-brand-500" aria-hidden />}
      >
        Fast Delivery
      </Chip>
      <Chip selected={filters.ratingFourPlus} removable onClick={api.toggleRating}>
        Ratings 4.0+
      </Chip>
      <Chip
        selected={filters.pureVeg}
        removable
        onClick={api.togglePureVeg}
        icon={<VegMark veg decorative className="size-3.5" />}
      >
        Pure Veg
      </Chip>
      <Chip selected={filters.offers} removable onClick={api.toggleOffers}>
        Offers
      </Chip>
      {filters.cuisine && (
        <Chip selected removable onClick={() => api.setCuisine(null)}>
          {filters.cuisine}
        </Chip>
      )}
      <SortSheet open={sortOpen} onOpenChange={setSortOpen} api={api} />
    </div>
  );
}

function SortSheet({
  open,
  onOpenChange,
  api,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  api: RestaurantFiltersApi;
}) {
  const { sort, filters } = api;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Sort and filter"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" block onClick={api.clearAll}>
            Clear all
          </Button>
          <Button block onClick={() => onOpenChange(false)}>
            Show restaurants
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="text-sm font-bold tracking-wide text-muted uppercase">Sort by</legend>
        <div className="mt-2 divide-y divide-line">
          {(Object.keys(SORT_LABELS) as RestaurantSort[]).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center justify-between py-3.5 font-semibold"
            >
              {SORT_LABELS[value]}
              <input
                type="radio"
                name="sort"
                value={value}
                checked={sort === value}
                onChange={() => api.setSort(value)}
                className="size-5 accent-brand-600"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="text-sm font-bold tracking-wide text-muted uppercase">Filters</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip selected={filters.fastDelivery} onClick={api.toggleFast}>
            Fast Delivery (≤ 30 mins)
          </Chip>
          <Chip selected={filters.ratingFourPlus} onClick={api.toggleRating}>
            Ratings 4.0+
          </Chip>
          <Chip selected={filters.pureVeg} onClick={api.togglePureVeg}>
            Pure Veg
          </Chip>
          <Chip selected={filters.offers} onClick={api.toggleOffers}>
            Offers
          </Chip>
        </div>
      </fieldset>
    </Sheet>
  );
}
