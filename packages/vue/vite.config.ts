/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'custom',
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'node_modules'],
    }),
  ],
  build: {
    minify: 'esbuild',
    emptyOutDir: true,
    sourcemap: true,
    target: 'modules',
    modulePreload: { polyfill: false },
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        composables: resolve(__dirname, 'src/composables/index.ts'),
      },
    },
    rollupOptions: {
      external: [
        'vue',
        'livekit-client',
        '@livekit/components-core',
        '@livekit/components-styles',
        'rxjs',
      ],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name]-[hash].cjs',
          dir: 'dist',
        },
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
