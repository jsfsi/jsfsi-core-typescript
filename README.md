# JSFSI Core TypeScript Monorepo

A TypeScript monorepo containing core packages and templates built with Domain-Driven Design (DDD), Hexagonal Architecture, and Test-Driven Development (TDD) principles.

## 📦 Packages

This monorepo contains the following packages:

- **[`@jsfsi-core/ts-crossplatform`](./packages/ts-crossplatform)** - Cross-platform utilities including Result types, Failure handling, configuration, and common domain primitives
- **[`@jsfsi-core/ts-nestjs`](./packages/ts-nestjs)** - NestJS-specific utilities for building robust backend applications
- **[`@jsfsi-core/ts-nodejs`](./packages/ts-nodejs)** - Node.js-specific utilities for database, logging, and environment management
- **[`@jsfsi-core/template-authenticated-dashboard`](./packages/template-authenticated-dashboard)** - Template application demonstrating best practices with authentication

## ⚠️ Usage Recommendation

**We strongly recommend copying code from this repository instead of installing it as a dependency.**

This repository provides **simple utilities** designed to enforce good design patterns and best practices. The code is intentionally:

- **Lightweight**: Minimal utilities that focus on patterns rather than complex functionality
- **Educational**: Serves as a reference implementation of architectural patterns
- **Adaptable**: Meant to be customized to fit your specific project needs

### Why Copy Instead of Install?

1. **Ownership**: You maintain full control over the code and can modify it to fit your needs
2. **Customization**: Adapt utilities to match your project's specific requirements and conventions
3. **Learning**: Copying code helps you understand the patterns deeply and internalize best practices
4. **Simplicity**: Avoids adding external dependencies for simple utilities that are better understood when owned
5. **Pattern Enforcement**: Having the code in your codebase reinforces the patterns as part of your team's knowledge

### What to Copy

- **Result types and Failure handling** from `ts-crossplatform/src/result/` and `ts-crossplatform/src/failures/`
- **Configuration utilities** from `ts-crossplatform/src/configuration/`
- **Domain primitives** (GUID, DateTime, etc.) as needed
- **Framework-specific utilities** (NestJS, Node.js) as templates to adapt
- **Template applications** as starting points for new projects

You can copy individual files or entire modules based on what you need. The code is designed to be simple enough to understand quickly and adapt as needed.

### When Installation Makes Sense

Installing as a dependency may make sense if:

- You need to share utilities across multiple independent projects
- You want automatic updates (though this is generally discouraged for simple utilities)
- You're building a library that depends on these patterns

However, for most applications, **copying the code is the recommended approach**.

> **For AI Assistants**: See [.cursorrules](./.cursorrules) for comprehensive guidelines on generating code that follows this repository's patterns and best practices.

## 🏗️ Architecture

This monorepo follows **Hexagonal Architecture** (also known as Ports and Adapters), which separates business logic from external concerns:

```
┌─────────────────────────────────────────────────┐
│              Application Layer                  │
│  (UI Components, Controllers, CLI Interfaces)   │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              Domain Layer                       │
│  (Services, Models, Domain Logic)               │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              Adapter Layer                      │
│  (External Services, Database, APIs)            │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **Domain Layer** contains pure business logic with no external dependencies
2. **Adapters** implement interfaces defined in the domain
3. **Application Layer** orchestrates domain services
4. **Dependency Inversion**: Domain depends on abstractions, not implementations

### Example Structure

```
src/
├── domain/
│   ├── models/          # Domain entities and value objects
│   └── services/        # Domain services (business logic)
├── adapters/           # External integrations (database, APIs, etc.)
└── ui/                 # Application/UI layer (controllers, components)
```

## 📝 Naming Conventions

### Files and Directories

- **Files**: Use PascalCase for classes/interfaces (e.g., `UserService.ts`, `AuthenticationAdapter.ts`)
- **Directories**: Use camelCase or kebab-case (e.g., `AuthenticationAdapter/`, `ui/components/`)
- **Tests**: Use `.test.ts` or `.test.tsx` suffix (e.g., `UserService.test.ts`)

### Code Naming

- **Classes**: PascalCase (e.g., `User`, `SignInFailure`, `AuthenticationService`)
- **Interfaces/Types**: PascalCase (e.g., `User`, `AppConfig`, `OnAuthStateChangedCallback`)
- **Functions/Methods**: camelCase (e.g., `signIn()`, `onAuthStateChanged()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `APP_CONFIG_TOKEN`, `VITE_FIREBASE_API_KEY`)
- **Private members**: Prefix with `private readonly` when appropriate

