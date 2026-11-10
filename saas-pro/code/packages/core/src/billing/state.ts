/**
 * The subscription state machine, as a pure function so it can be tested
 * exhaustively. Webhook processing (webhooks.ts) loads the row, calls
 * `transition`, and writes the result in the same transaction.
 *
 *   (none) ──activated/charged──▶ active ──payment failed──▶ past_due
 *                                  ▲  │                          │
 *                                  │  │ charged (recovered) ◀────┤
 *                                  │  ▼                          │ grace over (sweep)
 *                      upgrade now │ cancel at period end        ▼
 *                      downgrade at│ period end ───────────▶ canceled (= Free)
 */
import { isUpgrade, type BillingInterval, type PlanId } from "./plans";

export type SubscriptionStatus = "active" | "past_due" | "canceled";

export interface SubState {
  plan: PlanId;
  interval: BillingInterval;
  status: SubscriptionStatus;
  providerSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  pendingPlan: PlanId | null;
  pendingInterval: BillingInterval | null;
  pastDueSince: Date | null;
  graceEndsAt: Date | null;
  canceledAt: Date | null;
}

export const DEFAULT_GRACE_DAYS = 7;

/** Events after the provider's payload has been resolved to our plans. */
export type SubEvent =
  | { type: "activated"; providerSubscriptionId: string; plan: PlanId; interval: BillingInterval; periodStart?: Date | null; periodEnd?: Date | null }
  | { type: "charged"; providerSubscriptionId: string; plan: PlanId; interval: BillingInterval; periodStart?: Date | null; periodEnd?: Date | null }
  | { type: "payment_failed"; providerSubscriptionId: string }
  | { type: "updated"; providerSubscriptionId: string; plan?: PlanId; interval?: BillingInterval; cancelAtPeriodEnd?: boolean; periodEnd?: Date | null }
  | { type: "canceled"; providerSubscriptionId: string }
  | { type: "tick" };

/** What changed, for audit entries and emails. */
export type SubChange =
  | { kind: "activated"; plan: PlanId }
  | { kind: "renewed"; plan: PlanId }
  | { kind: "recovered"; plan: PlanId }
  | { kind: "upgraded"; from: PlanId; to: PlanId }
  | { kind: "downgrade_scheduled"; from: PlanId; to: PlanId }
  | { kind: "downgraded"; from: PlanId; to: PlanId }
  | { kind: "past_due"; plan: PlanId; graceEndsAt: Date }
  | { kind: "ended"; from: PlanId; reason: "canceled" | "grace_expired" | "period_end" };

export interface TransitionResult {
  state: SubState | null;
  changes: SubChange[];
}

const DAY = 86_400_000;

function fresh(e: { providerSubscriptionId: string; plan: PlanId; interval: BillingInterval; periodStart?: Date | null; periodEnd?: Date | null }): SubState {
  return {
    plan: e.plan, interval: e.interval, status: "active", providerSubscriptionId: e.providerSubscriptionId,
    currentPeriodStart: e.periodStart ?? null, currentPeriodEnd: e.periodEnd ?? null, cancelAtPeriodEnd: false,
    pendingPlan: null, pendingInterval: null, pastDueSince: null, graceEndsAt: null, canceledAt: null,
  };
}

/** The plan a workspace actually gets right now. */
export function effectivePlan(state: SubState | null, now = new Date()): PlanId {
  if (!state || state.status === "canceled") return "free";
  if (state.status === "past_due" && state.graceEndsAt && state.graceEndsAt <= now) return "free";
  if (state.cancelAtPeriodEnd && state.currentPeriodEnd && state.currentPeriodEnd <= now) return "free";
  return state.plan;
}

