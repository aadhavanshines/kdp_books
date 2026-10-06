/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** memory | firebase | supabase */
  readonly VITE_BACKEND?: string;
  /** Firebase web config. Leave empty to use the local emulators (project demo-quickbite). */
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_FUNCTIONS_REGION?: string;
  /** "true" on Firebase Hosting: call functions at <origin>/api/<name> (firebase.json rewrites). */
  readonly VITE_FIREBASE_FUNCTIONS_VIA_HOSTING?: string;
  /** Use the Firebase emulators on this host (always on for demo-* projects). */
  readonly VITE_FIREBASE_EMULATOR_HOST?: string;
  /** Supabase project URL. Leave empty to use the local stack (supabase start). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (publishable) key. Required for a hosted project. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Mailpit on the local stack (default http://127.0.0.1:54324): sign-in emails are read from it. */
  readonly VITE_SUPABASE_MAILPIT_URL?: string;
  /** fake (default) shows the "Demo mode" banner and the test payment sheet. */
  readonly VITE_PAYMENTS_MODE?: string;
  /** Seconds per order tracking step for the in-memory backend's simulator. */
  readonly VITE_DEMO_STEP_SECONDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
