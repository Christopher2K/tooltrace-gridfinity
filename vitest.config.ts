import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Standalone config (vite.config.ts carries TanStack Start/Nitro plugins that
// vitest doesn't need). Only the `~` alias is required for the unit tests.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
