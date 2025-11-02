import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

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
    },
  },
});
