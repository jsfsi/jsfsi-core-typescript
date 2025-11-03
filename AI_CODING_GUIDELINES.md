# AI Coding Guidelines

This document provides comprehensive guidelines for AI assistants to generate code that follows this repository's patterns and best practices.

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Error Handling](#error-handling)
3. [Code Style](#code-style)
4. [Testing Guidelines](#testing-guidelines)
5. [Domain-Driven Design](#domain-driven-design)
6. [Framework-Specific Patterns](#framework-specific-patterns)
7. [Common Patterns](#common-patterns)

## Architecture Principles

### Hexagonal Architecture

This codebase follows **Hexagonal Architecture** (Ports and Adapters):

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│   (UI Components, Controllers, CLI)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Domain Layer                  │
│   (Services, Models, Domain Logic)     │
│   NO external dependencies              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Adapter Layer                  │
│   (External Services, Database, APIs)   │
│   Try-catch ONLY here (edge)            │
└─────────────────────────────────────────┘
```

**Rules:**
- Domain layer has **NO external dependencies**
- Adapters implement interfaces defined in domain
- Application layer orchestrates domain services
- Try-catch blocks **ONLY** exist in adapters

### Directory Structure

```
src/
├── domain/
│   ├── models/          # Domain entities and failures
│   └── services/        # Domain services (business logic)
├── adapters/           # External integrations (database, APIs)
└── ui/                 # Application/UI layer
    ├── app/            # Application setup
    ├── components/     # React components
    └── pages/         # Page components
```

## Error Handling

### Result Pattern (MANDATORY)

**ALL operations that can fail MUST return `Result<T, E>` types. NEVER throw exceptions in domain layer.**

#### Correct Pattern

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Failure } from '@jsfsi-core/ts-crossplatform';

// ✅ CORRECT - Domain service
export class UserService {
  async getUser(id: string): Promise<Result<User, UserNotFoundFailure>> {
    if (!exists(id)) {
      return Fail(new UserNotFoundFailure(id));
    }
    return Ok(findUser(id));
  }
}

// ✅ CORRECT - Using Result
const [user, failure] = await userService.getUser(id);
if (isFailure(UserNotFoundFailure)(failure)) {
  // Handle error
  return;
}
// TypeScript knows user is defined here
console.log(user.name);
```

#### Wrong Patterns

```typescript
// ❌ WRONG - Throwing exceptions in domain
export class UserService {
  async getUser(id: string): Promise<User> {
    if (!exists(id)) {
      throw new Error('Not found'); // NEVER DO THIS
    }
    return findUser(id);
  }
}

// ❌ WRONG - Using instanceof
if (failure instanceof UserNotFoundFailure) {
  // NEVER DO THIS - use isFailure instead
}
```

### Failure Matchers (MANDATORY)

**ALWAYS use `isFailure` and `notFailure` matchers. NEVER use `instanceof`.**

```typescript
import { isFailure, notFailure } from '@jsfsi-core/ts-crossplatform';

const [user, failure] = await signIn();

// ✅ CORRECT
if (isFailure(SignInFailure)(failure)) {
  // TypeScript narrows type to SignInFailure
  console.error('Sign in failed:', failure.error);
}

if (notFailure(SignInFailure)(failure)) {
  // TypeScript knows it's not a SignInFailure
}

// ❌ WRONG
if (failure instanceof SignInFailure) {
  // NEVER use instanceof
}
```

### Try-Catch (ONLY at Edges)

**Try-catch should ONLY exist in adapters when converting third-party library exceptions to Results.**

```typescript
// ✅ CORRECT - In adapter (edge)
export class FirebaseClient {
  async signIn(): Promise<Result<User, SignInFailure>> {
    try {
      // Third-party library throws exceptions
      const firebaseUser = await this.firebaseAuth.signInWithPopup(provider);
      return Ok(mapToUser(firebaseUser));
    } catch (error) {
      // Convert exception to Result at edge
      return Fail(new SignInFailure(error));
    }
  }
}

// ✅ CORRECT - Domain service (NO try-catch)
export class AuthenticationService {
  async signIn(): Promise<Result<User, SignInFailure>> {
    // No try-catch - adapter already converted exceptions
    return this.authAdapter.signIn();
  }
}

// ❌ WRONG - Try-catch in domain layer
export class AuthenticationService {
  async signIn(): Promise<User> {
    try {
      return await this.authAdapter.signIn();
    } catch (error) {
      throw error; // NEVER DO THIS
    }
  }
}
```

### Failure Classes

Create specific failure classes for different error scenarios:

```typescript
import { Failure } from '@jsfsi-core/ts-crossplatform';

export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}

export class ValidationFailure extends Failure {
  constructor(
    public readonly field: string,
    public readonly message: string,
    public readonly value: unknown,
  ) {
    super();
  }
}
```

## Code Style

### Curly Brackets (MANDATORY)

**ALWAYS use curly brackets for control flow statements.**

```typescript
// ✅ CORRECT
if (condition) {
  return value;
}

for (const item of items) {
  process(item);
}

// ❌ WRONG - No single-line statements
if (condition) return value;
for (const item of items) process(item);
```

### Naming Conventions

- **Classes**: PascalCase - `UserService`, `SignInFailure`
- **Interfaces/Types**: PascalCase - `User`, `AppConfig`
- **Functions/Methods**: camelCase - `signIn()`, `getUser()`
- **Constants**: UPPER_SNAKE_CASE - `APP_CONFIG_TOKEN`
- **Failures**: PascalCase suffix with `Failure` - `SignInFailure`

### TypeScript

- Use **strict TypeScript** configuration
- Prefer **explicit types** over `any`
- Use **interfaces** for object shapes, **types** for unions/intersections
- Leverage **type inference** where it improves readability

### Functions

- Prefer **pure functions** when possible
- Keep functions **small and focused**
- Use **descriptive names**
- **Limit function parameters** (prefer objects for multiple parameters)

## Testing Guidelines

### Test-Driven Development (TDD)

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### Mock Utility

**Use `mock` utility for type-safe test data:**

```typescript
import { mock } from '@jsfsi-core/ts-crossplatform';

type User = {
  id: string;
  email: string;
  name: string;
  profile: {
    bio: string;
    avatar: string;
  };
};

// Create mock with only needed properties
const userData = mock<User>({
  email: 'test@example.com',
  name: 'Test User',
  // profile can be omitted - RecursivePartial makes it optional
});

// Use in tests
const [user, failure] = await userService.createUser(userData);
```

### Testing Result Types

```typescript
import { describe, it, expect } from 'vitest';
import { isFailure } from '@jsfsi-core/ts-crossplatform';

describe('UserService', () => {
  it('returns NotFoundFailure on invalid id', async () => {
    const [user, failure] = await userService.getUser('invalid');

    expect(user).toBeUndefined();
    expect(isFailure(UserNotFoundFailure)(failure)).toBe(true);
    
    if (isFailure(UserNotFoundFailure)(failure)) {
      expect(failure.id).toBe('invalid');
    }
  });
});
```

## Domain-Driven Design

### Domain Models

- **Entities**: Objects with identity (e.g., `User`, `Order`)
- **Value Objects**: Immutable objects defined by attributes
- **Domain Services**: Operations that don't belong to an entity
- **Failures**: Domain-specific error representations (part of domain model)

### Domain Services

Domain services contain business logic and have no external dependencies:

```typescript
// ✅ CORRECT - Domain service
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<Result<User, SignInFailure | ValidationFailure>> {
    // Business logic here
    const [validated, validationFailure] = validateEmail(email);
    if (isFailure(ValidationFailure)(validationFailure)) {
      return Fail(validationFailure);
    }

    return this.authAdapter.signIn(email, password);
  }
}
```

### Failures as Domain Concepts

Failures are part of your domain model, not exceptions to it:

```typescript
export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}

export class InsufficientFundsFailure extends Failure {
  constructor(
    public readonly balance: number,
    public readonly required: number,
  ) {
    super();
  }
}
```

## Framework-Specific Patterns

### NestJS (ts-nestjs)

#### Application Bootstrap

```typescript
import 'reflect-metadata';
import * as path from 'path';
import { bootstrap } from '@jsfsi-core/ts-nestjs';
import { GCPLogger } from '@jsfsi-core/ts-nodejs';
import { AppModule } from './app/AppModule';

bootstrap({
  appModule: AppModule,
  configPath: path.resolve(__dirname, '../configuration'),
  logger: new GCPLogger('my-app'),
});
```

#### App Module Setup

```typescript
import { MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { appConfigModuleSetup, RequestMiddleware } from '@jsfsi-core/ts-nestjs';

@Module({
  imports: [appConfigModuleSetup()],
  controllers: [...controllers],
  providers: [...services, ...adapters],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
```

**Note**: The `appConfigModuleSetup()` function automatically registers the configuration using the `APP_CONFIG_TOKEN`. No additional configuration setup is needed.

#### Request Validation

```typescript
import { SafeBody, SafeQuery, SafeParams } from '@jsfsi-core/ts-nestjs';
import { z } from 'zod';

@Controller('users')
export class UserController {
  @Post()
  async createUser(@SafeBody(CreateUserSchema) user: z.infer<typeof CreateUserSchema>) {
    // user is validated and typed
  }

  @Get(':id')
  async getUser(@SafeParams(z.object({ id: z.string().uuid() })) params: { id: string }) {
    // params.id is validated as UUID
  }
}
```

### Node.js (ts-nodejs)

#### Transactional Repositories

```typescript
import { TransactionalRepository, buildTransactionalRepositoryMock } from '@jsfsi-core/ts-nodejs';
import { DataSource } from 'typeorm';
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { UserNotFoundFailure } from '../../domain/models/UserNotFoundFailure';

export class UserRepository extends TransactionalRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
    const repository = this.getRepository(UserEntity);
    const user = await repository.findOne({ where: { id } });

    if (!user) {
      return Fail(new UserNotFoundFailure(id));
    }

    return Ok(user);
  }
}
```

#### Testing Transactional Repositories

```typescript
import { buildTransactionalRepositoryMock } from '@jsfsi-core/ts-nodejs';

describe('UserRepository', () => {
  it('finds user by id', async () => {
    const mockRepository = buildTransactionalRepositoryMock(new UserRepository(mockDataSource));
    const user = await mockRepository.findById('123');
    // Test implementation
  });
});
```

#### Transactions as Domain Concepts

**Transactions are domain concepts, not persistence concepts.**

Transactions represent business operations that must be atomic. They can include:

- Database operations
- External API calls  
- Any operations that should succeed or fail together

```typescript
return this.orderRepository.withTransaction(async (orderRepo) => {
  // Step 1: Database operation
  const [order, orderFailure] = await orderRepo.save(orderData);
  if (isFailure(SaveOrderFailure)(orderFailure)) {
    return Fail(orderFailure);
  }

  // Step 2: External API call (part of same transaction)
  const [payment, paymentFailure] = await this.paymentService.chargePayment({
    orderId: order.id,
    amount: order.total,
  });

  if (isFailure(PaymentFailure)(paymentFailure)) {
    // Transaction rolls back order creation
    return Fail(paymentFailure);
  }

  return Ok(order);
});
```

## Common Patterns

### Chaining Results

```typescript
async function processOrder(
  orderId: string,
): Promise<Result<Order, ValidationFailure | PaymentFailure>> {
  const [order, validationFailure] = validateOrder(orderData);
  if (isFailure(ValidationFailure)(validationFailure)) {
    return Fail(validationFailure);
  }

  const [payment, paymentFailure] = await processPayment(order);
  if (isFailure(PaymentFailure)(paymentFailure)) {
    return Fail(paymentFailure);
  }

  return Ok({ order, payment });
}
```

### Multiple Failure Types

```typescript
type AuthResult = Result<User, SignInFailure | NetworkFailure | ValidationFailure>;

async function authenticate(email: string, password: string): Promise<AuthResult> {
  const [validated, validationFailure] = validateCredentials({ email, password });
  if (isFailure(ValidationFailure)(validationFailure)) {
    return Fail(validationFailure);
  }

  const [networkCheck, networkFailure] = await checkNetwork();
  if (isFailure(NetworkFailure)(networkFailure)) {
    return Fail(networkFailure);
  }

  const [user, signInFailure] = await signIn(validated.email, validated.password);
  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  return Ok(user);
}
```

## Quick Reference Checklist

When generating code, ensure:

- [ ] **Result types** used for all operations that can fail
- [ ] **isFailure/notFailure** used for failure checking (never instanceof)
- [ ] **Try-catch ONLY in adapters** when converting exceptions to Results
- [ ] **Curly brackets** used for all control flow statements
- [ ] **Domain layer has no external dependencies**
- [ ] **Failures are domain concepts** (part of domain model)
- [ ] **Mock utility** used for test data
- [ ] **TDD principles** followed in tests
- [ ] **Type safety** maintained (no `any` unless necessary)
- [ ] **Hexagonal architecture** respected (domain → adapters → application)

## Import Patterns

```typescript
// Core utilities
import { Result, Ok, Fail, isFailure, notFailure, Failure, mock, RecursivePartial } from '@jsfsi-core/ts-crossplatform';

// NestJS utilities
import { bootstrap, appConfigModuleSetup, RequestMiddleware, SafeBody, SafeQuery, SafeParams, createTestingApp } from '@jsfsi-core/ts-nestjs';

// Node.js utilities
import { TransactionalRepository, buildTransactionalRepositoryMock, Logger, GCPLogger, MockLogger, loadEnvConfig } from '@jsfsi-core/ts-nodejs';
```

