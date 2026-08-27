import { builtinModules } from 'module';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// cover both 'fs' and 'node:fs'
const nodeBuiltins = Array.from(
  new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]),
);

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Runtime dependencies stay external: inlining CJS packages such as dotenv emits
      // `require` calls into the ESM output, which throws at import time.
      external: [
        ...nodeBuiltins,
        /^@jsfsi-core\/.*/,
        'dotenv',
        'fast-safe-stringify',
        'typeorm',
      ],
      output: {
        globals: {},
      },
    },
  },
});
