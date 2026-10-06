import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { HorizontalScroller } from '../components/ui/HorizontalScroller';
import { Skeleton } from '../components/ui/Skeleton';
import { VegMark } from '../components/ui/VegMark';
import { useCoupons, useMenu, useRestaurant } from '../features/catalog/queries';
import { MenuItemRow } from '../features/menu/MenuItemRow';
import { MenuNavButton, MenuNavRail } from '../features/menu/MenuNavSheet';
import { CouponCard, RestaurantHeader } from '../features/menu/RestaurantHeader';
import { useActiveSection } from '../features/menu/useActiveSection';
import { useMenuSections, type MenuFilters } from '../features/menu/useMenuSections';
import { cn } from '../lib/cn';
import type { MenuItem, Restaurant } from '@quickbite/core';

export interface RestaurantPageSlots {
  /** Renders the ADD control for an item (wired to the cart in phase 2). */
  renderAction?: (item: MenuItem, restaurant: Restaurant) => ReactNode;
  /** Right-hand column on desktop (cart summary). */
  aside?: (restaurant: Restaurant) => ReactNode;
  /** Whether a sticky bottom bar is showing (moves the MENU button up). */
  bottomBarVisible?: boolean;
}

export function RestaurantPage(slots: RestaurantPageSlots = {}) {
  const { slug = '' } = useParams();
  const { data: restaurant, isLoading } = useRestaurant(slug);

  if (isLoading) return <RestaurantSkeleton />;
  if (!restaurant) {
    return (
      <EmptyState
        title="Restaurant not found"
        description="It may have moved or stopped delivering here."
        action={
          <Link to="/">
            <Button>See restaurants near you</Button>
          </Link>
        }
      />
    );
  }
  return <RestaurantView restaurant={restaurant} {...slots} />;
}

function RestaurantView({
  restaurant,
  renderAction,
  aside,
  bottomBarVisible,
}: RestaurantPageSlots & { restaurant: Restaurant }) {
  const { data: menu, isLoading } = useMenu(restaurant.id);
  const { data: coupons } = useCoupons(restaurant.brandId);
  const [filters, setFilters] = useState<MenuFilters>({
    vegOnly: false,
    nonVegOnly: false,
    bestsellerOnly: false,
    query: '',
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const sections = useMenuSections(menu, filters);
  const activeId = useActiveSection(sections.map((s) => s.id));
  const navSections = sections.map((s) => ({ id: s.id, name: s.name, count: s.items.length }));
  const hasNonVeg = menu?.items.some((i) => !i.isVeg) ?? false;

  return (
    <div className="container-page pt-3 pb-28 md:pt-6">
      <nav aria-label="Breadcrumb" className="hidden text-sm text-muted md:block">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li>{restaurant.locality}</li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li className="font-semibold text-ink" aria-current="page">
            {restaurant.name}
          </li>
        </ol>
      </nav>

      <div
        className={cn(
          'mt-3 md:mt-6 lg:grid lg:gap-x-10',
          aside ? 'lg:grid-cols-[200px_minmax(0,1fr)_340px]' : 'lg:grid-cols-[200px_minmax(0,1fr)]',
        )}
      >
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <h1 className="text-[26px] font-extrabold tracking-[-0.01em] md:text-3xl">
            {restaurant.name}
          </h1>
          <div className="mt-4">
            <RestaurantHeader restaurant={restaurant} />
          </div>

          {coupons && coupons.length > 0 && (
            <HorizontalScroller
              title="Deals for you"
              titleId="deals-heading"
              className="mt-8"
              listClassName="gap-3"
            >
              {coupons.map((c) => (
                <CouponCard key={c.code} coupon={c} />
              ))}
            </HorizontalScroller>
          )}
        </div>

        <div className="hidden pt-10 lg:col-start-1 lg:row-start-2 lg:block">
          <MenuNavRail sections={navSections} activeId={activeId} />
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-start-2">
          <div
            className="mt-10 flex items-center justify-center gap-3 text-sm font-bold tracking-[0.3em] text-muted"
            aria-hidden
          >
            <span className="h-px w-10 bg-line" /> MENU <span className="h-px w-10 bg-line" />
          </div>

          <label className="relative mt-4 block">
            <span className="sr-only">Search for dishes</span>
            <input
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              placeholder="Search for dishes"
              className="h-12 w-full rounded-xl bg-sunken pr-11 pl-4 text-center text-[15px] font-semibold placeholder:font-semibold placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
            <Search
              className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted"
              aria-hidden
            />
          </label>

          <div
            className="no-scrollbar mt-4 flex gap-2 overflow-x-auto border-b border-line pb-4"
            role="toolbar"
            aria-label="Menu filters"
          >
            <Chip
              selected={filters.vegOnly}
              removable
              onClick={() => setFilters((f) => ({ ...f, vegOnly: !f.vegOnly, nonVegOnly: false }))}
              icon={<VegMark veg decorative className="size-3.5" />}
            >
              Veg
            </Chip>
            {hasNonVeg && (
              <Chip
                selected={filters.nonVegOnly}
                removable
                onClick={() =>
                  setFilters((f) => ({ ...f, nonVegOnly: !f.nonVegOnly, vegOnly: false }))
                }
                icon={<VegMark veg={false} decorative className="size-3.5" />}
              >
                Non-veg
              </Chip>
            )}
            <Chip
              selected={filters.bestsellerOnly}
              removable
              onClick={() => setFilters((f) => ({ ...f, bestsellerOnly: !f.bestsellerOnly }))}
            >
              Bestseller
            </Chip>
          </div>

          {isLoading && <MenuSkeleton />}

          {sections.map((section) => {
            const isCollapsed = collapsed[section.id] ?? false;
            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-h`}
                className="scroll-mt-20 border-b-[14px] border-sunken md:scroll-mt-28 md:border-b md:border-line"
              >
                <h2 id={`${section.id}-h`}>
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !isCollapsed }))}
                    className="flex w-full items-center justify-between py-5 text-left text-lg font-extrabold"
                  >
                    {section.name} ({section.items.length})
                    <ChevronDown
                      className={cn('size-5 transition-transform', isCollapsed && '-rotate-90')}
                      aria-hidden
                    />
                  </button>
                </h2>
                {!isCollapsed && (
                  <div className="divide-y divide-line">
                    {section.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        action={renderAction?.(item, restaurant)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {!isLoading && sections.length === 0 && (
            <EmptyState
              title="No dishes match"
              description="Try a different search or remove a filter."
            />
          )}
        </div>

        {aside && (
          <aside className="hidden lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:block">
            {aside(restaurant)}
          </aside>
        )}
      </div>

      {navSections.length > 1 && <MenuNavButton sections={navSections} raised={bottomBarVisible} />}
    </div>
  );
}

function RestaurantSkeleton() {
  return (
    <div className="container-page max-w-3xl pt-6" aria-busy>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="mt-4 h-40 w-full rounded-3xl" />
      <MenuSkeleton />
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="mt-6 space-y-8" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[120px] w-[132px] rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
