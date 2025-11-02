import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/test.unit.setup.ts'],
    css: true,
    include: ['src/**/*.unit.test.ts'],
    exclude: ['src/**/*.integration.test.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
