/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  // More env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 