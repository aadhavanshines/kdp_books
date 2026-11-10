import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Key, ReactNode } from "react";
import { cn } from "../cn";

export type SortDir = "asc" | "desc";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Hide on small screens (below `sm`). */
  hideOnMobile?: boolean;
  className?: string;
  /** Makes the header a sort link (needs `sortHref` on the table). */
  sortKey?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => Key;
  caption?: string;
  empty?: ReactNode;
  className?: string;
  /** The current sort, usually parsed from the URL. */
  sort?: { key: string; dir: SortDir } | undefined;
  /** Builds the link for sorting by `key` in `dir`. */
  sortHref?: (key: string, dir: SortDir) => string;
}

function SortHeader({ label, sortKey, sort, sortHref, alignRight }: { label: ReactNode; sortKey: string; sort: DataTableProps<unknown>["sort"]; sortHref: (key: string, dir: SortDir) => string; alignRight: boolean }) {
  const active = sort?.key === sortKey;
  // First click sorts ascending; clicking the active column flips it.
  const next: SortDir = active && sort?.dir === "asc" ? "desc" : "asc";
  const Icon = !active ? ArrowUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <a
      href={sortHref(sortKey, next)}
      className={cn("-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", active && "text-foreground", alignRight && "flex-row-reverse")}
    >
      {label}
      <Icon className={cn("size-3.5 shrink-0", !active && "opacity-50")} aria-hidden />
      <span className="sr-only">{active ? `, sorted ${sort?.dir === "asc" ? "ascending" : "descending"}. Sort ${next === "asc" ? "ascending" : "descending"}` : ", sort ascending"}</span>
    </a>
  );
}

/**
 * A server-renderable data table. Sorting, filtering and pagination are
 * driven by the page (search params), so the table stays simple and fast.
 */
export function DataTable<T>({ columns, rows, rowKey, caption, empty, className, sort, sortHref }: DataTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm tabular-nums">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => {
              const sortable = Boolean(c.sortKey && sortHref);
              const ariaSort = sortable && sort?.key === c.sortKey ? (sort.dir === "asc" ? "ascending" : "descending") : undefined;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn("h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", c.align === "right" ? "text-right" : "text-left", c.hideOnMobile && "hidden sm:table-cell", c.className)}
                >
                  {sortable ? <SortHeader label={c.header} sortKey={c.sortKey!} sort={sort} sortHref={sortHref!} alignRight={c.align === "right"} /> : c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-muted/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 align-middle first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", c.align === "right" && "text-right", c.hideOnMobile && "hidden sm:table-cell", c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const pageLink = "inline-flex h-8 items-center gap-1 rounded-control border border-input bg-surface px-2.5 text-[13px] font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring";

/** "Showing 21–40 of 134" with previous/next links. Pages start at 1. */
export function Pagination({ page, pageSize, total, hrefFor, label = "Pagination", className }: { page: number; pageSize: number; total: number; hrefFor: (page: number) => string; label?: string; className?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-[13px] text-muted-foreground sm:px-6", className)}>
      <p aria-live="polite">
        {total === 0 ? "No results" : <>Showing <span className="font-medium text-foreground tabular-nums">{fmt(from)}–{fmt(to)}</span> of <span className="font-medium text-foreground tabular-nums">{fmt(total)}</span></>}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {current > 1 ? (
            <a href={hrefFor(current - 1)} className={pageLink} rel="prev"><ChevronLeft className="size-4" aria-hidden /> Previous</a>
          ) : (
            <span className={cn(pageLink, "pointer-events-none opacity-50")} aria-disabled="true"><ChevronLeft className="size-4" aria-hidden /> Previous</span>
          )}
          <span className="tabular-nums">Page {current} of {pages}</span>
          {current < pages ? (
            <a href={hrefFor(current + 1)} className={pageLink} rel="next">Next <ChevronRight className="size-4" aria-hidden /></a>
          ) : (
            <span className={cn(pageLink, "pointer-events-none opacity-50")} aria-disabled="true">Next <ChevronRight className="size-4" aria-hidden /></span>
          )}
        </div>
      )}
    </nav>
  );
}
