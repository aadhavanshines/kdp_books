import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db";
import { emailOutbox } from "../db/schema";
import type { EmailContent } from "./templates";

const enqueueSchema = z.object({
  to: z.email(),
  kind: z.string().min(1),
  workspaceId: z.uuid().nullish(),
});

/** Store an email in the outbox. Nothing is sent from here. */
export async function enqueueEmail(
  db: Db,
  input: { to: string; kind: string; workspaceId?: string | null } & EmailContent,
) {
  const meta = enqueueSchema.parse(input);
  const [row] = await db
    .insert(emailOutbox)
    .values({
      to: meta.to.toLowerCase(),
      kind: meta.kind,
      workspaceId: meta.workspaceId ?? null,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    .returning();
  if (!row) throw new Error("Failed to enqueue email");
  return row;
}

export async function listOutbox(db: Db, limit = 100) {
  return db.select().from(emailOutbox).orderBy(desc(emailOutbox.createdAt)).limit(limit);
}

export async function getOutboxEmail(db: Db, id: string) {
  if (!z.uuid().safeParse(id).success) return undefined;
  const [row] = await db.select().from(emailOutbox).where(eq(emailOutbox.id, id));
  return row;
}

/** Pull the first http(s) link out of an email's text body (for tests and /dev/mail). */
export function firstLink(text: string): string | undefined {
  return /https?:\/\/\S+/.exec(text)?.[0];
}
