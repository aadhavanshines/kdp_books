"use client";
import { AppShell, UserMenu, WorkspaceSwitcher, type NavSection, type ShellWorkspace } from "@saas/ui/shell";
import { Badge } from "@saas/ui";
import { Building2, LayoutDashboard, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const sections: NavSection[] = [
  { items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Settings",
    items: [
      { href: "/app/settings/workspace", label: "Workspace", icon: Building2 },
      { href: "/app/settings/team", label: "Team", icon: Users },
      { href: "/app/settings/profile", label: "Profile", icon: UserRound },
    ],
  },
];

export function BilloraShell(props: {
  user: { name: string; email: string; image?: string | null | undefined };
  workspaces: ShellWorkspace[];
  currentWorkspaceId: string;
  switchWorkspace: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AppShell
      product="Billora"
      homeHref="/app"
      sections={sections}
      currentPath={pathname}
      Link={Link}
      switcher={<WorkspaceSwitcher workspaces={props.workspaces} currentId={props.currentWorkspaceId} onSwitch={props.switchWorkspace} createHref="/onboarding?new=1" Link={Link} />}
      sidebarFooter={
        // Placeholder until billing lands: the Free plan's invoice limit.
        <div className="grid gap-2 px-1.5">
          <div className="flex items-center justify-between">
            <Badge tone="primary">Free plan</Badge>
            <span className="text-xs tabular-nums text-muted-foreground">0 / 5 invoices</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label="Invoices this month" aria-valuemin={0} aria-valuemax={5} aria-valuenow={0}>
            <div className="h-full w-0 rounded-full bg-primary" />
          </div>
        </div>
      }
      topBarStart={<span className="block truncate text-sm font-medium lg:hidden">{props.workspaces.find((w) => w.id === props.currentWorkspaceId)?.name}</span>}
      topBarEnd={<UserMenu user={props.user} profileHref="/app/settings/profile" onSignOut={props.signOut} Link={Link} />}
    >
      {props.children}
    </AppShell>
  );
}
