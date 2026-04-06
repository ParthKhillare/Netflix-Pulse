interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
