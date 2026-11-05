import type { ComponentType, ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Match child routes too (e.g. /app/settings matches /app/settings/team). */
  matchPrefix?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface ShellWorkspace {
  id: string;
  name: string;
  role: string;
}

/** Any link component with an href (e.g. next/link). */
export type LinkComponent = ComponentType<{
  href: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
}>;
