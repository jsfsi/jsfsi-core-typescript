import path from 'path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: false,
  oxc: false,
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/test.setup.ts'],
    css: true,
    include: ['src/**/*.integration.test.ts'],
    exclude: ['src/**/*.unit.test.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@jsfsi-core/ts-crossplatform': path.resolve(import.meta.dirname, '../ts-crossplatform/src/index.ts'),
      '@jsfsi-core/ts-nodejs': path.resolve(import.meta.dirname, '../ts-nodejs/src/index.ts'),
      '@jsfsi-core/ts-nestjs': path.resolve(import.meta.dirname, '../ts-nestjs/src/index.ts'),
    },
  },
});
