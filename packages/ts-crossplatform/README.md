# @jsfsi-core/ts-crossplatform

Cross-platform TypeScript utilities for building robust applications with functional error handling, type-safe configuration, and common domain primitives.

## 📦 Installation

```bash
npm install @jsfsi-core/ts-crossplatform
```

## 🏗️ Architecture

This package provides the **foundational building blocks** for the hexagonal architecture pattern:

- **Result Type**: Functional error handling without exceptions
- **Failure Classes**: Domain-specific error representations
- **Configuration**: Type-safe environment variable parsing
- **Domain Primitives**: Common utilities (GUID, DateTime, etc.)

These utilities are **framework-agnostic** and can be used in any TypeScript project (Node.js, NestJS, React, etc.).

## 📋 Features

### Result Type

Type-safe error handling using a tuple pattern:

```typescript
import { Result, Ok, Fail } from '@jsfsi-core/ts-crossplatform';

type Result<T, E extends Failure> = [T, E | undefined];
```

**Example:**

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Failure } from '@jsfsi-core/ts-crossplatform';

class ValidationFailure extends Failure {
  constructor(public readonly message: string) {
    super();
  }
}

function validateEmail(email: string): Result<string, ValidationFailure> {
  if (!email.includes('@')) {
    return Fail(new ValidationFailure('Invalid email format'));
  }
  return Ok(email);
}

// Usage
const [email, failure] = validateEmail('user@example.com');

if (isFailure(ValidationFailure)(failure)) {
  console.error(failure.message);
} else {
  console.log('Valid email:', email);
}
```

### Failure Classes

Base class for all domain failures:

```typescript
import { Failure } from '@jsfsi-core/ts-crossplatform';

export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
```

### Failure Matchers

**Always use `isFailure` and `notFailure` matchers** - never use `instanceof` directly:

```typescript
import { isFailure, notFailure } from '@jsfsi-core/ts-crossplatform';

const [user, failure] = await signIn();

// ✅ Correct way
if (isFailure(SignInFailure)(failure)) {
  // TypeScript narrows type to SignInFailure
  console.error('Sign in failed:', failure.error);
}

if (notFailure(SignInFailure)(failure)) {
  // TypeScript knows it's not a SignInFailure
  // Could be another failure type or undefined
}

// ❌ Wrong way - Don't use instanceof
if (failure instanceof SignInFailure) {
  // Avoid this pattern
}
```

### Configuration

Type-safe configuration parsing with Zod:

```typescript
import { z } from 'zod';
import { parseConfig } from '@jsfsi-core/ts-crossplatform';

const ConfigSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'PORT must be a valid number' }),
  DATABASE_URL: z.string().url(),
  ENABLE_LOGGING: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
});

// Throws if validation fails (use in application bootstrap)
export const config = parseConfig(ConfigSchema);
```

### GUID

Type-safe GUID generation:

```typescript
import { Guid } from '@jsfsi-core/ts-crossplatform';

const guid = Guid.newGuid();
console.log(guid); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### DateTime

DateTime utilities for formatting dates and times, plus a promise-based sleep function:

```typescript
import { formatDate, formatTime, formatDateTime, sleep } from '@jsfsi-core/ts-crossplatform';
```

#### Sleep

Promise-based sleep function for async delays:

```typescript
import { sleep } from '@jsfsi-core/ts-crossplatform';

// Sleep for 1 second
await sleep(1000);

// Usage in async operations
async function processWithDelay() {
  await sleep(500); // Wait 500ms
  // Continue processing
}
```

#### Format Date

Format a timestamp as a date string (MM/DD/YYYY format):

```typescript
import { formatDate } from '@jsfsi-core/ts-crossplatform';

const timestamp = new Date('2025-01-15').getTime();
const formatted = formatDate(timestamp);
console.log(formatted); // "01/15/2025"

// With locale support
const formattedDE = formatDate(timestamp, 'de-DE');
console.log(formattedDE); // "15.01.2025" (German format)
```

#### Format Time

Format a timestamp as a time string (24-hour format HH:MM:SS):

```typescript
import { formatTime } from '@jsfsi-core/ts-crossplatform';

const timestamp = new Date('2025-01-15T14:30:45').getTime();
const formatted = formatTime(timestamp);
console.log(formatted); // "14:30:45"

// With locale support
const formattedDE = formatTime(timestamp, 'de-DE');
console.log(formattedDE); // "14:30:45"
```

#### Format Date and Time

Format a timestamp as both date and time:

```typescript
import { formatDateTime } from '@jsfsi-core/ts-crossplatform';

const timestamp = new Date('2025-01-15T14:30:45').getTime();
const formatted = formatDateTime(timestamp);
console.log(formatted); // "01/15/2025 14:30:45"

// With locale support
const formattedDE = formatDateTime(timestamp, 'de-DE');
console.log(formattedDE); // "15.01.2025 14:30:45" (German format)
```

#### Complete Example

