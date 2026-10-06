/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** memory | firebase | supabase */
  readonly VITE_BACKEND?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