### Domain Models

- **Entities**: Use descriptive nouns (e.g., `User`, `Order`)
- **Value Objects**: Use descriptive nouns (e.g., `Email`, `Address`)
- **Failures**: Suffix with `Failure` (e.g., `SignInFailure`, `ValidationFailure`)

## 📋 Coding Guidelines

### TypeScript

- Use **strict TypeScript** configuration
- Prefer **explicit types** over `any`
- Use **interfaces** for object shapes, **types** for unions/intersections
- Leverage **type inference** where it improves readability

### Code Organization

- **One class/interface per file** (except for closely related types)
- **Barrel exports** (`index.ts`) for public APIs
- **Group related code** by feature/domain, not by technical layer

### Functions and Methods

- Prefer **pure functions** when possible
- Keep functions **small and focused** (Single Responsibility Principle)
- Use **descriptive names** that express intent
- **Limit function parameters** (prefer objects for multiple parameters)

### Example

```typescript
// ❌ Bad
function process(data: any, id: number, flag: boolean): any {
  // ...
}

// ✅ Good
function processUserData(data: UserData): Result<User> {
  // ...
}
```

## 🧪 Testing Principles

### Test-Driven Development (TDD)

This project follows **TDD** principles:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### Test Coverage

- **100% code coverage** required for domain logic and utilities
- Use **Vitest** as the testing framework
- Test files should be co-located with source files or in a `test/` directory

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { Ok, Fail, Result } from './result';
import { isFailure } from '../failures';

describe('UserService', () => {
  describe('signIn', () => {
    it('returns user on successful authentication', async () => {
      const [user, failure] = await userService.signIn();

      expect(user).toBeDefined();
      expect(failure).toBeUndefined();
    });

    it('returns SignInFailure on authentication error', async () => {
      const [user, failure] = await userService.signIn();

      expect(user).toBeUndefined();
      expect(isFailure(SignInFailure)(failure)).toBe(true);
    });
  });
});
```

### Mock Utilities

Use the `mock` utility from `@jsfsi-core/ts-crossplatform` to create type-safe test data:

```typescript
import { describe, it, expect } from 'vitest';
import { mock, isFailure } from '@jsfsi-core/ts-crossplatform';
import { UserService } from './UserService';

type User = {
  id: string;
  email: string;
  name: string;
  profile: {
    bio: string;
    avatar: string;
  };
};

describe('UserService', () => {
  it('creates user with mock data', async () => {
    // Create mock user with only needed properties
    const userData = mock<User>({
      email: 'test@example.com',
      name: 'Test User',
      // profile can be omitted - RecursivePartial makes it optional
    });

    const [user, failure] = await userService.createUser(userData);

    expect(user).toBeDefined();
    expect(failure).toBeUndefined();
    expect(user?.email).toBe('test@example.com');
  });

  it('updates user profile with nested mock', async () => {
    const userData = mock<User>({
      id: '123',
      email: 'test@example.com',
      profile: {
        bio: 'Updated bio',
        // avatar omitted - only need bio for this test
      },
    });

    const [user, failure] = await userService.updateUser(userData);

    expect(isFailure(UpdateUserFailure)(failure)).toBe(false);
    expect(user?.profile.bio).toBe('Updated bio');
  });
});
```

**Benefits of using `mock`:**

- **Type Safety**: Mock objects are fully typed - catch errors at compile time
- **Flexibility**: Only specify properties needed for each test
- **No Setup Required**: Simple function call, no complex configuration
- **Recursive**: Works with deeply nested objects via `RecursivePartial`

### Testing Best Practices

- **Test behavior, not implementation**
- Use **descriptive test names** that explain what is being tested
- **Mock external dependencies** (APIs, databases, file system)
- **Isolate tests** - each test should be independent
- Use **test doubles** (mocks, stubs, fakes) for external services

## ⚠️ Error Handling Principles

### Result Class Pattern

Use the **Result type** for typed returns and explicit error handling:

```typescript
import { Result, Ok, Fail } from '@jsfsi-core/ts-crossplatform';
import { Failure } from '@jsfsi-core/ts-crossplatform';

