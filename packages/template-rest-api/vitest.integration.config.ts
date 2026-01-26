import path from 'path';
import { fileURLToPath } from 'url';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
      '@jsfsi-core/ts-crossplatform': path.resolve(__dirname, '../ts-crossplatform/src/index.ts'),
      '@jsfsi-core/ts-nodejs': path.resolve(__dirname, '../ts-nodejs/src/index.ts'),
      '@jsfsi-core/ts-nestjs': path.resolve(__dirname, '../ts-nestjs/src/index.ts'),
    },
  },
});
