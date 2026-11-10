CREATE TYPE "public"."billing_interval" AS ENUM('month', 'year');--> statement-breakpoint
CREATE TYPE "public"."billing_provider" AS ENUM('fake', 'razorpay', 'stripe');--> statement-breakpoint
CREATE TYPE "public"."checkout_status" AS ENUM('open', 'paid', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."plan_id" AS ENUM('free', 'pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "billing_provider" NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"outcome" text
);
--> statement-breakpoint
CREATE TABLE "billing_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"product" text NOT NULL,
	"number" text NOT NULL,
	"provider" "billing_provider" NOT NULL,
	"provider_payment_id" text NOT NULL,
	"plan" "plan_id" NOT NULL,
	"interval" "billing_interval" NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"customer_name" text NOT NULL,
	"customer_country" text NOT NULL,
	"customer_state" text,
	"customer_gstin" text,
	"subtotal_paise" integer NOT NULL,
	"cgst_paise" integer DEFAULT 0 NOT NULL,
	"sgst_paise" integer DEFAULT 0 NOT NULL,
	"igst_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billing_invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"product" text NOT NULL,
	"kind" text NOT NULL,
	"plan" "plan_id",
	"interval" "billing_interval",
	"description" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"provider" "billing_provider" NOT NULL,
	"provider_ref" text,
	"status" "checkout_status" DEFAULT 'open' NOT NULL,
	"created_by_user_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "counters" (
	"key" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "billing_provider" NOT NULL,
	"product" text NOT NULL,
	"plan" "plan_id" NOT NULL,
	"interval" "billing_interval" NOT NULL,
	"amount_paise" integer NOT NULL,
	"provider_plan_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"product" text NOT NULL,
	"plan" "plan_id" NOT NULL,
	"interval" "billing_interval" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"provider" "billing_provider" NOT NULL,
	"provider_subscription_id" text,
	"provider_customer_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"pending_plan" "plan_id",
	"pending_interval" "billing_interval",
	"past_due_since" timestamp with time zone,
	"grace_ends_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"workspace_id" uuid NOT NULL,
	"metric" text NOT NULL,
	"period" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_outbox" ADD COLUMN "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "email_outbox" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "email_outbox" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "email_outbox" ADD COLUMN "provider_message_id" text;--> statement-breakpoint
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_events_provider_event_uq" ON "billing_events" USING btree ("provider","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_invoices_payment_uq" ON "billing_invoices" USING btree ("provider","provider_payment_id");--> statement-breakpoint
CREATE INDEX "billing_invoices_workspace_idx" ON "billing_invoices" USING btree ("workspace_id","issued_at");--> statement-breakpoint
CREATE INDEX "checkout_sessions_workspace_idx" ON "checkout_sessions" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_plans_key_uq" ON "provider_plans" USING btree ("provider","product","plan","interval","amount_paise");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_plans_id_uq" ON "provider_plans" USING btree ("provider","provider_plan_id");--> statement-breakpoint
CREATE INDEX "rate_limits_window_idx" ON "rate_limits" USING btree ("window_start");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_workspace_product_uq" ON "subscriptions" USING btree ("workspace_id","product");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_sub_uq" ON "subscriptions" USING btree ("provider","provider_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_counters_pk" ON "usage_counters" USING btree ("workspace_id","metric","period");--> statement-breakpoint
CREATE INDEX "email_outbox_due_idx" ON "email_outbox" USING btree ("status","next_attempt_at");