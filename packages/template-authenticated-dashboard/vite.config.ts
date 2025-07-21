import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    compression({
      verbose: true,
      disable: false,
      threshold: 1025, // only assets bigger than this are compressed
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      verbose: true,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    react(),
  ],
  build: {
    emptyOutDir: true,
  },
  server: {
    port: 5003,
  },
});
