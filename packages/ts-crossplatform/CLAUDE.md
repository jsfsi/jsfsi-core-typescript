# CLAUDE.md — ts-crossplatform

Cross-platform utilities used by all other packages. No Node.js or browser-specific APIs.

## Build

`tsc --noEmit` + `vite build` — outputs ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`) with declarations via `vite-plugin-dts`.

## Key exports

- **Result types**: `Ok(value)`, `Fail(failure)` — tuple `[T, F | undefined]`
- **Failure**: base class for typed errors. Check with `isFailure(Type)(failure)`, never `instanceof`
- **HttpSafeClient**: abstract HTTP adapter base. Extend and implement `getHeaders()`. Methods: `fetch()` (JSON), `fetchBlob()` (binary)
- **EmptyResponse**: Zod schema for 204/empty body responses
- **mock\<T\>()**: type-safe recursive partial mock for tests
- **Guid**: UUID generation via `Guid.new()`
- **parseConfig**: Zod-based environment config parser
- **SafeDomain**: Zod validator for domain names

## Testing

- Vitest with v8 provider, 100% coverage enforced
- Coverage excludes: `src/index.ts`, `src/paging/Page.ts`, `src/**/index.ts`, `src/partials/RecursivePartial.ts`
- Tests are co-located with source files