type Result<T, E extends Failure> = [T, E | undefined];

// Success case
function getUserId(): Result<number, ValidationFailure> {
  return Ok(42);
}

// Failure case
function getUserId(): Result<number, ValidationFailure> {
  return Fail(new ValidationFailure('Invalid user'));
}
```

### Failure Checking

**Always use `isFailure` and `notFailure` matchers** - never use `instanceof` directly:

```typescript
import { isFailure, notFailure } from '@jsfsi-core/ts-crossplatform';

// ✅ Good
const [user, failure] = await signIn();
if (isFailure(SignInFailure)(failure)) {
  // Handle SignInFailure
} else if (notFailure(SignInFailure)(failure)) {
  // Not a SignInFailure (could be another failure type or undefined)
}

// ❌ Bad
if (failure instanceof SignInFailure) {
  // Don't use instanceof directly
}
```

### Try-Catch at Edges Only

**Try-catch blocks should only exist at the edges of hexagonal architecture** (in adapters):

```typescript
// ✅ Good - In adapter layer (edge of architecture)
export class FirebaseClient {
  public async signIn(): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithPopup(provider);
      return Ok(mapToUser(firebaseUser));
    } catch (error) {
      return Fail(new SignInFailure(error));
    }
  }
}

// ✅ Good - In domain service (no try-catch)
export class AuthenticationService {
  public async signIn(): Promise<Result<User, SignInFailure>> {
    // No try-catch here - errors are handled as Result types
    return this.authAdapter.signIn();
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
  constructor(public readonly message: string) {
    super();
  }
}
```

### Error Propagation

- **Domain layer**: Returns `Result<T, Failure>` - no exceptions thrown
- **Adapter layer**: Catches exceptions and converts to `Result<T, Failure>`
- **Application layer**: Handles `Result` types and maps to appropriate responses

### Why Result/Failure Pattern Over Throw/Try-Catch?

The Result/Failure pattern provides several advantages over traditional exception handling:

#### 1. **Type Safety**

Exceptions are **not part of the type system** in TypeScript. A function signature doesn't reveal what exceptions it might throw:

```typescript
// ❌ Bad - Exceptions not visible in type signature
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
// Caller doesn't know this can throw!

// ✅ Good - Failures are part of the type signature
function divide(a: number, b: number): Result<number, DivisionByZeroFailure> {
  if (b === 0) {
    return Fail(new DivisionByZeroFailure());
  }
  return Ok(a / b);
}
// Type signature explicitly shows possible failures
```

#### 2. **Explicit Error Handling**

The Result pattern **forces** you to handle errors explicitly, while exceptions can be silently ignored:

```typescript
// ❌ Bad - Errors can be ignored
function getUser(id: string): User {
  // Could throw, but caller might forget to handle it
  if (!exists(id)) {
    throw new NotFoundError();
  }
  return findUser(id);
}

const user = getUser('123'); // No error handling required!
console.log(user.name); // Might crash at runtime

// ✅ Good - Errors must be handled
function getUser(id: string): Result<User, NotFoundFailure> {
  if (!exists(id)) {
    return Fail(new NotFoundFailure(id));
  }
  return Ok(findUser(id));
}

const [user, failure] = getUser('123');
// TypeScript forces you to check for failure
if (isFailure(NotFoundFailure)(failure)) {
  // Must handle error
  return;
}
console.log(user.name); // TypeScript knows user is defined here
```

#### 3. **Functional Composition**

Results compose naturally in functional programming, while exceptions break composition:

```typescript
// ❌ Bad - Exceptions break composition
function processOrder(orderId: string): Order {
  const order = getOrder(orderId); // Might throw
  const user = getUser(order.userId); // Might throw
  const payment = processPayment(order); // Might throw
  return updateOrder(order, payment); // Might throw
}
// If any throws, whole chain breaks unpredictably

// ✅ Good - Results compose naturally
function processOrder(orderId: string): Result<Order, OrderFailure> {
  const [order, orderFailure] = getOrder(orderId);
  if (isFailure(NotFoundFailure)(orderFailure)) {
    return Fail(orderFailure);
  }

  const [user, userFailure] = getUser(order.userId);
  if (isFailure(NotFoundFailure)(userFailure)) {
    return Fail(userFailure);
  }

  const [payment, paymentFailure] = processPayment(order);
  if (isFailure(PaymentFailure)(paymentFailure)) {
    return Fail(paymentFailure);
  }

  return updateOrder(order, payment);
}
// Each step's errors are explicit and composable
```

#### 4. **No Hidden Control Flow**

Exceptions create **hidden control flow** that's hard to reason about:

```typescript
// ❌ Bad - Hidden control flow
function processData(data: Data): ProcessedData {
  validate(data); // Might throw - exits function immediately
  transform(data); // Might throw - exits function immediately
  return save(data); // Might throw - exits function immediately
}
// Hard to trace execution path

// ✅ Good - Explicit control flow
function processData(data: Data): Result<ProcessedData, ProcessFailure> {
  const [validated, validationFailure] = validate(data);
  if (isFailure(ValidationFailure)(validationFailure)) {
    return Fail(validationFailure);
  }

  const [transformed, transformFailure] = transform(validated);
  if (isFailure(TransformFailure)(transformFailure)) {
    return Fail(transformFailure);
  }

  return save(transformed);
}
// Execution path is explicit and traceable
```

#### 5. **Domain-Driven Design**

Failures are **part of the domain model**, not exceptions to it:

```typescript
// ❌ Bad - Errors as exceptions (technical concern)
class UserService {
  async signIn(email: string, password: string): Promise<User> {
    if (!isValid(email)) {
      throw new Error('Invalid email'); // Generic technical error
    }
    // ...
  }
}

// ✅ Good - Failures as domain concepts
export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}

