import { resolve } from 'path';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
      },
      output: {
        dir: 'dist',
        format: 'es',
      },
    },
  },
});
