# @dora-flow/core-api

NestJS-based backend API for Dora Flow. This package provides the REST API endpoints, business logic, and data persistence layer.

## 📚 Table of Contents

- [Architecture](#architecture)
- [Naming Conventions](#naming-conventions)
- [Coding Guidelines](#coding-guidelines)
- [Testing Principles](#testing-principles)
- [Error Handling Principles](#error-handling-principles)
- [Result Class](#result-class-for-typed-returns)
- [Domain-Driven Design](#domain-driven-design)
- [Best Practices](#best-practices)
- [Database Migrations](#database-migrations)
- [Getting Started](#getting-started)

## 🏗️ Architecture

The core-api package follows **Hexagonal Architecture** principles with NestJS as the framework. The architecture is organized into communication, domain, adapters, and repositories layers.

### Package Structure

```
src/
├── adapters/              # External service adapters (hexagonal architecture edges)
│   ├── ai-adapter/        # AI provider adapters
│   └── authorization-adapter/  # Firebase authorization adapter
├── app/                   # NestJS application setup
│   ├── app.module.ts      # Root module
│   ├── app.ts             # Application factory
│   ├── configuration.service.ts  # Configuration management
│   └── filters/           # Exception filters
├── communication/         # API layer (controllers, guards, pipes, decorators)
│   ├── controllers/       # REST API controllers
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Route guards (authentication, authorization)
│   ├── middlewares/       # Request/response middlewares
│   └── pipes/             # Validation pipes
├── domain/                # Business logic (hexagonal architecture core)
│   ├── models/            # Domain models and failures
│   └── services/          # Domain services
└── repositories/          # Data persistence layer
    ├── ProductRepository/
    ├── ProductShareRepository/
    └── ProductVersionRepository/
```

### Architecture Layers

1. **Communication Layer** (`src/communication/`): NestJS controllers, guards, pipes, decorators
2. **Domain Layer** (`src/domain/`): Business logic, models, and services
3. **Adapter Layer** (`src/adapters/`): External service integrations (AI, Firebase)
4. **Repository Layer** (`src/repositories/`): Data persistence layer (TypeORM)

### Dependency Flow

```
Controllers → Domain Services → Repositories/Adapters → External Services/Database
```

Controllers depend on domain services, which depend on repositories and adapters. Repositories and adapters are the only layers that interact with external systems.

For more information about hexagonal architecture, refer to the [root README](../README.md) and [jsfsi-core-typescript documentation](https://github.com/jsfsi/jsfsi-core-typescript/).

## 📝 Naming Conventions

### Files and Directories

- **Controllers**: PascalCase with `Controller` suffix (e.g., `ProductsController.ts`)
- **Domain Services**: PascalCase with `Service` suffix (e.g., `ProductsService.ts`)
- **Adapters**: PascalCase with `Adapter` suffix (e.g., `AIAdapter.ts`, `AuthorizationAdapter.ts`)
- **Repositories**: PascalCase with `Repository` suffix (e.g., `ProductRepository.ts`)
- **Models**: PascalCase (e.g., `Product.model.ts`, `ProductNotFoundFailure.ts`)
- **Tests**:
  - **Unit Tests**: `.unit.test.ts` suffix (e.g., `ProductsService.unit.test.ts`)
  - **Integration Tests**: `.integration.test.ts` suffix (e.g., `ProductRepository.getProduct.integration.test.ts`)

### Code

- **Classes**: PascalCase (e.g., `ProductsService`, `ProductNotFoundFailure`)
- **Interfaces/Types**: PascalCase (e.g., `Product`, `User`)
- **Functions/Methods**: camelCase (e.g., `getProduct`, `createProduct`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`, `CORS_ORIGIN`)
- **Variables**: camelCase (e.g., `productId`, `productsService`)

### Failures

- **Failure Classes**: PascalCase with `Failure` suffix (e.g., `ProductNotFoundFailure`, `NetworkFailure`)
- Failure names should be descriptive and indicate the domain context

## 💻 Coding Guidelines

### NestJS

- Use **NestJS** decorators for dependency injection (`@Injectable()`, `@Controller()`, etc.)
- Use **NestJS** guards for authentication and authorization
- Use **NestJS** pipes for validation and transformation
- Use **NestJS** filters for exception handling

### Controller Structure

```typescript
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../../../domain/services/products-service/Products.service';
import { ProductNotFoundFailure } from '../../../domain/models/ProductNotFoundFailure';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ProductResponse> {
    const [product, failure] = await this.productsService.getProduct({ id, user });

    if (isFailure(ProductNotFoundFailure)(failure)) {
      throw new NotFoundException(failure);
    }

    return product;
  }
}
```

### Domain Service Structure

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../repositories/ProductRepository/ProductRepository';
import { Product } from '../../models/Product.model';
import { ProductNotFoundFailure } from '../../models/ProductNotFoundFailure';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  public async getProduct({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<Result<Product, ProductNotFoundFailure>> {
    const [product, failure] = await this.productRepository.getUserProduct({ id, user });

    if (isFailure(ProductNotFoundFailure)(failure)) {
      return Fail(failure);
    }

    return Ok(product);
  }
}
```

### Repository Structure

```typescript
import { Result, Ok, Fail } from '@jsfsi-core/ts-crossplatform';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../../domain/models/Product.model';
import { ProductNotFoundFailure } from '../../domain/models/ProductNotFoundFailure';

@Injectable()
export class ProductRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async getUserProduct({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<Result<Product, ProductNotFoundFailure>> {
    const product = await this.dataSource
      .getRepository(ProductEntity)
      .findOne({ where: { id, ownerId: user.id } });

    if (!product) {
      return Fail(new ProductNotFoundFailure(id));
    }

    return Ok(product);
  }
}
```

### TypeScript

- Use strict TypeScript settings
- Prefer type inference where possible
- Use explicit types for function parameters and return values
- Leverage `Result` types for error handling

### Configuration

Use environment variables and Zod schemas for type-safe configuration:

```typescript
import { z } from 'zod';
import { parseConfig } from '@jsfsi-core/ts-nodejs';

const ConfigSchema = z.object({
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
});

export const config = parseConfig(ConfigSchema);
```

For more coding guidelines, refer to the [root README](../README.md) and [jsfsi-core-typescript documentation](https://github.com/jsfsi/jsfsi-core-typescript/).

## 🧪 Testing Principles

### Test Setup

Tests use:
- **Vitest** as the test runner
- **NestJS Testing Module** for dependency injection
- **100% code coverage** threshold

### Unit Tests vs Integration Tests

#### Unit Tests

- **Purpose**: Test individual units of code in isolation
- **Naming**: `.unit.test.ts` suffix (e.g., `ProductsService.unit.test.ts`)
- **Scope**: Single class or function
- **Dependencies**: All dependencies are **mocked**
- **Speed**: Very fast (no I/O operations)

**Example**:

```typescript
import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { ProductsService } from './Products.service';
import { ProductRepository } from '../../../repositories/ProductRepository/ProductRepository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: {
            getUserProduct: vi.fn().mockResolvedValue(
              Ok(mock<Product>({ id: 'some-product-id' }))
            ),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  it('gets product from repository', async () => {
    const [product] = await service.getProduct({
      id: 'some-product-id',
      user: { id: 'some-user-id', email: 'some-user-email' },
    });

    expect(product).toEqual({ id: 'some-product-id' });
    expect(productRepository.getUserProduct).toHaveBeenCalledWith({
      id: 'some-product-id',
      user: { id: 'some-user-id', email: 'some-user-email' },
    });
  });
});
```

#### Integration Tests

- **Purpose**: Test how multiple components work together with real dependencies
- **Naming**: `.integration.test.ts` suffix (e.g., `ProductRepository.getProduct.integration.test.ts`)
- **Scope**: Multiple components (repositories, databases, external services)
- **Dependencies**: Use **real** implementations (database, file system, etc.)
- **Speed**: Slower (involves I/O operations)

**Example**:

```typescript
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { INestApplication } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestingApp } from '../../../test/testing-app';
import { ProductRepository } from './ProductRepository';

describe('ProductRepository.getProduct', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestingApp({
      logger: new MockLogger(),
    });
  });

  it('returns a product from database', async () => {
    const productRepository = app.get(ProductRepository);

    const [createdProduct] = await productRepository.createProduct({
      userId: 'some-user-id',
    });

    const [product] = await productRepository.getUserProduct({
      id: createdProduct.id,
      user: { id: 'some-user-id', email: 'some-user-email' },
    });

    expect(product).toEqual({
      id: createdProduct.id,
      // ... other properties
    });
  });
});
```

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

### Difference Between Unit and Integration Tests

| Aspect | Unit Tests | Integration Tests |
|--------|------------|-------------------|
| **Purpose** | Test individual units in isolation | Test component interactions |
| **Naming** | `.unit.test.ts` | `.integration.test.ts` |
| **Dependencies** | All mocked | Real implementations |
| **Speed** | Very fast | Slower (I/O operations) |
| **Scope** | Single class/function | Multiple components |
| **Database** | Not used | Real database |
| **Examples** | `ProductsService.unit.test.ts` | `ProductRepository.getProduct.integration.test.ts` |

For more testing information, refer to the [root README](../README.md).

## ⚠️ Error Handling Principles

### Result Pattern

All service and repository methods return `Result` types for type-safe error handling.

### Using `isFailure` for Failure Checks

**Always** use `isFailure` or `notFailure` to check for failures:

```typescript
import { isFailure, Failure } from '@jsfsi-core/ts-crossplatform';

const [product, failure] = await productsService.getProduct({ id, user });

// ✅ Good - Use isFailure for type-safe checking
if (isFailure(ProductNotFoundFailure)(failure)) {
  throw new NotFoundException(failure);
}

// ✅ Good - Use notFailure when you need the result
if (notFailure(Failure)(failure)) {
  // TypeScript knows product is defined here
  return product;
}
```

**Never** use direct boolean checks or type assertions:

```typescript
// ❌ Bad
if (failure) {
  // ...
}
```

### Try-Catch Only in Adapters and Exception Filters

`try-catch` blocks should **ONLY** be used in:
1. **Adapters** (external service integrations)
2. **Exception Filters** (NestJS exception handling)

```typescript
// ✅ Good - Adapter using try-catch
export class AuthorizationAdapter {
  public async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<
    Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>
  > {
    if (rawAuthorization === undefined) {
      return Ok(undefined);
    }

    if (!rawAuthorization?.startsWith('Bearer ')) {
      return Fail(new UnableToValidateUserFailure());
    }

    const idToken = rawAuthorization.split('Bearer ')[1];

    try {
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

```typescript
// ✅ Good - Exception filter using try-catch
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    this.logger.error('Unhandled exception', error);

    const httpStatus = this.mapStatusCode(error);
    const responseBody = this.mapError(error);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

```typescript
// ✅ Good - Domain service using Result types (no try-catch)
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  public async getProduct({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<Result<Product, ProductNotFoundFailure>> {
    // No try-catch - repository already returns Result types
    return this.productRepository.getUserProduct({ id, user });
  }
}
```

### Controllers: Convert Results to HTTP Responses

Controllers convert `Result` types to HTTP responses:

```typescript
@Controller('products')
export class ProductsController {
  @Get(':id')
  async getProduct(@Param('id') id: string, @CurrentUser() user: User): Promise<ProductResponse> {
    const [product, failure] = await this.productsService.getProduct({ id, user });

    if (isFailure(ProductNotFoundFailure)(failure)) {
      throw new NotFoundException(failure);
    }

    if (isFailure(ProductPermissionFailure)(failure)) {
      throw new ForbiddenException(failure);
    }

    return product;
  }
}
```

For comprehensive error handling documentation, refer to the [root README](../README.md) and [jsfsi-core-typescript documentation](https://github.com/jsfsi/jsfsi-core-typescript/).

## 🔄 Result Class for Typed Returns

The `Result` type provides type-safe error handling. All service and repository methods return `Result` types.

### Basic Usage

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';

async function getProduct(id: string): Promise<Result<Product, ProductNotFoundFailure>> {
  const product = await this.productRepository.findOne({ where: { id } });

  if (!product) {
    return Fail(new ProductNotFoundFailure(id));
  }

  return Ok(product);
}

// Usage
const [product, failure] = await getProduct('some-id');

if (isFailure(ProductNotFoundFailure)(failure)) {
  throw new NotFoundException(failure);
}

// TypeScript knows product is defined here
console.log(product.name);
```

### In Controllers

```typescript
@Get(':id')
async getProduct(@Param('id') id: string, @CurrentUser() user: User): Promise<ProductResponse> {
  const [product, failure] = await this.productsService.getProduct({ id, user });

  if (isFailure(ProductNotFoundFailure)(failure)) {
    throw new NotFoundException(failure);
  }

  return product;
}
```

For comprehensive Result class documentation, refer to the [root README](../README.md) and [jsfsi-core-typescript documentation](https://github.com/jsfsi/jsfsi-core-typescript/).

## 🎯 Domain-Driven Design

The core-api package follows **Domain-Driven Design (DDD)** principles.

### Domain Models

Domain models are located in `src/domain/models/`:

- **Entities**: `Product.model.ts`, `User.model.ts`
- **Value Objects**: `ProductDetail.model.ts`, `ProductVersionState.model.ts`
- **Failures**: `ProductNotFoundFailure.ts`, `ProductPermissionFailure.ts`, `DuplicatedProductVersionFailure.ts`

### Domain Services

Domain services are located in `src/domain/services/`:

- `ProductsService.ts`: Product-related business logic
- `ProductShareService.ts`: Product sharing business logic
- `UserService.ts`: User-related business logic

### Example

```typescript
// Domain model
export type Product = {
  id: string;
  name: string;
  idea: string;
  created: number;
  createdBy: string;
  owner: string;
  state: ProductVersionState;
  detail?: ProductDetail;
};

// Domain service
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly aiAdapter: AIAdapter,
  ) {}

  public async getProduct({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<Result<Product, ProductNotFoundFailure | ProductPermissionFailure>> {
    return this.productRepository.getUserProduct({ id, user });
  }
}

// Domain failure
export class ProductNotFoundFailure extends Failure {
  constructor(public readonly productId: string) {
    super();
  }
}
```

For more DDD information, refer to the [root README](../README.md) and [jsfsi-core-typescript documentation](https://github.com/jsfsi/jsfsi-core-typescript/).

## ✨ Best Practices

### 1. Dependency Injection

Use NestJS dependency injection:

```typescript
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly aiAdapter: AIAdapter,
  ) {}
}
```

### 2. Single Responsibility

Each class should have one responsibility:

```typescript
// ✅ Good
@Injectable()
export class ProductValidator {
  validateName(name: string): boolean {
    /* ... */
  }
}

@Injectable()
export class EmailSender {
  sendEmail(to: string, subject: string): Promise<void> {
    /* ... */
  }
}

// ❌ Bad
@Injectable()
export class ProductManager {
  validateName(name: string): boolean {
    /* ... */
  }
  sendEmail(to: string, subject: string): Promise<void> {
    /* ... */
  }
  saveProduct(product: Product): Promise<void> {
    /* ... */
  }
}
```

### 3. Use Guards for Authentication/Authorization

```typescript
@Controller('products')
export class ProductsController {
  @Get(':id')
  @Authorize() // Custom guard
  async getProduct(@Param('id') id: string, @CurrentUser() user: User): Promise<ProductResponse> {
    // User is guaranteed to be authenticated and authorized
    return this.productsService.getProduct({ id, user });
  }
}
```

### 4. Use Pipes for Validation

```typescript
@Post('')
async createProduct(
  @Body(new ZodValidationPipe(NewProductRequest)) newProduct: NewProductRequest,
  @CurrentUser() user: User,
): Promise<NewProductResponse> {
  // newProduct is validated and typed
  return this.productsService.createProduct({ newProduct, user });
}
```

### 5. Configuration

Use environment variables and Zod schemas for type-safe configuration:

```typescript
import { z } from 'zod';
import { parseConfig } from '@jsfsi-core/ts-nodejs';

const ConfigSchema = z.object({
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
});

export const config = parseConfig(ConfigSchema);
```

For more best practices, refer to the [root README](../README.md).

## 🗄️ Database Migrations

### Generating Migrations

```bash
npm run db:migrations:generate
```

### Running Migrations

```bash
# Run migrations in production
npm run db:migrations:run

# Run migrations in local environment
npm run db:migrations:run:local
```

### Migration Files

Migrations are located in `src/repositories/migrations/` and follow TypeORM conventions.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 25.0.0
- **npm**: 11.6.2
- **PostgreSQL**: For database (configured in environment variables)

### Installation

```bash
# From monorepo root
npm install

# Or for this package specifically
cd packages/core-api
npm install
```

### Configuration

Create a `.env` file in `src/configuration/` with the following variables:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/doraflow
CORS_ORIGIN=http://localhost:5173
```

### Development

```bash
# Run development server
npm run dev

# Or from monorepo root
npm run dev --workspace=@dora-flow/core-api
```

### Building

```bash
# Build for production
npm run build

# Or from monorepo root
npm run build --workspace=@dora-flow/core-api
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

# Watch mode
npm run test:watch
```

### Linting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## 🔗 Additional Resources

### Core Packages

- **[jsfsi-core-typescript](https://github.com/jsfsi/jsfsi-core-typescript/)**: Core TypeScript packages with shared utilities, Result types, and architectural patterns
- **[@jsfsi-core/ts-crossplatform](https://github.com/jsfsi/jsfsi-core-typescript/)**: Cross-platform utilities including Result types and Failure classes
- **[@jsfsi-core/ts-nodejs](https://github.com/jsfsi/jsfsi-core-typescript/)**: Node.js-specific utilities including logging and testing helpers

### Architecture

- [Root README](../README.md): Monorepo-level architecture and guidelines
- [jsfsi-core-typescript Documentation](https://github.com/jsfsi/jsfsi-core-typescript/): Core packages documentation

### NestJS

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### TypeORM

- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Migrations](https://typeorm.io/migrations)

## 📄 License

ISC
