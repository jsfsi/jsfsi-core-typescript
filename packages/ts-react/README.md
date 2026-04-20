# @jsfsi-core/ts-react

React utilities for building applications with hexagonal architecture — IoC container, error boundaries, authentication, theming, forms, and route protection.

## Installation

```bash
npm install @jsfsi-core/ts-react
```

### Peer Dependencies

```bash
npm install react react-dom inversify react-router-dom react-hook-form dequal firebase
```

`firebase` is only required if you use the bundled `FirebaseClient`. The package externalizes `firebase/*` at build time, so it stays out of your app bundle unless you actually import it.

## Architecture

This package provides **framework-level building blocks** for React applications following hexagonal architecture:

- **Dependency Injection** — inversify-based IoC container with React context
- **Error Handling** — Error boundaries with crashlytics reporting
- **Authentication** — Generic `AuthProvider<TUser>` + `AuthenticationAdapter<TUser>` + ready-made `FirebaseClient`
- **Theming** — localStorage-persisted theme with system preference detection
- **Forms** — react-hook-form wrapper with auto-reset
- **Route Protection** — Authenticated route guards

**No styling opinions** — this package intentionally excludes CSS, Tailwind utilities, and styled components. Consuming apps provide their own UI via props.

## Features

### IoC Container

Inversify-based dependency injection for React components:

```typescript
import { IoCContextProvider, useInjection, BindingType } from '@jsfsi-core/ts-react';

// Define bindings
const bindings: readonly BindingType<unknown>[] = [
  { type: AuthService, instance: new AuthService() },
  { type: UserService, dynamicValue: (ctx) => new UserService(ctx.get(AuthService)) },
];

// Provide container
function App() {
  return (
    <IoCContextProvider bindings={bindings}>
      <MyComponent />
    </IoCContextProvider>
  );
}

// Consume dependencies
function MyComponent() {
  const userService = useInjection(UserService);
  // ...
}
```

### Error Boundary & Crashlytics

Error boundary with crash reporting context:

```typescript
import { CrashlyticsProvider, useCrashlytics } from '@jsfsi-core/ts-react';

function ErrorPage({ error }: { error: Error | null }) {
  return <div>Something went wrong: {error?.message}</div>;
}

function App() {
  return (
    <CrashlyticsProvider fallback={ErrorPage}>
      <MyApp />
    </CrashlyticsProvider>
  );
}

// Report errors in components
function MyComponent() {
  const { reportFailure } = useCrashlytics();

  const handleError = (failure: unknown) => {
    reportFailure('Operation failed', failure);
  };
}
```

### Authentication

The package ships three layers you can pick from:

1. `AuthProvider<TUser>` / `useAuth<TUser>()` — generic context that wraps any `AuthService<TUser>` and manages `loading` + `currentUser`.
2. `AuthenticationAdapter<TUser extends User>` — default `AuthService<TUser>` implementation that delegates to an injected `AuthClient<TUser>`.
3. `FirebaseClient` — default `AuthClient<User>` backed by `firebase/compat/auth`.

Use them together, or replace any layer with your own.

#### Typical wiring

`AuthProvider` has no dependency on your IoC container — it receives behavior through callback props. The consuming app resolves its domain service one level up and forwards each method through a callback. This keeps the library boundary clean (it never reaches into your container) and keeps domain logic where it belongs.

Prefer **composition over inheritance** for the domain service. It implements `AuthService<User>` and receives an adapter through the constructor, so you can add business rules (extra validation, logging, feature flags) without touching the adapter.

```typescript
import {
  AuthenticationAdapter,
  AuthProvider,
  FirebaseClient,
  IoCContextProvider,
  useInjection,
  type AuthService,
  type EmailPasswordCredentials,
  type User,
} from '@jsfsi-core/ts-react';

// Domain service — composes the adapter, does not extend it.
export class AuthenticationService implements AuthService<User> {
  constructor(private readonly authenticationAdapter: AuthenticationAdapter<User>) {}

  onAuthStateChanged(cb: (u: User | null) => void) { return this.authenticationAdapter.onAuthStateChanged(cb); }
  signOut()                                         { return this.authenticationAdapter.signOut(); }
  signIn()                                          { return this.authenticationAdapter.signIn(); }
  signInWithEmailAndPassword(c: EmailPasswordCredentials) { return this.authenticationAdapter.signInWithEmailAndPassword(c); }
  signUp()                                          { return this.authenticationAdapter.signUp(); }
  signUpWithEmailAndPassword(c: EmailPasswordCredentials) { return this.authenticationAdapter.signUpWithEmailAndPassword(c); }
  sendPasswordResetEmail(email: string)             { return this.authenticationAdapter.sendPasswordResetEmail(email); }
}

const bindings = [
  {
    type: FirebaseClient,
    instance: new FirebaseClient(firebaseConfig).initialize(),
  },
  {
    type: AuthenticationAdapter,
    dynamicValue: (ctx) => new AuthenticationAdapter<User>(ctx.get(FirebaseClient)),
  },
  {
    type: AuthenticationService,
    dynamicValue: (ctx) =>
      new AuthenticationService(ctx.get<AuthenticationAdapter<User>>(AuthenticationAdapter)),
  },
];

// Wire the service to the provider. `AppAuthProvider` lives in your app layer
// and is the only place that knows both the IoC container and AuthProvider.
function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const service = useInjection(AuthenticationService);

  return (
    <AuthProvider<User>
      loader={FullscreenLoader}
      onAuthChanged={(cb) => service.onAuthStateChanged(cb)}
      onSignIn={() => service.signIn()}
      onSignOut={() => service.signOut()}
      onSignInWithEmailAndPassword={(c) => service.signInWithEmailAndPassword(c)}
      onSignUp={() => service.signUp()}
      onSignUpWithEmailAndPassword={(c) => service.signUpWithEmailAndPassword(c)}
      onSendPasswordResetEmail={(email) => service.sendPasswordResetEmail(email)}
    >
      {children}
    </AuthProvider>
  );
}

function App() {
  return (
    <IoCContextProvider bindings={bindings}>
      <AppAuthProvider>
        <Routes />
      </AppAuthProvider>
    </IoCContextProvider>
  );
}
```

