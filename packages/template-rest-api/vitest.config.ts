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
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/**/models/**',
        'src/repositories/MigrationsDataSource.ts',
        'src/repositories/migrations/**',
        'src/repositories/DatabaseService.ts',
        'src/communication/guards/global-rate-limit.guard.ts',
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
      '@jsfsi-core/ts-crossplatform': path.resolve(__dirname, '../ts-crossplatform/src/index.ts'),
      '@jsfsi-core/ts-nodejs': path.resolve(__dirname, '../ts-nodejs/src/index.ts'),
      '@jsfsi-core/ts-nestjs': path.resolve(__dirname, '../ts-nestjs/src/index.ts'),
    },
  },
});
