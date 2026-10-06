export interface SupabaseBackendOptions {
  /** Project URL, e.g. https://abcd.supabase.co (or the local stack). */
  url: string;
  /** The public anon (or publishable) key. It is safe in the browser: RLS decides what it can do. */
  anonKey: string;
  /**
   * Mailpit on the local stack, where every sign-in email lands. When set,
   * the sign-in link is read from it and handed back as `devLink`.
   */
  mailpitUrl: string | null;
  /** Where the session is kept (defaults to localStorage). Tests give each client its own. */
  storage?: {
    getItem(k: string): string | null;
    setItem(k: string, v: string): void;
    removeItem(k: string): void;
  };
  /** How often an order is re-read while Realtime is unavailable (ms). */
  pollMs?: number;
}

/** The local stack started by `supabase start` (supabase/config.toml). */
export const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
export const LOCAL_MAILPIT_URL = 'http://127.0.0.1:54324';
/**
 * The anon key every local Supabase stack uses (signed with the CLI's
 * well-known development JWT secret). It works only against a local stack.
 */
export const LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const isLocalHost = (url: string) =>
  ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname);

/**
 * Reads the Supabase settings from VITE_* variables. With none at all it
 * targets the local stack (`supabase start`), which needs no account.
 */
export function supabaseOptionsFromEnv(env: ImportMetaEnv): SupabaseBackendOptions {
  const url = env.VITE_SUPABASE_URL || LOCAL_SUPABASE_URL;
  const local = isLocalHost(url);
  if (!local && !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required for a hosted Supabase project.');
  }
  return {
    url,
    anonKey: env.VITE_SUPABASE_ANON_KEY || LOCAL_ANON_KEY,
    mailpitUrl: env.VITE_SUPABASE_MAILPIT_URL || (local ? LOCAL_MAILPIT_URL : null),
  };
}
