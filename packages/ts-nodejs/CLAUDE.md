# CLAUDE.md — ts-nodejs

Node.js-specific utilities. Depends on `ts-crossplatform`.

## Build

`tsc --noEmit` + `vite build` — outputs ESM and CJS. Node builtins are externalized.

## Key exports

- **TransactionalRepository**: abstract base for TypeORM repositories with transaction support. Extend and pass `DataSource` to constructor
- **TransactionalEntity\<T\>**: interface with `withTransaction()` and `withRepositoryManager(repositoryManager: T)`
- **Logger** / **GCPLogger** / **MockLogger**: structured logging (message + metadata object)
- **loadEnvConfig({ configPath, env })**: loads `.env` files. `configPath` is resolved via `path.resolve(configPath ?? process.cwd(), ...)` — no `import.meta.url`

## Testing

- Vitest with v8 provider, 100% coverage enforced
- Coverage excludes: barrel files, `MockLogger.ts`, `TransactionalRepositoryMock.ts`, `postgres/`, `database/models/`
- `.env` and `.env.test` in `src/env/` for loader tests