export class ValidationFailure extends Failure {
  constructor(
    public readonly field: string,
    public readonly message: string,
  ) {
    super();
  }
}

class AuthenticationService {
  async signIn(
    email: string,
    password: string,
  ): Promise<Result<User, SignInFailure | ValidationFailure>> {
    const [validated, validationFailure] = validateEmail(email);
    if (isFailure(ValidationFailure)(validationFailure)) {
      return Fail(validationFailure);
    }
    // ...
  }
}
// Failures are domain concepts that can be reasoned about
```

#### 6. **Easier Testing**

Results make testing easier and more explicit:

```typescript
// ❌ Bad - Testing exceptions requires special setup
describe('UserService', () => {
  it('throws on invalid input', () => {
    expect(() => userService.getUser('invalid')).toThrow(); // Which error?
  });
});

// ✅ Good - Testing Results is straightforward
describe('UserService', () => {
  it('returns NotFoundFailure on invalid id', async () => {
    const [user, failure] = await userService.getUser('invalid');

    expect(user).toBeUndefined();
    expect(isFailure(NotFoundFailure)(failure)).toBe(true);
    if (isFailure(NotFoundFailure)(failure)) {
      expect(failure.id).toBe('invalid');
    }
  });
});
```

#### 7. **Performance**

Exceptions have performance overhead (stack unwinding), while Results are just tuple returns:

```typescript
// ❌ Bad - Exception performance overhead
function process(items: Item[]): Item[] {
  return items.map((item) => {
    if (!isValid(item)) {
      throw new Error('Invalid'); // Stack unwinding overhead
    }
    return transform(item);
  });
}

