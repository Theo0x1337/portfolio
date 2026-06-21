import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Consume the shared package from its TypeScript source so Vite emits
      // proper ESM (named exports like `seedPosts` work, and changes hot-reload
      // without a separate build step). The server still uses the compiled CJS
      // dist via the package's "main" field.
      shared: fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)),
    },
  },
})
