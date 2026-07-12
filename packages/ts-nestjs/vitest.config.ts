import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/test.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/index.ts',
        'src/app/bootstrap.ts',
        'src/app/app.ts',
        'src/test/**/*.ts',
        'src/filters/AllExceptionsFilter.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@jsfsi-core/ts-crossplatform': path.resolve(import.meta.dirname, '../ts-crossplatform/src/index.ts'),
      '@jsfsi-core/ts-nodejs': path.resolve(import.meta.dirname, '../ts-nodejs/src/index.ts'),
    },
  },
});
