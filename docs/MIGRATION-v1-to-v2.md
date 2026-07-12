# Migration Guide: v1 to v2

## Overview

v2 upgrades the toolchain and runtime across all packages:

| Component | v1 | v2 |
|-----------|----|----|
| TypeScript | 6.0.3 | 7.0.2 |
| Node.js | 22.x | 26.5.0 |
| Linting | ESLint 10.7 + Prettier 3.9 | Biome 2.5.3 |
| Vite | 8.x | 8.x (rolldown) |
| `firebase-admin` (template-rest-api) | 13.8.0 | 14.1.0 |

---

## 1. Update dependencies

Update your `package.json` to reference v2 of the `@jsfsi-core/*` packages:

```json
"@jsfsi-core/ts-crossplatform": "2.0.0",
"@jsfsi-core/ts-react": "2.0.0",
"@jsfsi-core/ts-nodejs": "2.0.0",
"@jsfsi-core/ts-nestjs": "2.0.0"
```

## 2. Replace ESLint + Prettier with Biome

### Remove old dependencies

```bash
npm uninstall eslint prettier eslint-config-* eslint-plugin-* @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier-plugin-*
```

### Delete old config files

```bash
rm -f eslint.config.mjs .eslintrc.* .prettierrc .prettierignore
```

### Install Biome

```bash
npm install -D @biomejs/biome@2.5.3
```

### Add `biome.json`

Create a `biome.json` at your project root. Use the monorepo root config as a reference:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.3/schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "semicolons": "always", "trailingCommas": "all", "quoteStyle": "single" },
    "parser": { "unsafeParameterDecoratorsEnabled": true }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended",
      "suspicious": { "noExplicitAny": "warn", "noConsole": "error" },
      "correctness": {
        "noUnusedImports": { "level": "error", "fix": "safe" },
        "noUnusedVariables": "warn",
        "noUnusedFunctionParameters": "warn"
      },
      "style": { "useImportType": "error" },
      "a11y": {
        "useButtonType": "warn",
        "noStaticElementInteractions": "off",
        "useKeyWithClickEvents": "warn",
        "useValidAnchor": "warn",
        "noRedundantAlt": "warn",
        "noSvgWithoutTitle": "off",
        "noLabelWithoutControl": "off"
      }
    }
  },
  "css": { "parser": { "tailwindDirectives": true } },
  "files": { "includes": ["**", "!dist", "!node_modules", "!coverage"] }
}
```

Key options:

- **`unsafeParameterDecoratorsEnabled`** — required for NestJS parameter decorators (`@Body()`, `@Inject()`, etc.)
- **`tailwindDirectives`** — required if using Tailwind CSS (`@apply`, `@theme`, etc.)
- **`noUnusedImports` with `"fix": "safe"`** — auto-removes unused imports when running `biome check --write`
- **`noUnusedFunctionParameters: "warn"`** — catches dead parameters without blocking builds
- **a11y rules** — `useButtonType`, `useKeyWithClickEvents`, `useValidAnchor`, `noRedundantAlt` at `"warn"` for JSX projects; `noSvgWithoutTitle` and `noLabelWithoutControl` explicitly `"off"`

### Update `package.json` scripts

Replace:

```json
"format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
"lint": "npm run lint:fix && npm run format",
"lint:fix": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --fix"
```

With:

```json
"format": "biome format --write src",
"lint": "biome check --write src",
"lint:fix": "biome check --write src"
```

### Update VS Code settings

In `.vscode/settings.json`, remove all ESLint and Prettier settings:

```diff
- "editor.defaultFormatter": "esbenp.prettier-vscode",
- "editor.codeActionsOnSave": {
-   "source.fixAll.eslint": "explicit"
- },
- "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
- "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
- "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
- "eslint.validate": ["typescript", "typescriptreact"]
```

And replace with Biome settings:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "always",
    "source.fixAll.biome.unsafe": "always",
    "source.organizeImports.biome": "always"
  },
  "[typescript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[typescriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
  "[json]": { "editor.defaultFormatter": "biomejs.biome" },
  "js/ts.tsdk.path": "node_modules/typescript/lib",
  "vitest.disableWorkspaceWarning": true
}
```

### Update VS Code extensions

Uninstall the ESLint and Prettier extensions:

```bash
code --uninstall-extension dbaeumer.vscode-eslint
code --uninstall-extension esbenp.prettier-vscode
```

Install the Biome extension:

```bash
code --install-extension biomejs.biome
```

If the project has a `.vscode/extensions.json`, update it:

```json
{
  "recommendations": ["biomejs.biome"]
}
```

### Convert ESLint suppression comments

Biome uses a different suppression format:

```diff
- // eslint-disable-next-line @typescript-eslint/no-explicit-any
+ // biome-ignore lint/suspicious/noExplicitAny: <reason>
```

Common mappings:

