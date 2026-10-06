/**
 * `pnpm sim`: the demo simulator for local development. The emulator doesn't
 * fire scheduled functions, so this runs the same advanceDemoOrders() and
 * expireUnpaidOrders() in a loop against the Firestore emulator.
 *
 *   DEMO_STEP_SECONDS   seconds per tracking step (default 45; tests use a few seconds)
 */
import {
  advanceDemoOrders,
  DEFAULT_DEMO_STEP_SECONDS,
  expireUnpaidOrders,
} from '@quickbite/server';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { FirestoreOrderStore } from './firestoreStore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    'FIRESTORE_EMULATOR_HOST is not set: the simulator only runs against the emulator.',
  );
  process.exit(1);
}

const stepSeconds = Number(process.env.DEMO_STEP_SECONDS ?? DEFAULT_DEMO_STEP_SECONDS);
const tickMs = Math.max(250, Math.min(5000, (stepSeconds * 1000) / 5));
const db = getFirestore(
  initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-quickbite' }),
);
db.settings({ ignoreUndefinedProperties: true });
const store = new FirestoreOrderStore(db);

console.log(
  `Order simulator: one tracking step every ${stepSeconds}s (checking every ${tickMs}ms)`,
);
let stopped = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => (stopped = true));

// Stop on our own when the emulator goes away, so no simulator is left running.
const MAX_FAILURES = 10;
let failures = 0;
while (!stopped && failures < MAX_FAILURES) {
  try {
    const now = new Date();
    const advanced = await advanceDemoOrders(store, { now, stepSeconds });
    const expired = await expireUnpaidOrders(store, { now });
    failures = 0;
    if (advanced || expired) console.log(`[sim] advanced ${advanced}, expired ${expired}`);
  } catch (error) {
    failures++;
    console.error('[sim]', error instanceof Error ? error.message : error);
  }
  await new Promise((r) => setTimeout(r, tickMs));
}
if (failures >= MAX_FAILURES) console.error('[sim] Firestore emulator unreachable, stopping.');
process.exit(0);
