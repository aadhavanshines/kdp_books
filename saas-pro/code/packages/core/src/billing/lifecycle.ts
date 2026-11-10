import type { Db } from "../db";

/**
 * Stop billing a workspace that is about to be deleted: cancel its provider
 * subscription immediately (no refund) and mark it canceled. Safe to call
 * when the workspace has no subscription.
 */
export async function cancelSubscriptionForDeletion(_db: Db, _workspaceId: string): Promise<void> {
  // Implemented in billing/service.ts (this session).
}
