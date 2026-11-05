import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Db } from "../db";

/** Any table that belongs to a workspace (has a `workspaceId` column). */
export type WorkspaceTable = PgTable & { workspaceId: AnyPgColumn };

type Insert<T extends WorkspaceTable> = Omit<T["$inferInsert"], "workspaceId">;
type Select<T extends WorkspaceTable> = T["$inferSelect"];
type Update<T extends WorkspaceTable> = Partial<Omit<T["$inferInsert"], "workspaceId">>;

export interface SelectOptions {
  where?: SQL | undefined;
  orderBy?: SQL | AnyPgColumn | (SQL | AnyPgColumn)[];
  limit?: number;
  offset?: number;
}

/*
 * Drizzle's builders are typed per concrete table, so calling them with a
 * generic `T` loses the row type. The `as never` / `as Select<T>[]` casts
 * below restore it; the runtime behaviour is plain Drizzle.
 */

/**
 * The only way product code touches product tables. Every read, update and
 * delete is filtered by `workspace_id`, and every insert has it set, from the
 * id given here (which must come from the server-side session context).
 *
 *   const s = scoped(db, ctx.workspace.id);
 *   await s.insert(clients, { name: "Asha" });
 *   const rows = await s.select(clients, { where: ilike(clients.name, "%a%") });
 */
export function scoped(db: Db, workspaceId: string) {
  if (!workspaceId) throw new Error("scoped() needs a workspace id");

  const owned = (table: WorkspaceTable, where?: SQL): SQL =>
    and(eq(table.workspaceId, workspaceId), where) as SQL;

  return {
    workspaceId,

    /** The workspace filter for a table, for joins and custom queries. */
    filter: owned,

    async select<T extends WorkspaceTable>(table: T, opts: SelectOptions = {}): Promise<Select<T>[]> {
      let q = db.select().from(table as never).where(owned(table, opts.where)).$dynamic();
      if (opts.orderBy) q = q.orderBy(...(Array.isArray(opts.orderBy) ? opts.orderBy : [opts.orderBy]));
      if (opts.limit !== undefined) q = q.limit(opts.limit);
      if (opts.offset !== undefined) q = q.offset(opts.offset);
      return (await q) as Select<T>[];
    },

    async first<T extends WorkspaceTable>(table: T, where?: SQL): Promise<Select<T> | undefined> {
      const rows = (await db.select().from(table as never).where(owned(table, where)).limit(1)) as Select<T>[];
      return rows[0];
    },

    async count<T extends WorkspaceTable>(table: T, where?: SQL): Promise<number> {
      return db.$count(table, owned(table, where));
    },

    async insert<T extends WorkspaceTable>(table: T, values: Insert<T> | Insert<T>[]): Promise<Select<T>[]> {
      const list = Array.isArray(values) ? values : [values];
      if (list.length === 0) return [];
      // workspaceId is written last so a stray value in `values` can't override it.
      const rows = list.map((v) => ({ ...v, workspaceId }));
      return (await db.insert(table).values(rows as never).returning()) as Select<T>[];
    },

    async update<T extends WorkspaceTable>(table: T, set: Update<T>, where?: SQL): Promise<Select<T>[]> {
      // Rows can never be moved to another workspace.
      const { workspaceId: _ignored, ...safe } = set as Record<string, unknown>;
      void _ignored;
      return (await db
        .update(table)
        .set(safe as never)
        .where(owned(table, where))
        .returning()) as Select<T>[];
    },

    async delete<T extends WorkspaceTable>(table: T, where?: SQL): Promise<Select<T>[]> {
      return (await db.delete(table).where(owned(table, where)).returning()) as Select<T>[];
    },
  };
}

export type ScopedDb = ReturnType<typeof scoped>;