| ESLint rule | Biome rule |
|-------------|------------|
| `@typescript-eslint/no-explicit-any` | `lint/suspicious/noExplicitAny` |
| `no-console` | `lint/suspicious/noConsole` |
| `@typescript-eslint/no-unused-vars` | `lint/correctness/noUnusedVariables` |
| `@typescript-eslint/consistent-type-imports` | `lint/style/useImportType` |

## 3. TypeScript 7 considerations

### `@typescript/typescript6` compatibility package

TS7 removed the programmatic Compiler API (`require('typescript')` no longer exports `getParsedCommandLineOfConfigFile`, etc.). Tools that use this API need the `@typescript/typescript6` compatibility package:

```bash
npm install -D @typescript/typescript6@^6.0.2
```

This is needed by `vite-plugin-dts` / `unplugin-dts` for declaration file generation.

### NestJS CLI incompatibility

**NestJS CLI 11.x does not work with TypeScript 7.** The CLI uses the TS Compiler API internally for both `nest build` and `nest start --watch`.

Replace NestJS CLI compiler commands with direct alternatives:

```json
{
  "build": "npm run lint && rm -rf dist && tsc && cp -r configuration dist/configuration",
  "dev": "rm -rf dist && tsc && cp -r configuration dist/configuration && NODE_ENV=development concurrently \"tsc --watch --preserveWatchOutput\" \"node --watch-path=dist --enable-source-maps dist/src/main.js\"",
  "start": "node --enable-source-maps dist/src/main.js",
  "start:debug": "rm -rf dist && tsc && cp -r configuration dist/configuration && NODE_ENV=development concurrently \"tsc --watch --preserveWatchOutput\" \"node --watch-path=dist --inspect --enable-source-maps dist/src/main.js\""
}
```

The `nest-cli.json` can remain for `nest generate` (schematics), which still works.

### Dropping `moduleResolution: "node"` and `ignoreDeprecations`

With TypeScript 7, when `module: "CommonJS"`, the default `moduleResolution` already maps to the equivalent of the old `"node"` setting. You can remove both:

```diff
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "module": "CommonJS",
-   "moduleResolution": "node",
-   "ignoreDeprecations": "6.0"
  }
```

### `import type` and NestJS dependency injection

Biome's `useImportType` rule will convert imports that appear type-only to `import type`. This **breaks NestJS constructor injection** because `emitDecoratorMetadata` needs the runtime class reference.

Any class injected via a NestJS constructor must use a value import with a suppression comment:

```typescript
// biome-ignore lint/style/useImportType: NestJS DI needs runtime class reference
import { AuthorizationAdapter } from '../adapters/AuthorizationAdapter';

@Injectable()
export class UserService {
  constructor(private readonly adapter: AuthorizationAdapter) {}
}
```

### Vite `esbuild` deprecation warning

If using `unplugin-swc` in Vitest configs (for NestJS decorator support), add both flags to suppress the deprecation warning:

```typescript
export default defineConfig({
  esbuild: false,
  oxc: false,
  plugins: [swc.vite()],
  // ...
});
```

### Vitest configs: `import.meta.dirname`

Node 26.x provides `import.meta.dirname` natively. Replace the manual polyfill:

```diff
  import path from 'path';
- import { fileURLToPath } from 'url';
-
- const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // In aliases, replace __dirname:
- '@jsfsi-core/ts-crossplatform': path.resolve(__dirname, '../ts-crossplatform/src/index.ts'),
+ '@jsfsi-core/ts-crossplatform': path.resolve(import.meta.dirname, '../ts-crossplatform/src/index.ts'),
```

### NestJS test cleanup: `app.close()` in `afterEach`

When using `createTestingApp()` in tests, always close the app in `afterEach` to release connections and allow parallel test execution:

```typescript
afterEach(async () => {
  await app.close();
  vi.clearAllMocks();
});
```

Without `app.close()`, database connections and other resources leak across tests, causing flaky failures in parallel mode and port/connection exhaustion.

## 4. `firebase-admin` v14 migration (NestJS template)

`firebase-admin@14` removed the namespace API. Update imports from:

```typescript
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const decoded = await admin.auth().verifyIdToken(token);
```

To:

```typescript
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const decoded = await getAuth().verifyIdToken(token);
```

Update test mocks accordingly — mock `firebase-admin/app` and `firebase-admin/auth` separately instead of `firebase-admin`.

## 5. Coverage annotations

The v8 coverage ignore comment format is unchanged, but ensure you use:

```typescript
/* v8 ignore next -- @preserve */
```

For NestJS decorators compiled by SWC, use start/stop blocks:

```typescript
/* v8 ignore start -- @preserve */
@Injectable()
export class MyService {
  /* v8 ignore stop -- @preserve */
  constructor() {}
}
```

## Verification

After migrating, run:

```bash
npm run build && npm run test:coverage
```

All packages should build and pass with 100% coverage.
