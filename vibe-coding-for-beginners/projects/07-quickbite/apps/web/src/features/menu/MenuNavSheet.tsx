import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Sheet } from '../../components/ui/Sheet';
import { cn } from '../../lib/cn';

export interface MenuSection {
  id: string;
  name: string;
  count: number;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Floating "MENU" button on phones that jumps to a category. */
export function MenuNavButton({ sections, raised }: { sections: MenuSection[]; raised?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed right-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-extrabold tracking-wide text-white shadow-raised transition-[bottom] lg:hidden',
          raised ? 'bottom-24' : 'bottom-6',
        )}
      >
        <BookOpen className="size-5" aria-hidden /> MENU
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Menu">
        <ul className="divide-y divide-line">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-3.5 text-left font-semibold"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => scrollToSection(s.id), 200);
                }}
              >
                {s.name}
                <span className="text-muted">{s.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}

/** Sticky category list on desktop. */
export function MenuNavRail({
  sections,
  activeId,
}: {
  sections: MenuSection[];
  activeId: string | null;
}) {
  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-28 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto lg:block"
    >
      <ul className="space-y-1 border-r border-line pr-4">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={cn(
                'w-full rounded-lg py-2 pr-2 pl-3 text-left text-[15px] font-semibold transition-colors',
                activeId === s.id ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-sunken',
              )}
            >
              {s.name} <span className="font-medium text-muted">({s.count})</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
