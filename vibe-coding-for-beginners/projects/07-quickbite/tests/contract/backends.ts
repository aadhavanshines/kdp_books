import { createFirebaseBackend } from '../../apps/web/src/backend/firebase';
import { createMemoryBackend } from '../../apps/web/src/backend/memory';
import { createSupabaseBackend } from '../../apps/web/src/backend/supabase';
import {
  LOCAL_ANON_KEY,
  LOCAL_MAILPIT_URL,
  LOCAL_SUPABASE_URL,
} from '../../apps/web/src/backend/supabase/config';
import type { Backend, User } from '../../apps/web/src/backend/types';

export interface BackendFactory {
  name: string;
  /** A fresh, signed-out client of the backend (like a new browser). */
  create(): Backend;
}

let counter = 0;
const emulatorHost = process.env.FIREBASE_EMULATOR_HOST_FOR_TESTS ?? '127.0.0.1';

/** Each Supabase client keeps its session in its own storage, like a separate browser. */
function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
}

const factories: Record<string, BackendFactory> = {
  memory: {
    name: 'memory',
    create: () => createMemoryBackend({ latencyMs: 0, storage: null, user: null }),
  },
  firebase: {
    name: 'firebase',
    create: () =>
      createFirebaseBackend({
        firebase: { projectId: 'demo-quickbite', apiKey: 'demo-api-key' },
        emulatorHost,
        functionsRegion: 'asia-south1',
        appName: `contract-${process.pid}-${++counter}`,
      }),
  },
  supabase: {
    name: 'supabase',
    // A local stack (supabase start) by default; SUPABASE_URL etc. point it elsewhere.
    create: () =>
      createSupabaseBackend({
        url: process.env.SUPABASE_URL ?? LOCAL_SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY ?? LOCAL_ANON_KEY,
        mailpitUrl: process.env.SUPABASE_MAILPIT_URL ?? LOCAL_MAILPIT_URL,
        storage: memoryStorage(),
        pollMs: 500,
      }),
  },
};

export function selectedBackends(): BackendFactory[] {
  const names = (process.env.CONTRACT_BACKENDS ?? 'memory,firebase')
    .split(',')
    .map((s) => s.trim());
  return names.map((n) => {
    const factory = factories[n];
    if (!factory) throw new Error(`Unknown backend "${n}" in CONTRACT_BACKENDS`);
    return factory;
  });
}

/** Signs a client in through the real email-link flow (the link comes back as devLink locally). */
export async function signIn(backend: Backend, email: string): Promise<User> {
  const continueUrl = 'http://localhost:5173/login/finish?next=%2F';
  const { devLink } = await backend.auth.sendSignInLink(email, continueUrl);
  if (!devLink)
    throw new Error('No dev sign-in link: is the local stack (emulators or Mailpit) running?');
  if (!backend.auth.isSignInLink(devLink)) throw new Error(`Not a sign-in link: ${devLink}`);
  return backend.auth.completeSignIn(email, devLink);
}

export const uniqueEmail = (who: string) =>
  `${who}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@example.com`;
