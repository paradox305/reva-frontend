/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_SERVER_URL: string
  // More env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 