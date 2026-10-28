import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    host: true, // expose on the local network
    port: 3000,
    allowedHosts: ['studio.local'],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro({
      // heic-decode/libheif-js ship an emscripten CJS bundle that references
      // __dirname; bundling it into nitro's ESM chunks breaks it at runtime.
      // Tracing keeps them as real CJS in .output/server/node_modules.
      traceDeps: ['heic-decode', 'libheif-js'],
    }),
  ],
})