export function transition(state: SubState | null, event: SubEvent, now = new Date(), graceDays = DEFAULT_GRACE_DAYS): TransitionResult {
  const live = state && state.status !== "canceled" ? state : null;
  const same = (id: string) => live !== null && live.providerSubscriptionId === id;

  switch (event.type) {
    case "activated":
    case "charged": {
      if (!same(event.providerSubscriptionId)) {
        // A new subscription (or a charge that arrived before its activation).
        return { state: fresh(event), changes: [{ kind: "activated", plan: event.plan }] };
      }
      const s = live!;
      const next: SubState = {
        ...s,
        status: "active",
        pastDueSince: null,
        graceEndsAt: null,
        currentPeriodStart: event.periodStart ?? s.currentPeriodStart,
        currentPeriodEnd: event.periodEnd ?? s.currentPeriodEnd,
      };
      const changes: SubChange[] = [];
      if (event.type === "charged") {
        if (s.status === "past_due") changes.push({ kind: "recovered", plan: event.plan });
        if (event.plan !== s.plan) {
          next.plan = event.plan;
          next.interval = event.interval;
          changes.push(isUpgrade(s.plan, event.plan) ? { kind: "upgraded", from: s.plan, to: event.plan } : { kind: "downgraded", from: s.plan, to: event.plan });
        } else if (s.status !== "past_due") {
          changes.push({ kind: "renewed", plan: s.plan });
        }
        if (s.pendingPlan && next.plan === s.pendingPlan) {
          next.pendingPlan = null;
          next.pendingInterval = null;
        }
        next.interval = event.interval;
      }
      return { state: next, changes };
    }

    case "payment_failed": {
      if (!same(event.providerSubscriptionId)) return { state, changes: [] };
      const s = live!;
      if (s.status === "past_due") return { state: s, changes: [] }; // keep the original grace period
      const graceEndsAt = new Date(now.getTime() + graceDays * DAY);
      return { state: { ...s, status: "past_due", pastDueSince: now, graceEndsAt }, changes: [{ kind: "past_due", plan: s.plan, graceEndsAt }] };
    }

    case "updated": {
      if (!same(event.providerSubscriptionId)) return { state, changes: [] };
      const s = live!;
      const next: SubState = { ...s };
      const changes: SubChange[] = [];
      if (event.cancelAtPeriodEnd !== undefined) next.cancelAtPeriodEnd = event.cancelAtPeriodEnd;
      if (event.periodEnd) next.currentPeriodEnd = event.periodEnd;
      if (event.plan && event.plan !== s.plan) {
        if (isUpgrade(s.plan, event.plan)) {
          // Upgrades apply at once; any scheduled downgrade is dropped.
          next.plan = event.plan;
          next.interval = event.interval ?? s.interval;
          next.pendingPlan = null;
          next.pendingInterval = null;
          changes.push({ kind: "upgraded", from: s.plan, to: event.plan });
        } else if (s.pendingPlan !== event.plan) {
          // Downgrades wait for the end of the paid period.
          next.pendingPlan = event.plan;
          next.pendingInterval = event.interval ?? s.interval;
          changes.push({ kind: "downgrade_scheduled", from: s.plan, to: event.plan });
        }
      }
      return { state: next, changes };
    }

    case "canceled": {
      if (!same(event.providerSubscriptionId)) return { state, changes: [] };
      const s = live!;
      return { state: { ...s, status: "canceled", canceledAt: now, cancelAtPeriodEnd: false, pendingPlan: null, pendingInterval: null }, changes: [{ kind: "ended", from: s.plan, reason: "canceled" }] };
    }

    case "tick": {
      if (!live) return { state, changes: [] };
      if (live.status === "past_due" && live.graceEndsAt && live.graceEndsAt <= now) {
        return { state: { ...live, status: "canceled", canceledAt: now }, changes: [{ kind: "ended", from: live.plan, reason: "grace_expired" }] };
      }
      if (live.cancelAtPeriodEnd && live.currentPeriodEnd && live.currentPeriodEnd <= now) {
        return { state: { ...live, status: "canceled", canceledAt: now, cancelAtPeriodEnd: false }, changes: [{ kind: "ended", from: live.plan, reason: "period_end" }] };
      }
      return { state, changes: [] };
    }
  }
}
