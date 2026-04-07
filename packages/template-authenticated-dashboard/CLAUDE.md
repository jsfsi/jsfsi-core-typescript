# CLAUDE.md — template-authenticated-dashboard

React + Firebase authenticated dashboard template with hexagonal architecture.

## Build

`tsc` + `vite build` — outputs static assets to `dist/`.

## Structure

```
src/
├── adapters/              # Firebase client, HTTP adapters
├── domain/                # Models, services (pure business logic)
├── ConfigurationService.ts # Vite env var parsing
└── ui/
    ├── app/               # App root, router, bindings (IoC)
    ├── components/        # Reusable UI components (shadcn/ui based)
    ├── i18n/              # Internationalization (i18next)
    ├── pages/             # Page components
    ├── theme/             # Theme provider (light/dark/system)
    └── hooks/             # Custom hooks
```

## Key patterns

- **IoC container**: `AppBindings.ts` registers adapters and services. Tests override via `AppBindingsOverrides`
- **All text via i18n**: `useTranslation()` — never hardcode strings
- **Auth**: Firebase via `FirebaseClient` adapter, `AuthContext` provider, `ProtectedRoute` component
- **Crashlytics**: `CrashlyticsProvider` + `useCrashlytics()` for error reporting
- **Forms**: `react-hook-form` + `zod` schemas
- **Components**: `useInjection(ServiceClass)` for dependency access — never call adapters directly

## Testing

- Vitest with jsdom environment, v8 provider, 100% coverage enforced
- Render through `AppProviders` with `AppBindingsOverrides({ overrides: [...] })` for IoC
- Coverage excludes: shadcn components, theme, i18n, auth components, form components, `ConfigurationService.ts`, `AppBindings.ts`, `CrashlyticsContext.ts`
- Use `/* v8 ignore next -- @preserve */` for unreachable fallback branches

## Adding shadcn components

```bash
npm run add:shadcn button  # Generates and moves to src/ui/components/
```
