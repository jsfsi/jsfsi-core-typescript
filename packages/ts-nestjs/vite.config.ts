import { builtinModules } from 'module';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// cover both 'fs' and 'node:fs'
const nodeBuiltins = Array.from(
  new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]),
);

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],

  // Resolve like Node, not browser
  resolve: {
    conditions: ['node'], // prefer "exports" conditions for Node
  },

  build: {
    target: 'node24', // Node target (adjust to your runtime)
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Node core plus every runtime dependency stays external: the consuming app owns
      // the NestJS instance, so inlining it would ship a second copy of the DI container
      // and break decorator metadata resolution.
      external: [
        ...nodeBuiltins,
        /^@nestjs\/.*/,
        /^@jsfsi-core\/.*/,
        'express',
        'body-parser',
        'reflect-metadata',
        'supertest',
        'vitest',
        'zod',
      ],
      output: {
        globals: {}, // not used for Node, but harmless
      },
    },
  },
});
