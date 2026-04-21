# CLAUDE.md

## Project overview

TypeScript monorepo (`npm workspaces`) publishing reusable packages to npm and providing project templates. Follows **Hexagonal Architecture** with Result-type error handling.

### Packages

| Package | Purpose | Build |
|---------|---------|-------|
| `ts-crossplatform` | Cross-platform utilities (Result types, Failures, HttpSafeClient, mock, Guid, DateTime) | `tsc --noEmit` + `vite build` |
| `ts-react` | React utilities (IoC, ErrorBoundary, Crashlytics, ThemeProvider, AuthProvider, AuthenticationAdapter, FirebaseClient, Form, ProtectedRoute factory) | `tsc --noEmit` + `vite build` |
| `ts-nodejs` | Node.js utilities (TransactionalRepository, Logger, env loader) | `tsc --noEmit` + `vite build` |
| `ts-nestjs` | NestJS utilities (bootstrap, middleware, guards, validators) | `tsc --noEmit` + `vite build` |
| `template-rest-api` | NestJS REST API template | `tsc --noEmit` + `nest build` (CommonJS) |
| `template-authenticated-dashboard` | React + Firebase dashboard template | `tsc` + `vite build` |

Build order matters: `ts-crossplatform` -> `ts-react` -> `ts-nodejs` -> `ts-nestjs` -> templates.

## Commands

```bash
npm run build              # Build all packages in dependency order
npm run test               # Run all tests
npm run test:coverage      # Run all tests with 100% coverage enforcement
npm run lint               # Lint all packages

# Per-package
npm run build --workspace=@jsfsi-core/ts-crossplatform
npm run test --workspace=@jsfsi-core/template-rest-api
```

## Architecture

### Layers (dependency flows downward only)

1. **Application** — UI components (React), Controllers (NestJS)
2. **Domain** — Services, Models, Failures. Pure business logic, NO framework imports
3. **Adapters** — Repositories, HTTP clients, Firebase. Convert exceptions to Result types

### Error handling: Result types, not exceptions

```typescript
// Domain services return Result<T, Failure> — never throw
const [tenant, failure] = await tenantsService.createTenant(input);
if (isFailure(DuplicatedTenantFailure)(failure)) {
  return Fail(failure);
}

// try-catch ONLY in adapters (edges), converting to Result
// Use isFailure()/notFailure() — NEVER instanceof
```

## Code style

- **TypeScript 6** — strict, no `any`, no double casts (`as unknown as T`)
- **Vite 8** with rolldown — use `import type` for type-only imports
- `type` over `interface` for domain models
- PascalCase files matching class names, kebab-case directories
- Three-letter acronyms in ALL CAPS: `PDFExporter`, `APIClient`
- Failures suffixed with `Failure`: `SignInFailure`, `NotFoundFailure`
- Immutable data — spread instead of mutate
- Constructor dependency injection
- No unnecessary comments — code should be self-documenting

## Testing

- **Vitest** with v8 coverage provider, **100% coverage enforced** on all packages
- TDD: Red -> Green -> Refactor
- AAA pattern: Arrange, Act, Assert (clearly separated)
- Use `mock<T>()` from `@jsfsi-core/ts-crossplatform` for type-safe mocks — never `any` or `as unknown as`
- Use `Ok()`/`Fail()` for mocking Results — never array notation
- Use `toEqual` with full object literals — not individual field assertions
- `afterEach(() => vi.clearAllMocks())` — never in beforeEach
- Non-null assertions (`!`) in test assertions for clarity
- Coverage ignore: `/* v8 ignore next -- @preserve */` (never `c8 ignore`)
- Barrel re-export files (`index.ts`) and type-only files excluded from coverage

### Frontend tests

Organized as: `Render` / `Behavior` / `Error handling` describe blocks.
Render through `AppProviders` with `AppBindingsOverrides` for IoC overrides.

### Backend tests

Organized as: `happy path` / `error handling` / `logging` describe blocks.
Use `createTestingApp` from `@jsfsi-core/ts-nestjs`.

## Build system details

- Library packages: `tsc --noEmit` (type-check only) + `vite build` (bundles to dist/)
- NestJS apps: `tsc --noEmit` + `nest build` (compiles to CommonJS in dist/)
- Never let `tsc` emit JS alongside source files
- Library tsconfigs: `module: "ESNext"`, `moduleResolution: "bundler"`
- NestJS app tsconfig: `module: "CommonJS"`, `moduleResolution: "node"`, `ignoreDeprecations: "6.0"`

## Key patterns

- `IoCContextProvider` / `useInjection` — inversify-based IoC container for React (from `@jsfsi-core/ts-react`)
- `AuthProvider<TUser>` / `useAuth<TUser>()` — generic auth context. Decoupled from IoC: consumers pass `loader` + callback props (`onAuthChanged`, `onSignIn`, `onSignOut`, `onSignInWithEmailAndPassword`, `onSignUp`, `onSignUpWithEmailAndPassword`, `onSendPasswordResetEmail`, `onSendEmailVerification`, `onReloadUser`). The app resolves its domain service via `useInjection(...)` one level up and forwards method calls through the callbacks. Each exposed method is wrapped with `loading` state via try/finally, so `loading` always resets even if the underlying call throws. `reloadUser` additionally updates the provider's `currentUser` on success so `auth.currentUser.emailVerified` reflects the fresh state. Context value is memoized; callbacks are held in refs so consumers don't need to memoize them.
- `AuthenticationAdapter<TUser extends User>` — generic adapter implementing `AuthService<TUser>`, delegating to an injected `AuthClient<TUser>`. Apps **compose** it (don't extend): the template defines a domain `AuthenticationService implements AuthService<User>` that takes an `AuthenticationAdapter<User>` through the constructor, and binds both in IoC.
- `FirebaseClient` — `AuthClient<User>` implementation wrapping `firebase/compat/auth`. Constructor takes `FirebaseConfig`. Firebase is a peer dependency, externalized from the bundle.
- `User` — base user type exported from ts-react; `TUser` generics are constrained with `extends User`.
- `SignInFailure`, `SignUpFailure`, `PasswordResetEmailFailure`, `EmailVerificationFailure`, `ReloadUserFailure` — auth failures, one class per file, each extending `Failure` with `error: unknown`.
- `createProtectedRoute(useAuth)` — factory for route guards
- `CrashlyticsProvider` — error boundary + crash reporting context
- `ThemeProvider` / `useTheme` — localStorage-persisted theme (dark/light/system)
- `Form` — react-hook-form wrapper with auto-reset on defaultValues change
- `HttpSafeClient` — base class for HTTP adapters, returns `Result` not exceptions
- `TransactionalRepository` — base class for TypeORM repositories with transaction support
- `loadEnvConfig({ configPath, env })` — loads `.env` files, `configPath` must be absolute or relative to cwd
- `parseConfig(ZodSchema)` — type-safe environment configuration with Zod
- Multi-tenant security: ALL database queries MUST filter by `tenantId`

## What NOT to do

- No `any` anywhere, including tests
- No `instanceof` for failure checking — use `isFailure()`
- No try-catch in domain services — only in adapters
- No hardcoded strings in React — use i18n (`useTranslation`)
- No direct adapter calls from React components — go through domain services
- No `baseUrl` or `paths` in tsconfigs (deprecated in TS6, use file: dependencies)
- No prop drilling — use IoC (`useInjection`) and context hooks
