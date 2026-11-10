import { z } from "zod";
import type { SortDir } from "./components/data-table";

export interface TableParams<K extends string> {
  sort: { key: K; dir: SortDir };
  page: number;
  pageSize: number;
  offset: number;
}

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Parse `?sort=&dir=&page=` from search params. Sort keys come from an
 * allow-list, so a URL can never choose an arbitrary column.
 */
export function parseTableParams<K extends string>(raw: Raw, opts: { sortKeys: readonly [K, ...K[]]; defaultSort: { key: NoInfer<K>; dir: SortDir }; pageSize?: number }): TableParams<K> {
  const pageSize = opts.pageSize ?? 20;
  const schema = z.object({
    sort: z.enum(opts.sortKeys).catch(opts.defaultSort.key),
    dir: z.enum(["asc", "desc"]).catch(opts.defaultSort.dir),
    page: z.coerce.number().int().min(1).max(100_000).catch(1),
  });
  const sortGiven = first(raw.sort) !== undefined;
  const p = schema.parse({ sort: first(raw.sort), dir: first(raw.dir), page: first(raw.page) ?? 1 });
  // A bare ?sort=x without dir uses ascending; no sort at all uses the default.
  const dir = first(raw.dir) === undefined ? (sortGiven && p.sort !== opts.defaultSort.key ? "asc" : opts.defaultSort.dir) : p.dir;
  return { sort: { key: p.sort as K, dir }, page: p.page, pageSize, offset: (p.page - 1) * pageSize };
}

/** Build a query string from the current params with some keys changed. */
export function withParams(path: string, current: Raw, changes: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const val = first(v);
    if (val !== undefined && !(k in changes)) q.set(k, val);
  }
  for (const [k, v] of Object.entries(changes)) if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