```typescript
import { formatDate, formatTime, formatDateTime, sleep } from '@jsfsi-core/ts-crossplatform';

// Format current date/time
const now = Date.now();
console.log(formatDate(now)); // "01/15/2025"
console.log(formatTime(now)); // "14:30:45"
console.log(formatDateTime(now)); // "01/15/2025 14:30:45"

// Sleep in async function
async function delayedProcessing() {
  console.log('Starting...');
  await sleep(1000);
  console.log('Done after 1 second');
}
```

**Notes:**

- All formatting functions accept a timestamp (number) as the first parameter
- Optional `locales` parameter for internationalization (follows Intl.LocalesArgument)
- Date format: `MM/DD/YYYY` (US format by default)
- Time format: `HH:MM:SS` (24-hour format, always)
- Sleep uses milliseconds (1 second = 1000ms)

### Partial Types

Recursive partial types for deep optional properties:

```typescript
import { RecursivePartial } from '@jsfsi-core/ts-crossplatform';

type User = {
  id: string;
  profile: {
    name: string;
    address: {
      city: string;
    };
  };
};

type PartialUser = RecursivePartial<User>;
// All properties are optional, recursively
```

### Mock Utility

Type-safe mock utility for testing that works with `RecursivePartial` types:

```typescript
import { mock } from '@jsfsi-core/ts-crossplatform';
```

#### Basic Usage

Create mock objects with only the properties you need for testing:

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

// Mock with no properties
const emptyUser = mock<User>();
// emptyUser is typed as User but with all properties undefined

// Mock with partial properties
const partialUser = mock<User>({
  id: '123',
  email: 'user@example.com',
});

// Mock with nested properties
const fullUser = mock<User>({
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  profile: {
    bio: 'Software developer',
    // avatar can be omitted - it's optional via RecursivePartial
  },
});
```

#### Testing Examples

Use mocks in your tests to create test data:

```typescript
import { describe, it, expect } from 'vitest';
import { mock } from '@jsfsi-core/ts-crossplatform';

describe('UserService', () => {
  it('creates user with minimal data', async () => {
    const userData = mock<User>({
      email: 'test@example.com',
      name: 'Test User',
    });

    const [user, failure] = await userService.createUser(userData);

    expect(user).toBeDefined();
    expect(failure).toBeUndefined();
  });

  it('handles user with nested profile', async () => {
    const userData = mock<User>({
      id: '123',
      email: 'test@example.com',
      profile: {
        bio: 'Test bio',
        // avatar omitted - RecursivePartial makes it optional
      },
    });

    const [user, failure] = await userService.updateUser(userData);

    expect(user?.profile.bio).toBe('Test bio');
  });
});
```

#### Complex Types

Works with complex nested types:

```typescript
import { mock } from '@jsfsi-core/ts-crossplatform';

