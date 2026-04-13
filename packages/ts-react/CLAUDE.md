# CLAUDE.md — ts-react

React utilities for building applications with hexagonal architecture. No styling opinions — all visual components are provided by the consuming app.

## Build

`tsc --noEmit` + `vite build` — outputs ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`) with declarations via `vite-plugin-dts`.

## Key exports

- **IoCContextProvider** / **useInjection**: inversify-based dependency injection for React. `BindingType<T>` supports `instance`, `dynamicValue`, and `toSelf` bindings.
- **ErrorBoundary**: class component catching render errors + unhandled rejections. Accepts optional `fallback` component prop.
- **CrashlyticsProvider**: composes ErrorBoundary + CrashlyticsContext. `useCrashlytics()` for error reporting.
- **ThemeProvider** / **useTheme**: localStorage-persisted theme (dark/light/system). Applies CSS class to document root.
- **AuthProvider\<TUser\>** / **useAuth\<TUser\>()**: generic auth context. Decoupled from IoC — the consuming app passes behavior as callback props, not a service class. Props: `loader`, `onAuthChanged(callback) => unsubscribe`, and the six method callbacks `onSignIn` / `onSignOut` / `onSignInWithEmailAndPassword` / `onSignUp` / `onSignUpWithEmailAndPassword` / `onSendPasswordResetEmail`. The provider stores callbacks in refs so consumers don't have to memoize them. Exposes `{ currentUser, loading, signIn, signOut, signInWithEmailAndPassword, signUp, signUpWithEmailAndPassword, sendPasswordResetEmail }`; each exposed method is wrapped with try/finally so `loading` always resets, even on throw. Context value is memoized. While `loading` is true the provider renders `<Loader />` instead of children.
- **AuthenticationAdapter\<TUser extends User\>**: implements `AuthService<TUser>` by delegating to an `AuthClient<TUser>`. Treat it as an injectable dependency. Consuming apps typically define a domain `AuthenticationService` that **composes** (not extends) the adapter — `AuthenticationService implements AuthService<User>` with `AuthenticationAdapter<User>` injected through the constructor. Bind `AuthenticationAdapter` in IoC as-is (the generic class erases at runtime, so `container.get(AuthenticationAdapter)` works).
- **FirebaseClient**: `AuthClient<User>` backed by `firebase/compat/auth`. Constructor takes `FirebaseConfig`; call `.initialize()` before use. Firebase is a peer dependency and is externalized from the built bundle (kept at ~8 kB gzipped).
- **User**: base user type. Generic `TUser` params throughout the package are constrained with `extends User`.
- **SignInFailure** / **SignUpFailure** / **PasswordResetEmailFailure**: one class per file, each extending `Failure` with `constructor(public readonly error: unknown)`.
- **createProtectedRoute(useAuth)**: factory returning a `ProtectedRoute` component with `redirectTo` and `loader` props.
- **Form**: react-hook-form wrapper with auto-reset on `defaultValues` change (via `dequal`).

## Design principle

This package intentionally excludes styling utilities (`cn()`, `FullscreenLoader`, `FormInput`, etc.). Consuming apps provide their own styled components via props (e.g., `loader` on `AuthProvider`).

## Security notes

- `User.idToken` is held in React state and accessible to any script running on the page. Consuming apps MUST enforce a strict CSP and treat any XSS as a token-exfiltration incident. Never persist `idToken` in `localStorage` or `sessionStorage`.

## Testing

- Vitest with jsdom environment, v8 provider, 100% coverage enforced
- Coverage excludes: `src/index.ts`, `src/**/index.ts`, `src/auth/User.ts` (type-only), `src/error-boundary/CrashlyticsContext.ts`, `src/ioc/IoCContext.ts`
- `test/setup.ts` registers global mocks for `firebase/compat/app`, `localStorage`, and `matchMedia`
- Tests are co-located with source files
- AuthProvider tests pass callback props directly (no IoC wrapper needed) and must drive `authCallback(null)` before asserting consumer output, because `loading` starts `true` and the provider renders the loader in place of children until auth state resolves
