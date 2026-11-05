"use client";
import { cn } from "@saas/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/app/settings/workspace", label: "Workspace" },
  { href: "/app/settings/team", label: "Team" },
  { href: "/app/settings/profile", label: "Profile" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings" className="-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative -mb-px inline-flex h-10 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
