# CLAUDE.md — template-authenticated-dashboard

React + Firebase authenticated dashboard template with hexagonal architecture.

## Build

`tsc` + `vite build` — outputs static assets to `dist/`.

## Structure

```text
src/
├── domain/
│   └── services/
│       └── AuthenticationService.ts  # domain service; implements AuthService<User>, composes an injected AuthenticationAdapter<User>
├── ConfigurationService.ts           # Vite env var parsing
└── ui/
    ├── app/                          # App root, router, bindings (IoC)
    ├── components/                   # Reusable UI components (shadcn/ui based) + app-specific wrappers
    ├── i18n/                         # Internationalization (i18next)
    └── pages/                        # Page components
```

All generic infrastructure (auth context, error boundary, crashlytics, theme provider, IoC container, form wrapper, protected-route factory, Firebase client, `useIsMobile`, `AuthenticationAdapter<TUser>`, `User` type, auth failure classes) lives in `@jsfsi-core/ts-react`. The template only defines:

- `AppBindings.ts` — IoC wiring. Binds `FirebaseClient` (singleton, initialized with the Vite env config), `AuthenticationAdapter<User>` (depends on `FirebaseClient`), and `AuthenticationService` (depends on `AuthenticationAdapter<User>`).
- `App.tsx` / `AppProviders` — composes the ts-react providers in the right order. Defines a small `AppAuthProvider` inside `App.tsx` that resolves `AuthenticationService` via `useInjection` and forwards each method to the corresponding callback prop on `<AuthProvider<User>>`. This is the only place that knows both the IoC container and the ts-react `AuthProvider` — the library itself has no IoC dependency.
- `AuthenticationService` — domain service that implements `AuthService<User>` and delegates each method to an injected `AuthenticationAdapter<User>`. Resolved via `useInjection(AuthenticationService)` inside `AppAuthProvider`. Extend it when you need business logic (extra validation, logging, orchestration) that shouldn't live in the adapter.
- Pages, forms, styled components, i18n.

## Key patterns

- **IoC container**: `AppBindings.ts` registers `FirebaseClient`, `AuthenticationAdapter<User>`, and `AuthenticationService`. Tests override via `AppBindingsOverrides`.
- **All text via i18n**: `useTranslation()` — never hardcode strings.
- **Auth**: `FirebaseClient` → `AuthenticationAdapter<User>` → `AuthenticationService` (composition, no inheritance) → `AppAuthProvider` (uses `useInjection`, forwards methods to `<AuthProvider<User>>` callbacks) → `AuthProvider`. `useAuth<User>()` exposes `{ currentUser, loading, signIn, signOut, signInWithEmailAndPassword, signUp, signUpWithEmailAndPassword, sendPasswordResetEmail }`. While `loading` is `true`, `AuthProvider` renders the `loader` prop in place of children.
- **Protected routes**: `createProtectedRoute(useAuth)` (from ts-react).
- **Crashlytics**: `CrashlyticsProvider` + `useCrashlytics()` (from ts-react) for error reporting.
- **Forms**: `react-hook-form` + `zod` schemas; shared wrapper is `Form` from ts-react.
- **Components**: `useInjection(ServiceClass)` for dependency access — never call adapters directly.

## Testing

- Vitest with jsdom environment, v8 provider, 100% coverage enforced
- Render through `AppProviders` with `AppBindingsOverrides({ overrides: [...] })` for IoC
- `test/setup.ts` registers a firebase mock because `AppBindings` instantiates `FirebaseClient` at module load
- Coverage excludes: shadcn components, i18n, form components, `ConfigurationService.ts`, `AppBindings.ts`, `ui/index.tsx`
- Use `/* v8 ignore next -- @preserve */` for unreachable fallback branches

## Adding shadcn components

```bash
npm run add:shadcn button  # Generates and moves to src/ui/components/
```
