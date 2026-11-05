"use client";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useTransition } from "react";
import { cn } from "../cn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";
import type { LinkComponent, ShellWorkspace } from "./types";

export function WorkspaceSwitcher({ workspaces, currentId, onSwitch, createHref, Link }: { workspaces: ShellWorkspace[]; currentId: string; onSwitch: (id: string) => Promise<void>; createHref: string; Link: LinkComponent }) {
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  const [pending, start] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex w-full items-center gap-2.5 rounded-control border border-border bg-surface px-2.5 py-2 text-left shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", pending && "opacity-60")}
        aria-label={`Workspace: ${current?.name ?? ""}. Switch workspace`}
      >
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent-soft-foreground">
          {current?.name.charAt(0).toUpperCase()}
        </span>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-medium text-foreground">{current?.name}</span>
          <span className="truncate text-xs capitalize text-muted-foreground">{current?.role}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onSelect={() => w.id !== currentId && start(() => onSwitch(w.id))}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-semibold">{w.name.charAt(0).toUpperCase()}</span>
            <span className="min-w-0 flex-1 truncate">{w.name}</span>
            {w.id === currentId && <Check className="!text-primary" aria-label="Current workspace" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={createHref}>
            <Plus /> New workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
