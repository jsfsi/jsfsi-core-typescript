// vite.config.ts
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

  ssr: {
    // make sure nothing gets inlined; this is a library for Node
    target: 'node',
    noExternal: true,
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
      // keep Node core + server deps out of the bundle
      external: [
        ...nodeBuiltins,
        'express',
        'body-parser',
        // add anything else that should stay external
      ],
      output: {
        globals: {}, // not used for Node, but harmless
      },
      // ensure rollup resolves for Node, not the browser
      // (Vite sets this internally, but being explicit helps)
      // treeshake: { moduleSideEffects: false }, // optional
    },
  },
});
