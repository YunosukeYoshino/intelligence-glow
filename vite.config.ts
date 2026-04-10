import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'lib'
  const libraryEntries = {
    index: resolve(rootDir, 'src/lib/index.ts'),
    'three/index': resolve(rootDir, 'src/lib/three/index.ts'),
  }

  return {
    plugins: [react(), tailwindcss()],
    build: isLibraryBuild
      ? {
          outDir: 'dist/lib',
          emptyOutDir: true,
          rollupOptions: {
            input: libraryEntries,
            external: ['glowing', 'three'],
            preserveEntrySignatures: 'exports-only',
            output: {
              entryFileNames: '[name].js',
              format: 'es',
              preserveModules: true,
              preserveModulesRoot: 'src/lib',
            },
          },
        }
      : {
          outDir: 'dist/demo',
          emptyOutDir: true,
        },
    test: {
      environment: 'jsdom',
    },
  }
})