Four layers compose top-down: **app callbacks** (wire IoC to the provider) → **`AuthenticationService`** (domain) → **`AuthenticationAdapter<User>`** (port adapter) → **`FirebaseClient`** (edge). `AuthProvider` only knows about the callbacks.

Callback props are held in refs internally, so you don't need to wrap them in `useMemo`/`useCallback` — passing inline arrows on every render is fine and does not re-subscribe to `onAuthChanged`.

`AuthProvider` renders `<Loader />` in place of its children while `loading` is `true` (initial mount and during any wrapped call). Each method is wrapped with `try/finally`, so `loading` resets even if the underlying call throws. The context value is memoized, so unrelated re-renders of the provider don't cascade to consumers.

#### Consuming the context

```typescript
import { useAuth } from '@jsfsi-core/ts-react';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { SignInFailure } from '@jsfsi-core/ts-react';

function LoginForm() {
  const { signInWithEmailAndPassword, loading } = useAuth<User>();

  const handleSubmit = async (email: string, password: string) => {
    const [user, failure] = await signInWithEmailAndPassword({ email, password });

    if (isFailure(SignInFailure)(failure)) {
      toast.error(t('login.errors.failed'));
      return;
    }

    navigate('/dashboard');
  };

  // ...
}
```

#### Custom `AuthClient`

Skip `FirebaseClient` entirely and plug in your own provider (Auth0, Supabase, etc.) by implementing `AuthClient<TUser>`:

```typescript
import type { AuthClient } from '@jsfsi-core/ts-react';

class MyAuthClient implements AuthClient<MyUser> {
  onAuthStateChanged(callback) { /* ... */ }
  signOut() { /* ... */ }
  signInWithGoogle() { /* ... */ }
  signInWithEmailAndPassword(credentials) { /* ... */ }
  createUserWithEmailAndPassword(credentials) { /* ... */ }
  sendPasswordResetEmail(email) { /* ... */ }
}
```

Then bind `MyAuthClient` in place of `FirebaseClient` — `AuthenticationAdapter` is agnostic to the underlying provider.

#### Failures

All auth methods return `Result<T, Failure>` from `@jsfsi-core/ts-crossplatform`. Discriminate with `isFailure()`:

- `SignInFailure` — sign-in (Google or email/password) failed
- `SignUpFailure` — email/password sign-up failed
- `PasswordResetEmailFailure` — password reset request failed

### Authenticated HTTP client (Firebase)

`FirebaseAuthenticatedHttpClient` extends `HttpSafeClient` (from `@jsfsi-core/ts-crossplatform`) and injects the signed-in user's Firebase id token as a `Bearer` token.

The name is intentionally explicit: this class is coupled to `FirebaseClient`, so Firebase appears in the type name. Consumers using a different auth provider (Auth0, Supabase, etc.) should **not** use this class — extend `HttpSafeClient` directly and return your own `Authorization` header from `getHeaders()`.

Bind it in your IoC container alongside `FirebaseClient`, extend it in a domain adapter, then resolve that adapter via `useInjection` inside a component. Do **not** hardcode `baseUrl` inside the class — pass it through the constructor (the constructor signature enforces this) so tests can point at a mock server.

