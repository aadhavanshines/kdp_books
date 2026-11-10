import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const roleEnum = pgEnum("workspace_role", ["owner", "admin", "member"]);
export type Role = (typeof roleEnum.enumValues)[number];

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  timeZone: text("time_zone").notNull().default("Asia/Kolkata"),
  /** ISO 3166-1 alpha-2, e.g. "IN". Decides the payment provider later. */
  billingCountry: text("billing_country").notNull().default("IN"),
  /** For India, the GST state code ("29" = Karnataka); free text elsewhere. */
  billingState: text("billing_state"),
  gstin: text("gstin"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("memberships_workspace_user_uq").on(t.workspaceId, t.userId),
    // The database itself guarantees at most one owner per workspace.
    uniqueIndex("memberships_one_owner_uq")
      .on(t.workspaceId)
      .where(sql`${t.role} = 'owner'`),
    index("memberships_user_idx").on(t.userId),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: roleEnum("role").notNull(),
    /** SHA-256 of the token in the link; the token itself is never stored. */
    tokenHash: text("token_hash").notNull().unique(),
    invitedByUserId: text("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedByUserId: text("accepted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // One open invitation per email per workspace.
    uniqueIndex("invitations_open_uq")
      .on(t.workspaceId, t.email)
      .where(sql`${t.acceptedAt} is null and ${t.revokedAt} is null`),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_log_workspace_created_idx").on(t.workspaceId, t.createdAt),
    index("audit_log_actor_idx").on(t.actorUserId),
  ],
);

export const emailStatusEnum = pgEnum("email_status", ["pending", "sent", "failed"]);

/** Every email is written here first. The sender (email/sender.ts) delivers it. */
export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text").notNull(),
    /** e.g. "auth.verify", "auth.magic_link", "team.invite". */
    kind: text("kind").notNull(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    status: emailStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    /** When the sender may next try (backoff after a failure). */
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    /** A sender claimed the row until then, so two instances never send it twice. */
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastError: text("last_error"),
    providerMessageId: text("provider_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [index("email_outbox_status_created_idx").on(t.status, t.createdAt), index("email_outbox_due_idx").on(t.status, t.nextAttemptAt)],
);
