# CLAUDE.md — ts-nestjs

NestJS utilities. Depends on `ts-crossplatform` and `ts-nodejs`.

## Build

`tsc --noEmit` + `vite build` — outputs ESM and CJS. Node builtins and NestJS/Express packages are externalized.

## Key exports

- **bootstrap()**: NestJS app startup with config loading and graceful shutdown
- **createApp() / createTestingApp()**: app factory for production and testing
- **AppConfigurationService**: Zod-based config validation via NestJS ConfigService
- **AllExceptionsFilter**: global exception filter
- **SafeBody / SafeQuery / SafeParams**: Zod-validated request decorators
- **CustomLogger**: structured logger (use instead of NestJS Logger)
- **RequestMiddleware**: request logging with optional customizer
- **InMemoryRateLimitGuard**: configurable rate limiting

## Important

- Use `import type` for interfaces when importing alongside values (rolldown/vite 8 is strict about this)
- `RequestMiddlewareLogCustomizer` must be imported as type-only: `import type { RequestMiddlewareLogCustomizer } from '...'`

## Testing

- Vitest with v8 provider, 100% coverage enforced
- `CustomLogger.ts` shows 0% in coverage table but is excluded from threshold calculation
