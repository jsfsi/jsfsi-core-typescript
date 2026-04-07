# CLAUDE.md — template-rest-api

NestJS REST API template with Firebase auth, TypeORM, and hexagonal architecture.

## Build

`tsc --noEmit` + `nest build` — compiles to **CommonJS** in `dist/`. Uses `ignoreDeprecations: "6.0"` for `moduleResolution: "node"`.

Single `tsconfig.json` (no tsconfig.build.json). Tests are excluded from compilation via `exclude` but included for IDE type-checking.

## Structure

```
src/
├── adapters/              # External service integrations
├── app/                   # NestJS module and config
├── communication/         # Controllers, decorators, guards, middlewares
├── domain/                # Models, services (pure business logic)
└── main.ts                # Entry point
configuration/             # .env files (copied to dist/ by nest build)
test/                      # Test setup files
```

## Key patterns

- Thin controllers: validate with `SafeBody`, delegate to services, map failures to HTTP exceptions with `isFailure()`
- Domain services: NO NestJS/TypeORM imports, return `Result<T, Failure>`
- Repositories: extend `TransactionalRepository`, inject `DatabaseService`
- Multi-tenant: ALL queries MUST filter by `tenantId`
- Guards: `AuthorizeGuard` (Firebase token), `UserGuard`, `GlobalRateLimitGuard`

## Dev

```bash
npm run dev              # Start with --watch
npm run start:dist       # Run compiled dist/src/main.js
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

## Testing

- Vitest with v8 provider, 100% coverage enforced
- Unit and integration configs: `vitest.unit.config.ts`, `vitest.integration.config.ts`
- Use `createTestingApp(AppModule)` for integration tests
- Config from `.env.test` — don't mock ConfigService
