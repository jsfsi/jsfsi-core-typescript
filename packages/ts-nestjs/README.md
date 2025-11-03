# @jsfsi-core/ts-nestjs

NestJS-specific utilities for building robust backend applications following hexagonal architecture and domain-driven design principles.

## 📦 Installation

```bash
npm install @jsfsi-core/ts-nestjs
```

**Peer Dependencies:**

- `@nestjs/core`
- `@nestjs/common`
- `express`
- `body-parser`

## 🏗️ Architecture

This package provides NestJS-specific implementations of hexagonal architecture patterns:

- **Application Bootstrap**: Configured NestJS application factory
- **Configuration**: Type-safe configuration service with Zod validation
- **Exception Filters**: Centralized error handling at application edges
- **Validators**: Type-safe request validation decorators
- **Middlewares**: Request logging and common middleware

### Application Structure

```
src/
├── app/
│   ├── app.ts              # Application factory
│   └── bootstrap.ts        # Bootstrap helper
├── configuration/
│   └── AppConfigurationService.ts  # Configuration setup
├── filters/
│   └── AllExceptionsFilter.ts      # Exception handler (edge)
├── middlewares/
│   └── RequestMiddleware.ts       # Request logging
└── validators/
    └── ZodValidator.ts             # Request validators
```

## 📋 Features

### Application Bootstrap

Type-safe application creation with pre-configured settings:

**main.ts:**

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

The `bootstrap` function:

- Loads environment configuration from the specified `configPath`
- Creates and configures the NestJS application
- Automatically starts the application on the port specified in your configuration
- Handles CORS, exception filters, and logging setup

### Configuration Service

Type-safe configuration with Zod schemas:

```typescript
import { z } from 'zod';
import { AppConfigSchema, appConfigModuleSetup, APP_CONFIG_TOKEN } from '@jsfsi-core/ts-nestjs';
import { ConfigService } from '@nestjs/config';

// Define configuration schema
export const AppConfigSchema = z.object({
  APP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'APP_PORT must be a valid number' }),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*'),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// In your app module (AppModule.ts)
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { appConfigModuleSetup, RequestMiddleware } from '@jsfsi-core/ts-nestjs';

import { BrowserAdapter } from '../adapters/BrowserAdapter';
import { HealthController } from '../communication/controllers/health/HealthController';
import { RenderController } from '../communication/controllers/render/RenderController';
import { RenderService } from '../domain/RenderService';

const controllers = [HealthController, RenderController];
const services = [RenderService];
const adapters = [BrowserAdapter];

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

// Use in service
@Injectable()
export class MyService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    const config = this.configService.get<AppConfig>(APP_CONFIG_TOKEN);
    // config is fully typed
  }
}
```

### Exception Filter

Centralized exception handling at the application edge:

The `createApp()` function automatically registers `AllExceptionsFilter` which:

- Catches all unhandled exceptions
- Maps HTTP exceptions to appropriate status codes
- Logs errors for monitoring
- Returns consistent error responses

**Note**: This is where exceptions are caught (edge of hexagonal architecture). The filter is automatically registered, no manual setup needed.

### Request Validation

Type-safe request validation with Zod:

```typescript
import { Controller, Post } from '@nestjs/common';
import { SafeBody, SafeQuery, SafeParams } from '@jsfsi-core/ts-nestjs';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().int().positive(),
});

@Controller('users')
export class UserController {
  @Post()
  async createUser(@SafeBody(CreateUserSchema) user: z.infer<typeof CreateUserSchema>) {
    // user is fully typed based on schema
    // Validation happens automatically
    // Returns 400 Bad Request if validation fails
  }

  @Get(':id')
  async getUser(@SafeParams(z.object({ id: z.string().uuid() })) params: { id: string }) {
    // params.id is validated as UUID
  }

  @Get()
  async listUsers(
    @SafeQuery(z.object({ page: z.string().transform(Number).optional() }))
    query: {
      page?: number;
    },
  ) {
    // query.page is validated and transformed
  }
}
```

