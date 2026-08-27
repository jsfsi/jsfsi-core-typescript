import { resolve } from 'path';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'src/main.ts'),
      },
      output: {
        dir: 'dist',
        format: 'es',
      },
    },
  },
});
