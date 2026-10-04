import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Cible moderne : moins de code transpilé, donc moins d'octets à télécharger.
    target: 'es2020',
    sourcemap: false,
    // Les petites images/SVG restent inline : une requête réseau de moins.
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
    reportCompressedSize: true,

  },
  server: {
    port: 5173,
    host: true,
  },
})