// ✅ Good - No performance overhead
function process(items: Item[]): Result<Item[], ValidationFailure> {
  const results = items.map((item) => validate(item));
  const failures = results.filter(([_, failure]) => failure !== undefined);

  if (failures.length > 0) {
    return Fail(new ValidationFailure(failures));
  }

  return Ok(items.map(transform));
}
```

#### 8. **Error Context**

Results allow you to carry rich context, while exceptions lose context in the stack:

```typescript
// ❌ Bad - Lost context in exception chain
try {
  await serviceA();
} catch (error) {
  try {
    await serviceB(); // Original error context lost
  } catch (nestedError) {
    // Hard to trace original error
  }
}

// ✅ Good - Preserved context
const [resultA, failureA] = await serviceA();
if (isFailure(ServiceAFailure)(failureA)) {
  const [resultB, failureB] = await serviceB();
  if (isFailure(ServiceBFailure)(failureB)) {
    // Both failures preserved with full context
    return Fail(new CompositeFailure([failureA, failureB]));
  }
}
```

#### 9. **Async/Await Compatibility**

Results work naturally with async/await, avoiding nested try-catch:

```typescript
// ❌ Bad - Nested try-catch with async
async function processOrder(orderId: string): Promise<Order> {
  try {
    const order = await getOrder(orderId);
    try {
      const user = await getUser(order.userId);
      try {
        const payment = await processPayment(order);
        return updateOrder(order, payment);
      } catch (paymentError) {
        // Handle payment error
      }
    } catch (userError) {
      // Handle user error
    }
  } catch (orderError) {
    // Handle order error
  }
}

// ✅ Good - Flat async flow
async function processOrder(orderId: string): Promise<Result<Order, OrderFailure>> {
  const [order, orderFailure] = await getOrder(orderId);
  if (isFailure(NotFoundFailure)(orderFailure)) {
    return Fail(orderFailure);
  }

  const [user, userFailure] = await getUser(order.userId);
  if (isFailure(NotFoundFailure)(userFailure)) {
    return Fail(userFailure);
  }

  const [payment, paymentFailure] = await processPayment(order);
  if (isFailure(PaymentFailure)(paymentFailure)) {
    return Fail(paymentFailure);
  }

  return updateOrder(order, payment);
}
```

### When to Use Try-Catch

Try-catch should **only be used at the edges** of hexagonal architecture (in adapters) to convert exceptions to Results. This is necessary because **most third-party libraries follow the exception/throwing pattern**, and we need to convert those exceptions into our domain's Result/Failure pattern.

#### Why Third-Party Libraries Use Exceptions

Most third-party libraries (APIs, databases, file systems, etc.) use the exception pattern because:

1. **Historical conventions**: Exceptions are the standard in many ecosystems (Java, C#, etc.)
2. **Language limitations**: Older languages didn't have good alternatives
3. **Simplicity for library authors**: Exceptions are easy to implement
4. **Backward compatibility**: Libraries must maintain compatibility with existing code

#### Converting Exceptions to Results

At the **adapter layer** (edges of hexagonal architecture), we catch exceptions from third-party libraries and convert them to our Result pattern:

```typescript
// ✅ Good - Try-catch at edge (adapter layer)
// Converting third-party library exceptions to domain Results
export class FirebaseClient {
  public async signIn(): Promise<Result<User, SignInFailure>> {
    try {
      // Third-party library (Firebase) uses exceptions
      const firebaseUser = await this.firebaseAuth.signInWithPopup(provider);

      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      const user = await this.mapFirebaseUserToUser(firebaseUser.user);
      return Ok(user);
    } catch (error) {
      // Convert external exception to domain Result
      // This is necessary because Firebase throws exceptions
      return Fail(new SignInFailure(error));
    }
  }

