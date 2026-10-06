import type { FirebaseOptions } from 'firebase/app';

export interface FirebaseBackendOptions {
  firebase: FirebaseOptions & { projectId: string };
  /** Host of the local emulators (e.g. "127.0.0.1"), or null for the real Firebase. */
  emulatorHost: string | null;
  ports?: { auth?: number; firestore?: number; functions?: number };
  /** Region the Cloud Functions are deployed to. */
  functionsRegion: string;
  /**
   * Call the functions through Firebase Hosting (`<origin>/api/<name>`, see
   * firebase.json) instead of the cloudfunctions.net address. The browser then
   * only ever talks to its own origin, so the CSP needs no functions host.
   * On the Hosting emulator this routes through its rewrites to the Functions emulator.
   */
  functionsViaHosting?: boolean;
  /** Lets tests run several signed-in users side by side. */
  appName?: string;
}

export const DEFAULT_EMULATOR_PORTS = { auth: 9099, firestore: 8080, functions: 5001 };
export const DEFAULT_FUNCTIONS_REGION = 'asia-south1';

/**
 * Reads the Firebase settings from VITE_* variables. With no settings at all it
 * targets the `demo-quickbite` project on the local emulators, which needs no
 * account. A demo-* project always uses the emulators.
 */
export function firebaseOptionsFromEnv(env: ImportMetaEnv): FirebaseBackendOptions {
  const projectId = env.VITE_FIREBASE_PROJECT_ID || 'demo-quickbite';
  const isDemo = projectId.startsWith('demo-');
  const emulatorHost = env.VITE_FIREBASE_EMULATOR_HOST || (isDemo ? '127.0.0.1' : null);
  if (!isDemo && !env.VITE_FIREBASE_API_KEY) {
    throw new Error('VITE_FIREBASE_API_KEY is required for a real Firebase project.');
  }
  return {
    firebase: {
      projectId,
      apiKey: env.VITE_FIREBASE_API_KEY || 'demo-api-key',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      appId: env.VITE_FIREBASE_APP_ID || undefined,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    },
    emulatorHost,
    functionsRegion: env.VITE_FIREBASE_FUNCTIONS_REGION || DEFAULT_FUNCTIONS_REGION,
    functionsViaHosting: env.VITE_FIREBASE_FUNCTIONS_VIA_HOSTING === 'true',
  };
}
