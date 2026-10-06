import type { Backend, BackendName } from './types';

/**
 * Picks the backend from VITE_BACKEND at build time. Each adapter is loaded with
 * a dynamic import so only the chosen one ends up in the production bundle.
 */
export function selectedBackendName(): BackendName {
  const raw = (import.meta.env.VITE_BACKEND ?? 'memory').toLowerCase();
  if (raw === 'memory' || raw === 'firebase' || raw === 'supabase') return raw;
  throw new Error(`Unknown VITE_BACKEND "${raw}". Use memory, firebase or supabase.`);
}

let backendPromise: Promise<Backend> | null = null;

export function getBackend(): Promise<Backend> {
  backendPromise ??= load(selectedBackendName());
  return backendPromise;
}

async function load(name: BackendName): Promise<Backend> {
  switch (name) {
    case 'memory': {
      const { createMemoryBackend } = await import('./memory');
      return createMemoryBackend();
    }
    case 'firebase': {
      const [{ createFirebaseBackend }, { firebaseOptionsFromEnv }] = await Promise.all([
        import('./firebase'),
        import('./firebase/config'),
      ]);
      return createFirebaseBackend(firebaseOptionsFromEnv(import.meta.env));
    }
    case 'supabase': {
      const [{ createSupabaseBackend }, { supabaseOptionsFromEnv }] = await Promise.all([
        import('./supabase'),
        import('./supabase/config'),
      ]);
      return createSupabaseBackend(supabaseOptionsFromEnv(import.meta.env));
    }
  }
}

/** Lets tests swap in their own backend. */
export function setBackendForTests(backend: Backend | null) {
  backendPromise = backend ? Promise.resolve(backend) : null;
}

export type * from './types';
export { SignInRequiredError, isSignInRequired } from './errors';
