import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/index.ts',
        'src/logger/MockLogger.ts',
        'src/database/TransactionalRepositoryMock.ts',
        'src/database/postgres',
        'src/database/models/*',
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
    },
  },
});
