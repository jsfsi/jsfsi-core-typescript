# Template REST API

A NestJS-based REST API template demonstrating best practices with Hexagonal Architecture, Domain-Driven Design, and functional error handling.

## 🏗️ Architecture

This template follows **Hexagonal Architecture** (Ports and Adapters) with clear separation of concerns:

```
src/
├── domain/                    # Domain Layer (Pure business logic)
│   ├── models/               # Domain entities and failures
│   │   ├── User.ts
│   │   ├── HealthCheck.ts
│   │   ├── UnableToValidateUserFailure.ts
│   │   └── UserAuthorizationExpiredFailure.ts
│   └── services/            # Domain services
│       ├── HealthService.ts
│       └── UserService.ts
├── adapters/                 # Adapter Layer (External integrations)
│   └── authorization-adapter/  # Firebase authorization adapter
│       └── AuthorizationAdapter.ts
├── communication/            # API Layer (Controllers, Guards, Decorators)
│   ├── controllers/          # REST controllers
│   │   └── health/
│   ├── guards/               # Route guards
│   │   ├── user.guard.ts     # User validation guard
│   │   └── authorize.guard.ts # Role-based authorization guard
│   └── decorators/           # Custom decorators
│       ├── current-user.decorator.ts
│       └── authorize.decorator.ts
└── app/                      # Application setup
    └── app.module.ts         # Root module
```

### Architecture Layers

1. **Domain Layer**: Pure business logic with no external dependencies
2. **Adapter Layer**: External service integrations (Firebase, etc.) and exception-to-Result conversion
3. **Communication Layer**: NestJS controllers, guards, and decorators
4. **Application Layer**: Application configuration and module setup

### Dependency Flow

```
Controllers → Domain Services → Adapters → External Services
```

## 📋 Features

- **Authentication**: Firebase-based user authentication
- **Authorization**: Role-based access control with guards
- **Type Safety**: Full TypeScript support with strict types
- **Error Handling**: Result types for functional error handling
- **Testing**: Comprehensive test coverage with unit and integration tests
- **Configuration**: Type-safe configuration management

## 📝 Naming Conventions

### Files and Directories

- **Controllers**: PascalCase with `Controller` suffix (e.g., `HealthController.ts`)
- **Services**: PascalCase with `Service` suffix (e.g., `HealthService.ts`)
- **Adapters**: PascalCase with `Adapter` suffix (e.g., `AuthorizationAdapter.ts`)
- **Models**: PascalCase (e.g., `User.ts`, `UnableToValidateUserFailure.ts`)
- **Guards**: PascalCase with `Guard` suffix (e.g., `UserGuard.ts`)
- **Decorators**: camelCase with suffix (e.g., `current-user.decorator.ts`)
- **Tests**: `.unit.test.ts` or `.integration.test.ts` suffix

### Code

- **Classes**: PascalCase (e.g., `UserService`, `SignInFailure`)
- **Functions/Methods**: camelCase (e.g., `signIn()`, `getUser()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `APP_CONFIG_TOKEN`)
- **Failures**: PascalCase suffix with `Failure` (e.g., `SignInFailure`)

## 🧪 Testing

### Test-Driven Development (TDD)

This template follows TDD principles:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Testing Controllers

```typescript
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { Controller, Get, Module } from '@nestjs/common';
import request from 'supertest';

@Controller('health')
class HealthController {
  @Get()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [HealthController],
})
class HealthModule {}

