import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Album-de-fotos/',
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
})
