"use client";
import { Menu, X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import { useState, type ReactNode } from "react";
import { cn } from "../cn";
import { BrandLogo } from "../components/brand-mark";
import type { LinkComponent, NavItem, NavSection } from "./types";

function isActive(item: NavItem, path: string) {
  return item.matchPrefix ? path === item.href || path.startsWith(item.href + "/") : path === item.href;
}

function Nav({ sections, currentPath, Link, onNavigate }: { sections: NavSection[]; currentPath: string; Link: LinkComponent; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="grid gap-5">
      {sections.map((section, i) => (
        <div key={section.label ?? i} className="grid gap-0.5">
          {section.label && <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>}
          {section.items.map((item) => {
            const active = isActive(item, currentPath);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary-soft text-primary-soft-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export interface AppShellProps {
  product: string;
  homeHref: string;
  sections: NavSection[];
  currentPath: string;
  Link: LinkComponent;
  /** The workspace switcher. */
  switcher: ReactNode;
  /** Bottom of the sidebar: plan badge and usage meter. */
  sidebarFooter?: ReactNode;
  /** Left side of the top bar (search or quick actions). */
  topBarStart?: ReactNode;
  /** Right side of the top bar (notifications, user menu). */
  topBarEnd?: ReactNode;
  children: ReactNode;
}

export function AppShell({ product, homeHref, sections, currentPath, Link, switcher, sidebarFooter, topBarStart, topBarEnd, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-5 px-3 py-4">
      <div className="px-1.5">
        <Link href={homeHref} onClick={onNavigate} className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLogo product={product} />
        </Link>
      </div>
      {switcher}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Nav sections={sections} currentPath={currentPath} Link={Link} {...(onNavigate ? { onNavigate } : {})} />
      </div>
      {sidebarFooter && <div className="border-t border-border pt-4">{sidebarFooter}</div>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a href="#main" className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-ring">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-surface lg:block">{sidebar()}</aside>

      <D.Root open={open} onOpenChange={setOpen}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
          <D.Content className="fixed inset-y-0 left-0 z-50 w-[18rem] max-w-[85vw] border-r border-border bg-surface shadow-pop outline-none lg:hidden" aria-describedby={undefined}>
            <D.Title className="sr-only">Navigation</D.Title>
            <D.Close className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close navigation">
              <X className="size-5" />
            </D.Close>
            {sidebar(() => setOpen(false))}
          </D.Content>
        </D.Portal>
      </D.Root>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/75 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="-ml-1.5 rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">{topBarStart}</div>
          <div className="flex items-center gap-2">{topBarEnd}</div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
