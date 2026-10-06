import { Img } from '../../components/ui/Img';
import { HorizontalScroller } from '../../components/ui/HorizontalScroller';
import { cn } from '../../lib/cn';
import { CUISINE_SHORTCUTS } from './cuisines';

interface CuisineRailProps {
  selected: string | null;
  onSelect: (cuisine: string | null) => void;
  title: string;
}

export function CuisineRail({ selected, onSelect, title }: CuisineRailProps) {
  return (
    <HorizontalScroller title={title} titleId="cuisines-heading" listClassName="gap-3 md:gap-5">
      {CUISINE_SHORTCUTS.map((c) => {
        const active = selected?.toLowerCase() === c.cuisine.toLowerCase();
        return (
          <button
            key={c.cuisine}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? null : c.cuisine)}
            className="group flex w-[88px] shrink-0 snap-start flex-col items-center gap-2 md:w-[120px]"
          >
            <span
              className={cn(
                'block size-[84px] overflow-hidden rounded-full ring-offset-2 transition md:size-[112px]',
                active ? 'ring-[3px] ring-brand-500' : 'group-hover:ring-2 group-hover:ring-line',
              )}
            >
              <Img src={c.image} kind="dish" alt="" sizes="112px" className="size-full scale-110" />
            </span>
            <span
              className={cn(
                'text-sm font-semibold md:text-[15px]',
                active ? 'text-brand-700' : 'text-ink-soft',
              )}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </HorizontalScroller>
  );
}