type Order = {
  id: string;
  customer: {
    id: string;
    email: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

// Mock with only what you need for the test
const orderMock = mock<Order>({
  id: 'order-123',
  customer: {
    id: 'customer-456',
    email: 'customer@example.com',
    // address can be omitted - RecursivePartial makes it optional
  },
  items: [
    {
      productId: 'product-789',
      quantity: 2,
      // price can be omitted for this test
    },
  ],
});
```

#### Benefits

- **Type Safety**: Mock objects are fully typed, catching errors at compile time
- **Flexibility**: Only specify the properties you need for each test
- **Recursive**: Works with deeply nested objects
- **Simple**: No complex setup or configuration required

## 📝 Naming Conventions

- **Result type**: Use `Result<T, E>` where `T` is success type, `E` extends `Failure`
- **Failure classes**: Suffix with `Failure` (e.g., `SignInFailure`, `ValidationFailure`)
- **Helper functions**: Use descriptive names (`Ok`, `Fail`, `isFailure`, `notFailure`)

## 🧪 Testing Principles

### Testing Result Types

```typescript
import { describe, it, expect } from 'vitest';
import { Ok, Fail, Result } from './result';
import { Failure, isFailure } from '../failures';

describe('validateEmail', () => {
  it('returns Ok with email on valid input', () => {
    const [email, failure] = validateEmail('user@example.com');

    expect(email).toBe('user@example.com');
    expect(failure).toBeUndefined();
  });

  it('returns ValidationFailure on invalid input', () => {
    const [email, failure] = validateEmail('invalid');

    expect(email).toBeUndefined();
    expect(isFailure(ValidationFailure)(failure)).toBe(true);
    if (isFailure(ValidationFailure)(failure)) {
      expect(failure.message).toBe('Invalid email format');
    }
  });
});
```

### Testing Failure Matchers

```typescript
import { describe, it, expect } from 'vitest';
import { isFailure, notFailure } from './matchers';
import { Failure } from './failure';

class CustomFailure extends Failure {
  constructor(public readonly message: string) {
    super();
  }
}

describe('isFailure', () => {
  it('matches when value is the failure type', () => {
    const failure = new CustomFailure('error');
    expect(isFailure(CustomFailure)(failure)).toBe(true);
  });

  it('does not match when value is different failure type', () => {
    const failure = new Failure();
    expect(isFailure(CustomFailure)(failure)).toBe(false);
  });
});

describe('notFailure', () => {
  it('matches when value is not the failure type', () => {
    const failure = new Failure();
    expect(notFailure(CustomFailure)(failure)).toBe(true);
  });
});
```

## ⚠️ Error Handling Principles

### Result Pattern

**Always use Result types for operations that can fail:**

```typescript
// ✅ Good
function parseNumber(input: string): Result<number, ParseFailure> {
  const num = Number(input);
  if (isNaN(num)) {
    return Fail(new ParseFailure(`Cannot parse "${input}" as number`));
  }
  return Ok(num);
}

// ❌ Bad - Throwing exceptions
function parseNumber(input: string): number {
  const num = Number(input);
  if (isNaN(num)) {
    throw new Error(`Cannot parse "${input}" as number`);
  }
  return num;
}
```

### Failure Matchers

**Always use `isFailure` and `notFailure` matchers:**

```typescript
// ✅ Good
const [value, failure] = await operation();
if (isFailure(CustomFailure)(failure)) {
  // Handle CustomFailure
}

// ❌ Bad
if (failure instanceof CustomFailure) {
  // Don't use instanceof directly
}
```

### Chaining Results

```typescript
function processUser(email: string): Result<User, ValidationFailure | SignInFailure> {
  const [validEmail, emailFailure] = validateEmail(email);

  if (isFailure(ValidationFailure)(emailFailure)) {
    return Fail(emailFailure);
  }

  const [user, signInFailure] = await signIn(validEmail);

  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  return Ok(user);
}
```

## 🎯 Domain-Driven Design

### Failure as Domain Concept

Failures are part of your domain model:

```typescript
// Domain failures represent business errors
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

### Value Objects

Use Result types when returning value objects:

```typescript
function createEmail(value: string): Result<Email, InvalidEmailFailure> {
  if (!isValidEmail(value)) {
    return Fail(new InvalidEmailFailure(value));
  }
  return Ok({ value } as Email);
}
```

## 🔄 Result Class Usage

### Basic Pattern

```typescript
import { Result, Ok, Fail } from '@jsfsi-core/ts-crossplatform';

function divide(a: number, b: number): Result<number, DivisionByZeroFailure> {
  if (b === 0) {
    return Fail(new DivisionByZeroFailure());
  }
  return Ok(a / b);
}
```

### Handling Multiple Failure Types

```typescript
type AuthResult = Result<User, SignInFailure | NetworkFailure>;

async function authenticate(email: string, password: string): Promise<AuthResult> {
  const [networkCheck, networkFailure] = await checkNetwork();

  if (isFailure(NetworkFailure)(networkFailure)) {
    return Fail(networkFailure);
  }

  const [user, signInFailure] = await signIn(email, password);

  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  return Ok(user);
}

// Usage with type narrowing
const [user, failure] = await authenticate(email, password);

if (isFailure(SignInFailure)(failure)) {
  // Handle sign-in failure
  console.error('Sign in failed:', failure.error);
} else if (isFailure(NetworkFailure)(failure)) {
  // Handle network failure
  console.error('Network error:', failure.message);
} else {
  // Success case
  console.log('Authenticated:', user.name);
}
```

### Early Returns Pattern

```typescript
function processOrder(order: Order): Result<OrderId, ValidationFailure | PaymentFailure> {
  // Early return on first failure
  const [, validationFailure] = validateOrder(order);
  if (isFailure(ValidationFailure)(validationFailure)) {
    return Fail(validationFailure);
  }

  const [, paymentFailure] = processPayment(order);
  if (isFailure(PaymentFailure)(paymentFailure)) {
    return Fail(paymentFailure);
  }

  return Ok(order.id);
}
```

## 📚 Best Practices

### 1. Type Safety

Always specify failure types explicitly:

```typescript
// ✅ Good - Explicit failure types
function getUser(id: string): Result<User, UserNotFoundFailure | DatabaseFailure> {
  // ...
}

// ⚠️ Acceptable - Generic Failure
function getUser(id: string): Result<User, Failure> {
  // ...
}
```

### 2. Failure Messages

Include meaningful information in failures:

```typescript
// ✅ Good
export class ValidationFailure extends Failure {
  constructor(
    public readonly field: string,
    public readonly message: string,
    public readonly value: unknown,
  ) {
    super();
  }
}

// ❌ Bad - No context
export class ValidationFailure extends Failure {
  constructor() {
    super();
  }
}
```

### 3. Avoid Throwing

Never throw exceptions in domain logic - use Result types:

```typescript
// ✅ Good
function parseConfig<T>(schema: z.ZodSchema<T>): Result<T, ConfigParseFailure> {
  // ...
}

// ❌ Bad
function parseConfig<T>(schema: z.ZodSchema<T>): T {
  // Throws exception
}
```

## 🔗 Additional Resources

- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Result Type Pattern](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)
- [Functional Error Handling](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-type/)

## 📄 License

ISC
