import { nearest, type Area } from '@quickbite/core';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Sheet } from '../../components/ui/Sheet';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAreas } from '../catalog/queries';
import { useLocationStore } from './locationStore';

interface LocationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationSheet({ open, onOpenChange }: LocationSheetProps) {
  const setArea = useLocationStore((s) => s.setArea);
  const choose = (area: Area) => {
    setArea(area.id);
    onOpenChange(false);
  };
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Choose a delivery location"
      description="We'll show restaurants that deliver there."
    >
      <AreaPicker onPick={choose} />
    </Sheet>
  );
}

/** Area search + "use my location" + list grouped by city. Used in the sheet and on the landing page. */
export function AreaPicker({
  onPick,
  autoFocus = true,
}: {
  onPick: (area: Area) => void;
  autoFocus?: boolean;
}) {
  const { data: areas, isLoading } = useAreas();
  const [query, setQuery] = useState('');
  const [geo, setGeo] = useState<'idle' | 'locating' | 'denied' | 'unsupported'>('idle');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (areas ?? []).filter(
      (a) => !q || a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q),
    );
    const byCity = new Map<string, Area[]>();
    for (const area of list) byCity.set(area.city, [...(byCity.get(area.city) ?? []), area]);
    return [...byCity.entries()];
  }, [areas, query]);

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeo('unsupported');
      return;
    }
    setGeo('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const closest = nearest(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          areas ?? [],
        );
        setGeo('idle');
        if (closest) onPick(closest);
      },
      () => setGeo('denied'),
      { timeout: 10_000, maximumAge: 300_000 },
    );
  };

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search for your area</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for area, e.g. Koramangala"
          className="h-12 w-full rounded-xl border border-line bg-white pr-4 pl-11 text-[15px] font-medium placeholder:font-normal placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={!areas || geo === 'locating'}
        className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-brand-50 disabled:opacity-60"
      >
        {geo === 'locating' ? (
          <Loader2 className="size-5 animate-spin text-brand-600" />
        ) : (
          <Crosshair className="size-5 text-brand-600" />
        )}
        <span>
          <span className="block font-bold text-brand-700">Use my current location</span>
          <span className="block text-sm text-muted">
            {geo === 'denied'
              ? 'Location permission was denied. Pick your area below.'
              : geo === 'unsupported'
                ? 'Your browser cannot share location. Pick your area below.'
                : 'Finds the nearest area we deliver to'}
          </span>
        </span>
      </button>

      <div className="mt-2 space-y-5">
        {isLoading &&
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        {grouped.map(([city, list]) => (
          <section key={city}>
            <h3 className="px-2 pb-1 text-xs font-bold tracking-wider text-muted uppercase">
              {city}
            </h3>
            <ul>
              {list.map((area) => (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => onPick(area)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-sunken"
                  >
                    <MapPin className="size-5 shrink-0 text-muted" aria-hidden />
                    <span>
                      <span className="block font-semibold">{area.name}</span>
                      <span className="block text-sm text-muted">{area.city}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {areas && grouped.length === 0 && (
          <p className="px-2 py-6 text-center text-muted">
            We don't deliver to "{query}" yet. Try another area.
          </p>
        )}
      </div>
    </div>
  );
}