```typescript
import { FirebaseAuthenticatedHttpClient, FirebaseClient, useInjection } from '@jsfsi-core/ts-react';

// 1. Bind in AppBindings — baseUrl comes from app config via dynamicValue.
const bindings = [
  {
    type: FirebaseClient,
    instance: new FirebaseClient(firebaseConfig).initialize(),
  },
  {
    type: FirebaseAuthenticatedHttpClient,
    dynamicValue: (ctx) =>
      new FirebaseAuthenticatedHttpClient(ctx.get(FirebaseClient), configuration.VITE_API_URL),
  },
  {
    type: UsersAdapter,
    dynamicValue: (ctx) => new UsersAdapter(ctx.get(FirebaseAuthenticatedHttpClient)),
  },
];

// 2. Extend (or compose) it in a domain adapter. UserSchema and UserFailure are
//    placeholders the reader supplies.
export class UsersAdapter {
  constructor(private readonly httpClient: FirebaseAuthenticatedHttpClient) {}

  getCurrentUser() {
    return this.httpClient.fetch('/users/me', UserSchema, UserFailure, { method: 'GET' });
  }
}

// 3. Resolve the adapter via useInjection inside a component.
function CurrentUser() {
  const usersAdapter = useInjection(UsersAdapter);
  // ...
}
```

See `@jsfsi-core/ts-crossplatform` docs for the `HttpSafeClient` API (`fetch`, `fetchBlob`, failure types).

### Theme Provider

localStorage-persisted theme with system preference detection:

```typescript
import { ThemeProvider, useTheme } from '@jsfsi-core/ts-react';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <MyApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</button>;
}
```

### Form

react-hook-form wrapper with auto-reset on `defaultValues` change:

```typescript
import { Form } from '@jsfsi-core/ts-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

function MyForm({ defaultValues }: { defaultValues: { name: string } }) {
  return (
    <Form
      resolver={zodResolver(schema)}
      defaultValues={defaultValues}
      onSubmit={(data) => console.log(data)}
    >
      {/* Form fields using react-hook-form's useFormContext */}
    </Form>
  );
}
```

### Hooks

#### useService

Async data-fetching hook that exposes `{ data, fetching, refetch }` and rethrows caught errors from render so they can be caught by `ErrorBoundary`.

```typescript
import { useService } from '@jsfsi-core/ts-react';

function TenantsList() {
  const tenantsService = useInjection(TenantsService);
  const { data, fetching, refetch } = useService(
    { service: () => tenantsService.list() },
    [],
  );

  if (fetching) return <Spinner />;
  return <ul>{data?.map((t) => <li key={t.id}>{t.displayName}</li>)}</ul>;
}
```

Pass `staleData: true` to keep the previous `data` visible during a refetch instead of clearing it.

#### useDebounce

Returns a stable debounced function that only fires `delay` ms after the last call.

```typescript
import { useDebounce } from '@jsfsi-core/ts-react';

function SearchBox() {
  const searchService = useInjection(SearchService);
  const debouncedSearch = useDebounce((q: string) => searchService.search(q), 300);

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

#### useIsMobile

Returns `true` when the viewport is under 768 px; listens to `matchMedia('(max-width: 767px)')` and updates on resize.

```typescript
import { useIsMobile } from '@jsfsi-core/ts-react';

function Nav() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

### Protected Route (Factory Pattern)

Create route guards tied to your auth context:

```typescript
import { createProtectedRoute } from '@jsfsi-core/ts-react';
import { useAuth } from './auth';

export const ProtectedRoute = createProtectedRoute(useAuth);

// Usage in router
<Route path="/dashboard" element={
  <ProtectedRoute redirectTo="/login" loader={LoadingSpinner}>
    <DashboardPage />
  </ProtectedRoute>
} />
```

## Security

- `User.idToken` is held in React state and accessible to any script running on the page. Consuming apps MUST enforce a strict Content Security Policy and treat any XSS as a token-exfiltration incident. Never persist `idToken` in `localStorage` or `sessionStorage`.
- `FirebaseClient` uses `firebase/compat` and `signInWithPopup`. Popup blockers, strict COOP/COEP headers, or embedded contexts (iframes) can break the flow — fall back to a redirect-based `AuthClient` if you need to support those.

## Testing

Components from this package can be tested using standard React Testing Library patterns. Override IoC bindings for tests:

```typescript
import { IoCContextProvider, BindingType } from '@jsfsi-core/ts-react';
import { mock } from '@jsfsi-core/ts-crossplatform';

const testBindings: readonly BindingType<unknown>[] = [
  { type: MyService, instance: mock<MyService>({ getData: vi.fn() }) },
];

render(
  <IoCContextProvider bindings={testBindings}>
    <MyComponent />
  </IoCContextProvider>
);
```

For apps that register a fixed list of bindings at the root (e.g. `AppBindings`), use `createBindingsOverrides` to produce a test helper that swaps selected bindings while keeping the rest intact:

```typescript
// test/app-bindings-overrides.ts
import { createBindingsOverrides } from '@jsfsi-core/ts-react';
import { AppBindings } from '../src/ui/app/AppBindings';

export const AppBindingsOverrides = createBindingsOverrides(AppBindings);
```

```typescript
// MyComponent.test.tsx
import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { AppBindingsOverrides } from '../../test/app-bindings-overrides';
import { AppProviders } from './AppProviders';

render(
  <AppProviders
    bindings={AppBindingsOverrides({
      overrides: [
        { type: MyService, dynamicValue: () => mock<MyService>({ getData: vi.fn() }) },
      ],
    })}
  >
    <MyComponent />
  </AppProviders>,
);
```

## License

ISC