### Request Middleware

Automatic request logging:

```typescript
import { RequestMiddleware } from '@jsfsi-core/ts-nestjs';

// In your app module
@Module({
  // ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
```

Logs include:

- HTTP method and URL
- Status code
- Response time
- Request/response headers
- Severity level based on status code

## 📝 Naming Conventions

### Controllers

- **Controllers**: PascalCase suffix with `Controller` (e.g., `UserController`, `AuthController`)
- **Endpoints**: Use RESTful naming (e.g., `getUser`, `createUser`, `updateUser`)

### Services

- **Services**: PascalCase suffix with `Service` (e.g., `UserService`, `AuthService`)
- **Domain Services**: Live in domain layer, not in NestJS services

### Modules

- **Modules**: PascalCase suffix with `Module` (e.g., `UserModule`, `AppModule`)

## 🧪 Testing Principles

### Testing Controllers

```typescript
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { Controller, Get, Module } from '@nestjs/common';
import request from 'supertest';

@Controller('test')
class TestController {
  @Get()
  getHello(): { message: string } {
    return { message: 'Hello' };
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

describe('TestController', () => {
  it('returns hello message', async () => {
    const app = await createTestingApp(TestModule);

    const response = await request(app.getHttpServer()).get('/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello' });
  });
});
```

### Testing Services

```typescript
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Testing with Result Types

When services return Result types, test accordingly:

```typescript
import { isFailure } from '@jsfsi-core/ts-crossplatform';

describe('AuthService', () => {
  it('returns user on successful sign in', async () => {
    const [user, failure] = await authService.signIn(email, password);

    expect(user).toBeDefined();
    expect(failure).toBeUndefined();
  });

  it('returns SignInFailure on authentication error', async () => {
    const [user, failure] = await authService.signIn(email, password);

    expect(user).toBeUndefined();
    expect(isFailure(SignInFailure)(failure)).toBe(true);
  });
});
```

## ⚠️ Error Handling Principles

### Exception Filter at Edge

**Exceptions should only be thrown at the edge** (in controllers/exception filters), not in domain logic:

```typescript
// ✅ Good - In controller (edge)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signin')
  async signIn(@SafeBody(SignInSchema) body: SignInDto) {
    const [user, failure] = await this.authService.signIn(body.email, body.password);

    if (isFailure(SignInFailure)(failure)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}

// ✅ Good - Domain service returns Result
export class AuthenticationService {
  async signIn(email: string, password: string): Promise<Result<User, SignInFailure>> {
    // No exceptions thrown here
    return this.authAdapter.signIn(email, password);
  }
}

// ✅ Good - Exception filter catches all exceptions
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    // All exceptions caught here (edge)
  }
}

// ❌ Bad - Throwing in domain service
export class AuthenticationService {
  async signIn(email: string, password: string): Promise<User> {
    // Don't throw exceptions in domain layer
    if (!isValid(email)) {
      throw new Error('Invalid email');
    }
  }
}
```

### Result Types in Domain

Domain services should return `Result` types:

```typescript
// ✅ Good
@Injectable()
export class UserService {
  async getUser(id: string): Promise<Result<User, UserNotFoundFailure>> {
    const [user, failure] = await this.userRepository.findById(id);

    if (isFailure(UserNotFoundFailure)(failure)) {
      return Fail(failure);
    }

    return Ok(user);
  }
}

