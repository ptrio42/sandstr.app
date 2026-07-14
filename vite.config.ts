import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Standalone SPA host for the Nostr client-simulators feature.
// The `@` alias mirrors the original repo so copied files that import
// `@/components/tour` / `@/data/tours` resolve unchanged.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
