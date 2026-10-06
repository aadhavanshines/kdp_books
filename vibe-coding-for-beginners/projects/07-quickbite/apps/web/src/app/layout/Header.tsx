import { BadgePercent, ChevronDown, LifeBuoy, MapPin, Search, UserRound } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { Logo } from '../../components/Logo';
import { cn } from '../../lib/cn';
import { useArea } from '../../features/catalog/queries';
import { LocationSheet } from '../../features/location/LocationSheet';
import { useLocationStore } from '../../features/location/locationStore';
import { CartNavLink } from './CartNavLink';

export function Header() {
  const areaId = useLocationStore((s) => s.areaId);
  const { data: area } = useArea(areaId);
  const [locationOpen, setLocationOpen] = useState(false);
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white transition-shadow',
        scrolled && 'shadow-[0_2px_16px_rgb(28_25_23/0.08)]',
      )}
    >
      <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-8">
        <Link to="/" className="shrink-0" aria-label="QuickBite home">
          <Logo className="hidden md:inline-flex" />
          <Logo compact className="md:hidden" />
        </Link>

        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="group flex min-w-0 items-center gap-1.5 text-left"
          aria-label={
            area
              ? `Delivering to ${area.name}, ${area.city}. Change location`
              : 'Choose delivery location'
          }
        >
          <MapPin className="size-5 shrink-0 text-brand-500 md:hidden" aria-hidden />
          <span className="min-w-0">
            <span className="flex items-center gap-1">
              <span className="truncate text-[15px] font-extrabold underline decoration-2 underline-offset-[6px] group-hover:text-brand-600 md:no-underline">
                {area ? area.name : 'Set location'}
              </span>
              <ChevronDown className="size-4 shrink-0 text-brand-500" aria-hidden />
            </span>
            <span className="block truncate text-xs text-muted md:hidden">
              {area ? area.city : 'To see restaurants near you'}
            </span>
          </span>
          <span className="hidden truncate text-sm text-muted md:inline">
            {area ? area.city : ''}
          </span>
        </button>

        <nav aria-label="Main" className="ml-auto flex items-center gap-1 md:gap-2">
          <HeaderLink to="/search" icon={<Search className="size-5" />} label="Search" />
          <HeaderLink
            to="/offers"
            icon={<BadgePercent className="size-5" />}
            label="Offers"
            desktopOnly
          />
          <HeaderLink to="/help" icon={<LifeBuoy className="size-5" />} label="Help" desktopOnly />
          <HeaderLink to="/account" icon={<UserRound className="size-5" />} label="Sign in" />
          <CartNavLink />
        </nav>
      </div>
      <LocationSheet open={locationOpen} onOpenChange={setLocationOpen} />
    </header>
  );
}

function HeaderLink({
  to,
  icon,
  label,
  desktopOnly,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  desktopOnly?: boolean;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'inline-flex h-10 items-center gap-2 rounded-full px-2.5 font-semibold text-ink-soft transition-colors hover:text-brand-600 lg:px-3',
          isActive && 'text-brand-600',
          desktopOnly && 'hidden lg:inline-flex',
        )
      }
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  );
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}