  public async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    try {
      // Third-party library throws exceptions - we catch and convert
      const firebaseUser = await this.firebaseAuth.signInWithEmailAndPassword(email, password);

      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      const user = await this.mapFirebaseUserToUser(firebaseUser.user);
      return Ok(user);
    } catch (error) {
      // Exception from third-party library converted to Result
      return Fail(new SignInFailure(error));
    }
  }
}
```

#### Examples of Third-Party Libraries Using Exceptions

```typescript
// Database libraries (TypeORM, Prisma, etc.)
try {
  await dataSource.query('SELECT * FROM users');
} catch (error) {
  // Database exceptions - need to convert
  return Fail(new DatabaseFailure(error));
}

// HTTP client libraries (Axios, fetch, etc.)
try {
  const response = await axios.get('https://api.example.com/users');
} catch (error) {
  // HTTP exceptions (network errors, 4xx, 5xx) - need to convert
  return Fail(new NetworkFailure(error));
}

// File system libraries (fs, file-utils, etc.)
try {
  await fs.readFile('path/to/file.txt');
} catch (error) {
  // File system exceptions - need to convert
  return Fail(new FileSystemFailure(error));
}

// Validation libraries (Joi, Yup, etc.)
try {
  await schema.validate(data);
} catch (error) {
  // Validation exceptions - need to convert
  return Fail(new ValidationFailure(error));
}
```

#### Domain Layer Should Never Use Try-Catch

Once exceptions are converted to Results at the adapter layer, the domain layer should **never** use try-catch:

```typescript
// ✅ Good - Domain layer uses Result types
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  async signIn(): Promise<Result<User, SignInFailure>> {
    // No try-catch - errors are handled as Result types
    // Adapter already converted exceptions to Results
    return this.authAdapter.signIn();
  }

  async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    // No try-catch needed - adapter handles exceptions
    return this.authAdapter.signInWithEmailAndPassword({ email, password });
  }
}

// ❌ Bad - Try-catch in domain layer
export class AuthenticationService {
  async signIn(): Promise<User> {
    try {
      // Don't catch here - adapter should have already converted exceptions
      return await this.authAdapter.signIn();
    } catch (error) {
      // Don't throw in domain layer - use Result types
      throw error;
    }
  }
}
```

#### Summary

- **Use try-catch only in adapters**: Convert third-party library exceptions to Result types
- **Never use try-catch in domain layer**: Domain layer works with Result types only
- **Why it's necessary**: Third-party libraries use exceptions, so we must convert them at the boundary
- **Benefits**: Once converted, the entire application uses the consistent Result pattern

## 🎯 Domain-Driven Design (DDD)

### Domain Models

- **Entities**: Objects with identity (e.g., `User`, `Order`)
- **Value Objects**: Immutable objects defined by their attributes (e.g., `Email`, `Address`)
- **Domain Services**: Operations that don't naturally belong to an entity
- **Failures**: Domain-specific error representations

### Bounded Contexts

Organize code by business domains, not technical layers:

```
domain/
├── authentication/
│   ├── models/
│   │   ├── User.ts
│   │   ├── SignInFailure.ts
│   │   └── SignUpFailure.ts
│   └── services/
│       └── AuthenticationService.ts
└── orders/
    ├── models/
    └── services/
```

### Domain Logic Rules

1. **Domain models** should not depend on infrastructure
2. **Business rules** live in domain services or entities
3. **Domain language** (ubiquitous language) should be reflected in code
4. **Failures** are part of the domain model

### Example

```typescript
// Domain model
export type User = {
  id: string;
  email: string;
  name: string;
};

// Domain service
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  public async signIn(email: string, password: string): Promise<Result<User, SignInFailure>> {
    // Business logic here
    return this.authAdapter.signIn(email, password);
  }
}

