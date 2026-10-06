/**
 * Loads the seed catalog into Firestore with the Admin SDK.
 *
 *   pnpm seed:firebase            # into the local emulator (FIRESTORE_EMULATOR_HOST)
 *
 * It refuses to touch a real project unless --allow-production is passed.
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { buildCatalog } from '../src/catalog.ts';
import { firestoreSeedDocs } from '../src/firestoreDocs.ts';

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-quickbite';
const allowProduction = process.argv.includes('--allow-production');

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  if (!allowProduction) {
    console.error(
      'FIRESTORE_EMULATOR_HOST is not set. Start the emulators (pnpm emulators) or pass --allow-production.',
    );
    process.exit(1);
  }
} else if (!projectId.startsWith('demo-') && !allowProduction) {
  console.error(`Refusing to seed project "${projectId}" without --allow-production.`);
  process.exit(1);
}

const app = initializeApp({ projectId });
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

const docs = firestoreSeedDocs(buildCatalog());
const started = Date.now();
for (let i = 0; i < docs.length; i += 450) {
  const batch = db.batch();
  for (const doc of docs.slice(i, i + 450)) batch.set(db.doc(doc.path), doc.data);
  await batch.commit();
}
console.log(
  `Seeded ${docs.length} documents into ${projectId}${
    process.env.FIRESTORE_EMULATOR_HOST ? ` (emulator ${process.env.FIRESTORE_EMULATOR_HOST})` : ''
  } in ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