// ✅ Good - Mapping Result to HTTP in controller
@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@SafeParams(IdSchema) params: { id: string }) {
    const [user, failure] = await this.userService.getUser(params.id);

    if (isFailure(UserNotFoundFailure)(failure)) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
```

### Validation Errors

Use `SafeBody`, `SafeQuery`, `SafeParams` for automatic validation:

```typescript
// ✅ Good - Automatic validation
@Post('users')
async createUser(@SafeBody(CreateUserSchema) user: CreateUserDto) {
  // user is already validated
  return this.userService.create(user);
}

// ❌ Bad - Manual validation
@Post('users')
async createUser(@Body() user: any) {
  // Manual validation needed
  if (!user.email) {
    throw new BadRequestException('Email required');
  }
}
```

## 🎯 Domain-Driven Design

### Domain Layer Structure

Domain logic should be framework-agnostic:

```
src/
├── domain/
│   ├── models/
│   │   ├── User.ts
│   │   └── SignInFailure.ts
│   └── services/
│       └── AuthenticationService.ts    # Domain service (no NestJS dependencies)
├── adapters/
│   └── DatabaseAdapter.ts              # Implements domain interfaces
└── controllers/                        # NestJS-specific (edge)
    └── AuthController.ts
```

### Domain Services

Domain services contain business logic:

```typescript
// ✅ Good - Domain service (no NestJS decorators)
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  async signIn(email: string, password: string): Promise<Result<User, SignInFailure>> {
    // Business logic here
    return this.authAdapter.signIn(email, password);
  }
}

// ✅ Good - Inject domain service in NestJS service
@Injectable()
export class AuthService {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async signIn(email: string, password: string) {
    return this.authenticationService.signIn(email, password);
  }
}
```

## 🔄 Result Class Integration

### Using Result Types

Domain services return Result types, controllers map to HTTP:

```typescript
import { Result, isFailure } from '@jsfsi-core/ts-crossplatform';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@SafeBody(CreateOrderSchema) order: CreateOrderDto) {
    const [orderId, failure] = await this.orderService.create(order);

    if (isFailure(ValidationFailure)(failure)) {
      throw new BadRequestException(failure.message);
    }

    if (isFailure(PaymentFailure)(failure)) {
      throw new PaymentRequiredException('Payment failed');
    }

    return { id: orderId };
  }
}
```

### Error Mapping

Map domain failures to HTTP exceptions:

```typescript
function mapFailureToHttpException(failure: Failure): HttpException {
  if (isFailure(ValidationFailure)(failure)) {
    return new BadRequestException(failure.message);
  }

  if (isFailure(NotFoundFailure)(failure)) {
    return new NotFoundException(failure.message);
  }

  if (isFailure(UnauthorizedFailure)(failure)) {
    return new UnauthorizedException(failure.message);
  }

  return new InternalServerErrorException('An error occurred');
}
```

## 📚 Best Practices

### 1. Dependency Injection

Use constructor injection:

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}
}
```

### 2. Module Organization

Group related functionality in modules:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

### 3. Configuration

Always use typed configuration:

```typescript
// ✅ Good
const config = this.configService.get<AppConfig>(APP_CONFIG_TOKEN);

// ❌ Bad
const port = process.env.PORT; // Not type-safe
```

### 4. Request Validation

Always validate requests with Zod schemas:

```typescript
// ✅ Good
@Post()
async create(@SafeBody(CreateSchema) data: CreateDto) {
  // data is validated and typed
}

// ❌ Bad
@Post()
async create(@Body() data: any) {
  // No validation, no type safety
}
```

### 5. Error Handling

Use Result types in domain, exceptions only at edge:

```typescript
// Domain: Result types
async getUser(id: string): Promise<Result<User, UserNotFoundFailure>> {
  // ...
}

// Controller: Map to HTTP
async getUser(@Param('id') id: string) {
  const [user, failure] = await this.service.getUser(id);

  if (isFailure(UserNotFoundFailure)(failure)) {
    throw new NotFoundException();
  }

  return user;
}
```

## 🔗 Additional Resources

### NestJS

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Architecture

- [Hexagonal Architecture with NestJS](https://blog.octo.com/en/hexagonal-architecture-with-nestjs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Validation

- [Zod Documentation](https://zod.dev/)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

## 📄 License

ISC