// Domain failure
export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
```

## 🔄 Result Class for Typed Returns

The `Result` type provides a functional approach to error handling:

### Basic Usage

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Failure } from '@jsfsi-core/ts-crossplatform';

// Success
function divide(a: number, b: number): Result<number, DivisionByZeroFailure> {
  if (b === 0) {
    return Fail(new DivisionByZeroFailure());
  }
  return Ok(a / b);
}

// Usage
const [result, failure] = divide(10, 2);
if (isFailure(DivisionByZeroFailure)(failure)) {
  // Handle error
} else {
  // Use result (result is guaranteed to be defined)
  console.log(result * 2); // 10
}
```

### Type-Safe Error Handling

```typescript
const [user, failure] = await authenticationService.signIn(email, password);

if (isFailure(SignInFailure)(failure)) {
  // TypeScript knows failure is SignInFailure
  console.error('Sign in failed:', failure.error);
  return;
}

// TypeScript knows user is defined and failure is undefined
console.log('Welcome,', user.name);
```

### Chaining Results

```typescript
async function authenticateAndGetProfile(
  email: string,
): Promise<Result<Profile, AuthenticationFailure>> {
  const [user, signInFailure] = await authService.signIn(email, password);

  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  const [profile, profileFailure] = await profileService.getProfile(user.id);

  if (isFailure(ProfileFailure)(profileFailure)) {
    return Fail(profileFailure);
  }

  return Ok(profile);
}
```

## 📚 Best Practices

### 1. Immutability

Prefer immutable data structures:

```typescript
// ✅ Good
const updatedUser = { ...user, name: 'New Name' };

// ❌ Bad
user.name = 'New Name';
```

### 2. Pure Functions

Prefer pure functions when possible:

```typescript
// ✅ Good - Pure function
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - Side effects
function calculateTotal(items: Item[]): number {
  let total = 0;
  items.forEach((item) => {
    total += item.price;
    console.log(item); // Side effect
  });
  return total;
}
```

### 3. Dependency Injection

Use constructor injection:

```typescript
// ✅ Good
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}
}

// ❌ Bad
export class AuthenticationService {
  private authAdapter = new AuthenticationAdapter(); // Hard dependency
}
```

### 4. Single Responsibility

Each class/function should have one reason to change:

```typescript
// ✅ Good
export class UserValidator {
  validateEmail(email: string): boolean {
    /* ... */
  }
}

export class EmailSender {
  sendEmail(to: string, subject: string): Promise<void> {
    /* ... */
  }
}

// ❌ Bad
export class UserManager {
  validateEmail(email: string): boolean {
    /* ... */
  }
  sendEmail(to: string, subject: string): Promise<void> {
    /* ... */
  }
  saveUser(user: User): Promise<void> {
    /* ... */
  }
}
```

### 5. Configuration

Use environment variables and Zod schemas for type-safe configuration:

```typescript
import { z } from 'zod';
import { parseConfig } from '@jsfsi-core/ts-crossplatform';

const ConfigSchema = z.object({
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
});

export const config = parseConfig(ConfigSchema);
```

## 🔗 Additional Resources

### Documentation

- **[Cursor IDE Rules](./.cursorrules)** - Comprehensive guidelines for AI assistants to generate code that follows this repository's patterns and best practices

### Architecture

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Domain-Driven Design

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [DDD Quickly](https://www.infoq.com/minibooks/domain-driven-design-quickly/)

### Testing

- [Test-Driven Development by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Growing Object-Oriented Software, Guided by Tests](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627)

### Error Handling

- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Result Type Pattern](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)

## 🚀 Getting Started

### Prerequisites

- Node.js 25.1.0
- npm 11.6.2

### Installation

```bash
npm install
```

### Building

```bash
# Build all packages in order
npm run build

# Build specific package
npm run build --workspace=@jsfsi-core/ts-crossplatform
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests for specific package
npm run test --workspace=@jsfsi-core/ts-crossplatform
```

### Linting

```bash
# Lint all packages
npm run lint

# Lint specific package
npm run lint --workspace=@jsfsi-core/ts-crossplatform
```

## 🙏 Contributors

Special thanks to our key contributors:

- **[Federico Gandellini](https://github.com/fgandellini)** - For invaluable contributions to improving the codebase.

## 📄 License

ISC