describe('HealthController', () => {
  it('returns health status', async () => {
    const app = await createTestingApp(HealthModule);

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

### Testing Services

```typescript
import { describe, it, expect, vi } from 'vitest';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { HealthService } from './HealthService';

describe('HealthService', () => {
  it('returns health check data', async () => {
    const service = new HealthService();
    const [health, failure] = await service.getHealth();

    expect(health).toBeDefined();
    expect(failure).toBeUndefined();
    expect(health?.status).toBe('ok');
  });
});
```

### Testing Adapters

```typescript
import { describe, it, expect } from 'vitest';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { AuthorizationAdapter } from './AuthorizationAdapter';

describe('AuthorizationAdapter', () => {
  it('converts exceptions to Result types', async () => {
    const adapter = new AuthorizationAdapter();
    
    const [user, failure] = await adapter.decodeUser({
      rawAuthorization: 'invalid-token',
    });

    expect(user).toBeUndefined();
    expect(isFailure(UnableToValidateUserFailure)(failure)).toBe(true);
  });
});
```

## ⚠️ Error Handling

### Result Types in Domain

**Domain services return Result types** - no exceptions thrown:

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async getUser(id: string): Promise<Result<User, UserNotFoundFailure>> {
    // No try-catch - errors handled as Result types
    return this.userRepository.findById(id);
  }
}
```

### Try-Catch at Edges

**Try-catch blocks only exist in adapters** (edges of hexagonal architecture):

```typescript
export class AuthorizationAdapter {
  async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>> {
    if (!rawAuthorization?.startsWith('Bearer ')) {
      return Fail(new UnableToValidateUserFailure());
    }

    const idToken = rawAuthorization.split('Bearer ')[1];

    try {
      // Firebase throws exceptions - we catch and convert
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const user: User = {
        id: decodedToken.uid,
        email: decodedToken.email,
      };
      return Ok(user);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return Fail(new UserAuthorizationExpiredFailure(firebaseError));
      }

      return Fail(new UnableToValidateUserFailure(error as Error));
    }
  }
}
```

### Controllers Convert Results to HTTP

Controllers convert `Result` types to HTTP responses:

```typescript
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { isFailure } from '@jsfsi-core/ts-crossplatform';

@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    const [user, failure] = await this.userService.getUser(id);

    if (isFailure(UserNotFoundFailure)(failure)) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
```

## 🎯 Domain-Driven Design

### Domain Models

Domain models represent business concepts:

```typescript
// Domain entity
export type User = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

// Domain failure
export class UnableToValidateUserFailure extends Failure {
  constructor(public readonly error?: Error) {
    super();
  }
}
```

### Domain Services

Domain services contain business logic:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly authAdapter: AuthorizationAdapter) {}

  async getUserFromToken(token: string): Promise<Result<User, UnableToValidateUserFailure>> {
    return this.authAdapter.decodeUser({ rawAuthorization: token });
  }
}
```

### Guards

Use guards for authentication and authorization:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    const [user, failure] = await this.userService.getUserFromToken(token);

    if (isFailure(UnableToValidateUserFailure)(failure)) {
      return false;
    }

    request.user = user;
    return true;
  }
}
```

```typescript
import { SetMetadata } from '@nestjs/common';

export const Auth = (...roles: string[]) => SetMetadata('roles', roles);
```

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.includes(user.role);
  }
}
```

## 🔄 Result Class Usage

### Using Result Types in Controllers

```typescript
import { Result, isFailure } from '@jsfsi-core/ts-crossplatform';
import { HealthService } from '../../domain/services/health-service/HealthService';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthCheck> {
    const [health, failure] = await this.healthService.getHealth();

    if (isFailure(HealthCheckFailure)(failure)) {
      throw new InternalServerErrorException('Health check failed');
    }

    return health;
  }
}
```

### Chaining Results

```typescript
async function getUserAndProfile(userId: string): Promise<Result<Profile, UserNotFoundFailure | ProfileLoadFailure>> {
  const [user, userFailure] = await userService.getUser(userId);
  
  if (isFailure(UserNotFoundFailure)(userFailure)) {
    return Fail(userFailure);
  }

  const [profile, profileFailure] = await profileService.getProfile(user.id);
  
  if (isFailure(ProfileLoadFailure)(profileFailure)) {
    return Fail(profileFailure);
  }

  return Ok(profile);
}
```

## 📚 Best Practices

### 1. Dependency Injection

Use NestJS dependency injection:

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authAdapter: AuthorizationAdapter,
  ) {}
}
```

### 2. Guards for Authentication/Authorization

```typescript
@Controller('users')
export class UserController {
  @Get(':id')
  @UseGuards(UserGuard)
  @Auth('admin', 'user')
  @UseGuards(AuthorizeGuard)
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.getUser(id);
  }
}
```

### 3. Configuration

Use type-safe configuration:

```typescript
import { z } from 'zod';
import { parseConfig } from '@jsfsi-core/ts-crossplatform';

const ConfigSchema = z.object({
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string(),
});

export const config = parseConfig(ConfigSchema);
```

### 4. Error Handling

Use Result types in domain, exceptions only in controllers:

```typescript
// Domain: Result types
async getUser(id: string): Promise<Result<User, UserNotFoundFailure>> {
  // ...
}

// Controller: Map to HTTP
async getUser(@Param('id') id: string) {
  const [user, failure] = await this.userService.getUser(id);

  if (isFailure(UserNotFoundFailure)(failure)) {
    throw new NotFoundException();
  }

  return user;
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 25.0.0 or higher
- npm 11.6.2 or higher
- PostgreSQL database (optional, for repositories)
- Firebase project (for authentication)

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Create a `.env` file in `configuration/` directory:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### Development

```bash
# Run development server
npm run dev

# Watch mode
npm run dev:watch
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm run start:dist
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## 🔗 Additional Resources

### Architecture

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### NestJS

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Firebase

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Error Handling

- [Result Type Pattern](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

## 📄 License

ISC

