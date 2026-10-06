import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface HorizontalScrollerProps {
  title: ReactNode;
  titleId?: string;
  children: ReactNode;
  className?: string;
  listClassName?: string;
}

/** A titled row that scrolls sideways (swipe on phones, arrow buttons on desktop). */
export function HorizontalScroller({
  title,
  titleId,
  children,
  className,
  listClassName,
}: HorizontalScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className={className} aria-labelledby={titleId}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-xl font-extrabold tracking-[-0.01em] md:text-2xl">
          {title}
        </h2>
        <div className="hidden gap-2 md:flex">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              disabled={dir === -1 ? edges.start : edges.end}
              aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
              className="inline-flex size-9 items-center justify-center rounded-full bg-sunken text-ink transition hover:bg-line disabled:opacity-40"
            >
              {dir === -1 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={ref}
        // Focusable so keyboard users can scroll rows whose items aren't links.
        tabIndex={0}
        role="group"
        aria-labelledby={titleId}
        className={cn(
          'no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0',
          listClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
