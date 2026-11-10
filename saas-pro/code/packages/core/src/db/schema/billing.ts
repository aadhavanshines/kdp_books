/**
 * Billing tables. A workspace with no `subscriptions` row is on Free.
 * State changes come only from verified provider webhooks (see billing/webhooks.ts).
 */
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { workspaces } from "./workspace";

export const planIdEnum = pgEnum("plan_id", ["free", "pro", "business"]);
export const billingIntervalEnum = pgEnum("billing_interval", ["month", "year"]);
export const billingProviderEnum = pgEnum("billing_provider", ["fake", "razorpay", "stripe"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "canceled"]);
export const checkoutStatusEnum = pgEnum("checkout_status", ["open", "paid", "failed", "canceled"]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** "billora", "slotra", ... (one database per app, but rows say which product). */
    product: text("product").notNull(),
    plan: planIdEnum("plan").notNull(),
    interval: billingIntervalEnum("interval").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    provider: billingProviderEnum("provider").notNull(),
    providerSubscriptionId: text("provider_subscription_id"),
    providerCustomerId: text("provider_customer_id"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** Cancellation requested; the plan stays until the period ends. */
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    /** A downgrade requested for the end of the period. */
    pendingPlan: planIdEnum("pending_plan"),
    pendingInterval: billingIntervalEnum("pending_interval"),
    pastDueSince: timestamp("past_due_since", { withTimezone: true }),
    graceEndsAt: timestamp("grace_ends_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("subscriptions_workspace_product_uq").on(t.workspaceId, t.product),
    uniqueIndex("subscriptions_provider_sub_uq").on(t.provider, t.providerSubscriptionId),
  ],
);

/** A server-created checkout. Plan and amount are fixed here, never by the browser. */
export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    product: text("product").notNull(),
    kind: text("kind").$type<"subscription" | "one_time">().notNull(),
    plan: planIdEnum("plan"),
    interval: billingIntervalEnum("interval"),
    description: text("description").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    provider: billingProviderEnum("provider").notNull(),
    /** Razorpay subscription/order id, Stripe Checkout Session id, or the fake's id. */
    providerRef: text("provider_ref"),
    status: checkoutStatusEnum("status").notNull().default("open"),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("checkout_sessions_workspace_idx").on(t.workspaceId, t.createdAt)],
);

/** Every webhook event id we've seen. The unique index makes processing exactly-once. */
export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: billingProviderEnum("provider").notNull(),
    eventId: text("event_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").$type<unknown>().notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    /** What processing did, e.g. "activated", "ignored: unknown subscription". */
    outcome: text("outcome"),
  },
  (t) => [uniqueIndex("billing_events_provider_event_uq").on(t.provider, t.eventId)],
);

/** Provider-side plan/price ids we created for (product, plan, interval, amount). */
export const providerPlans = pgTable(
  "provider_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: billingProviderEnum("provider").notNull(),
    product: text("product").notNull(),
    plan: planIdEnum("plan").notNull(),
    interval: billingIntervalEnum("interval").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    providerPlanId: text("provider_plan_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("provider_plans_key_uq").on(t.provider, t.product, t.plan, t.interval, t.amountPaise),
    uniqueIndex("provider_plans_id_uq").on(t.provider, t.providerPlanId),
  ],
);

/**
 * Our invoices to the workspace for its subscription (not the product's own
 * invoices). Kept when a workspace is deleted: tax records must be retained.
 */
export const billingInvoices = pgTable(
  "billing_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    product: text("product").notNull(),
    /** e.g. BLR/2026-27/000042: sequential per financial year. */
    number: text("number").notNull().unique(),
    provider: billingProviderEnum("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull(),
    plan: planIdEnum("plan").notNull(),
    interval: billingIntervalEnum("interval").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    /** Snapshot of the buyer at the time of the invoice. */
    customerName: text("customer_name").notNull(),
    customerCountry: text("customer_country").notNull(),
    customerState: text("customer_state"),
    customerGstin: text("customer_gstin"),
    subtotalPaise: integer("subtotal_paise").notNull(),
    cgstPaise: integer("cgst_paise").notNull().default(0),
    sgstPaise: integer("sgst_paise").notNull().default(0),
    igstPaise: integer("igst_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("billing_invoices_payment_uq").on(t.provider, t.providerPaymentId),
    index("billing_invoices_workspace_idx").on(t.workspaceId, t.issuedAt),
  ],
);

/** Monthly (or all-time, period = "all") usage counters per workspace and metric. */
export const usageCounters = pgTable(
  "usage_counters",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    metric: text("metric").notNull(),
    /** "2026-11" for monthly metrics in the workspace's time zone. */
    period: text("period").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("usage_counters_pk").on(t.workspaceId, t.metric, t.period)],
);

/** Named counters for sequences such as invoice numbers. */
export const counters = pgTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

/** Fixed-window rate limits shared by every app instance. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limits_window_idx").on(t.windowStart)],
);
