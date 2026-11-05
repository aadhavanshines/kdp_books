import type { Key, ReactNode } from "react";
import { cn } from "../cn";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Hide on small screens (below `sm`). */
  hideOnMobile?: boolean;
  className?: string;
}

/**
 * A server-renderable data table. Sorting, filtering and pagination are
 * driven by the page (search params), so the table stays simple and fast.
 */
export function DataTable<T>({ columns, rows, rowKey, caption, empty, className }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => Key; caption?: string; empty?: ReactNode; className?: string }) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm tabular-nums">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", c.align === "right" ? "text-right" : "text-left", c.hideOnMobile && "hidden sm:table-cell", c.className)}>
                {c.header}
              </th>
            ))}
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
