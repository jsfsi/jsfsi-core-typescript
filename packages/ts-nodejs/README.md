# @jsfsi-core/ts-nodejs

Node.js-specific utilities for database management, logging, and environment configuration following hexagonal architecture principles.

## 📦 Installation

```bash
npm install @jsfsi-core/ts-nodejs
```

**Dependencies:**

- `typeorm` - TypeORM for database management
- `dotenv` - Environment variable loading

## 🏗️ Architecture

This package provides Node.js-specific implementations for:

- **Database**: Transactional repositories with TypeORM integration
- **Logging**: Structured logging interface with multiple implementations
- **Environment**: Type-safe environment variable loading

### Package Structure

```
src/
├── database/
│   ├── TransactionalRepository.ts    # Base transactional repository
│   ├── TransactionalEntity.ts        # Entity interface
│   └── postgres/                     # PostgreSQL utilities
├── logger/
│   ├── Logger.ts                     # Logger interface
│   ├── GCPLogger.ts                  # Google Cloud Platform logger
│   └── MockLogger.ts                 # Test logger
└── env/
    └── env.loader.ts                 # Environment loader
```

## 📋 Features

### Transactional Repository

Type-safe transactional repository base class for database operations:

```typescript
import { TransactionalRepository } from '@jsfsi-core/ts-nodejs';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/UserEntity';

export class UserRepository extends TransactionalRepository {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const repository = this.getRepository(UserEntity);
    return repository.findOne({ where: { id } });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const repository = this.getRepository(UserEntity);
    return repository.save(user);
  }
}
```

### Transactions

Execute operations within a transaction:

```typescript
async function createUserWithProfile(
  userData: CreateUserData,
  profileData: CreateProfileData,
): Promise<User> {
  return this.userRepository.withTransaction(async (userRepo) => {
    // All operations within this callback run in a single transaction
    const user = await userRepo.save(createUserEntity(userData));

    const profileRepo = this.profileRepository.withRepositoryManager(userRepo);
    const profile = await profileRepo.save(createProfileEntity(user.id, profileData));

    return { user, profile };
  });
}
```

### Transactions as Domain Concepts

**Transactions are domain concepts, not persistence concepts.**

A transaction represents a **business operation** that must be atomic - it either completes entirely or fails entirely. The transactional repository allows you to move this concept to the domain layer, abstracting the persistence implementation.

#### Why Transactions Belong to Domain

Transactions express business rules about consistency and atomicity:

- **Business Rules**: "When creating an order, both the order and payment must succeed together"
- **Consistency**: "User registration includes creating a profile and sending a welcome email - all must succeed or all must fail"
- **Atomicity**: "Inventory deduction and order creation must happen together"

The transactional repository abstraction allows domain services to express these business rules without being tied to a specific persistence technology (TypeORM, Prisma, etc.).

#### Transactions with External Services

Transactions can include **any operations** that should be part of an atomic business operation, including external API calls. If an external service fails, the transaction should rollback:

```typescript
// Domain service expressing a business operation
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly paymentService: PaymentService, // External service adapter
  ) {}

  async createOrder(orderData: CreateOrderData): Promise<Result<Order, CreateOrderFailure>> {
    // This is a domain concept: "Create order" is a single atomic business operation
    return this.orderRepository.withTransaction(async (orderRepo) => {
      // Step 1: Create order in database
      const [order, orderFailure] = await orderRepo.save(createOrderEntity(orderData));
      if (isFailure(SaveOrderFailure)(orderFailure)) {
        return Fail(orderFailure);
      }

      // Step 2: Deduct inventory in database
      const inventoryRepo = this.inventoryRepository.withRepositoryManager(orderRepo);
      const [inventory, inventoryFailure] = await inventoryRepo.deductStock(orderData.items);
      if (isFailure(DeductInventoryFailure)(inventoryFailure)) {
        // Transaction automatically rolls back order creation
        return Fail(inventoryFailure);
      }

      // Step 3: Charge payment via external API
      // This is part of the same business transaction!
      const [payment, paymentFailure] = await this.paymentService.chargePayment({
        orderId: order.id,
        amount: order.total,
        customerId: order.customerId,
      });

      if (isFailure(PaymentFailure)(paymentFailure)) {
        // If payment fails, the transaction rolls back:
        // - Order is NOT created
        // - Inventory is NOT deducted
        // - Payment is NOT charged
        // All operations are atomic
        return Fail(paymentFailure);
      }

      // All operations succeeded - transaction commits:
      // - Order is created
      // - Inventory is deducted
      // - Payment is charged
      return Ok(order);
    });
  }
}
```

#### Example: User Registration with External Service

Another example showing how transactions abstract persistence and include external operations:

```typescript
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly emailService: EmailService, // External service
    private readonly auditService: AuditService, // External service
  ) {}

  async registerUser(
    registrationData: RegistrationData,
  ): Promise<Result<User, RegistrationFailure>> {
    // Domain concept: "User registration" is an atomic business operation
    return this.userRepository.withTransaction(async (userRepo) => {
      // Step 1: Create user in database
      const [user, userFailure] = await userRepo.save(createUserEntity(registrationData));
      if (isFailure(SaveUserFailure)(userFailure)) {
        return Fail(userFailure);
      }

      // Step 2: Create profile in database
      const profileRepo = this.profileRepository.withRepositoryManager(userRepo);
      const [profile, profileFailure] = await profileRepo.save(
        createProfileEntity(user.id, registrationData.profile),
      );
      if (isFailure(SaveProfileFailure)(profileFailure)) {
        // Transaction rolls back user creation
        return Fail(profileFailure);
      }

      // Step 3: Send welcome email via external API
      const [emailSent, emailFailure] = await this.emailService.sendWelcomeEmail(user.email);
      if (isFailure(EmailServiceFailure)(emailFailure)) {
        // If email fails, rollback entire registration:
        // - User is NOT created
        // - Profile is NOT created
        // - Email is NOT sent
        return Fail(emailFailure);
      }

      // Step 4: Log audit event to external audit service
      const [auditLogged, auditFailure] = await this.auditService.logEvent({
        event: 'USER_REGISTERED',
        userId: user.id,
        timestamp: new Date(),
      });

      if (isFailure(AuditServiceFailure)(auditFailure)) {
        // If audit logging fails, rollback everything
        return Fail(auditFailure);
      }

      // All operations succeeded - transaction commits
      return Ok(user);
    });
  }
}
```

#### Key Benefits

1. **Domain Abstraction**: Transactions are expressed as domain concepts, not database concepts
2. **Persistence Independence**: Can switch database implementations without changing domain logic
3. **Atomic Business Operations**: Express business rules about what operations must succeed together
4. **External Service Integration**: Include external API calls as part of atomic business operations
5. **Consistency**: Ensure all operations in a business transaction succeed or all fail

### Transaction Propagation

Share transactions across repositories:

```typescript
async function updateUserAndOrders(userId: string, updates: UserUpdates): Promise<void> {
  return this.userRepository.withTransaction(async (userRepo) => {
    // Update user
    await userRepo.save(updatedUser);

    // Use same transaction for order repository
    const orderRepo = this.orderRepository.withRepositoryManager(userRepo);
    await orderRepo.updateOrdersForUser(userId, updates);
  });
}
```

### Locking

Use pessimistic locking for concurrent operations:

```typescript
async function findByIdWithLock(id: string): Promise<UserEntity | null> {
  const repository = this.getRepository(UserEntity);
  return repository.findOne({
    where: { id },
    lock: this.lockInTransaction('pessimistic_write'),
  });
}
```

### Logger

Structured logging interface:

```typescript
import { Logger } from '@jsfsi-core/ts-nodejs';

export class MyService {
  constructor(private readonly logger: Logger) {}

  async processOrder(orderId: string) {
    this.logger.log('Processing order', { orderId });

    try {
      // Process order
      this.logger.verbose('Order processed successfully', { orderId });
    } catch (error) {
      this.logger.error('Failed to process order', { orderId, error });
      throw error;
    }
  }
}
```

### Log Levels

```typescript
import { Logger, LogLevel } from '@jsfsi-core/ts-nodejs';

// Available log levels
type LogLevel = 'debug' | 'verbose' | 'log' | 'warn' | 'error' | 'fatal';

// Set log levels
logger.setLogLevels(['log', 'warn', 'error']);
```

### Logger Implementations

#### Console Logger

Basic console logger (for development):

```typescript
import { ConsoleLogger } from './logger/ConsoleLogger';

const logger = new ConsoleLogger();
logger.log('Hello world');
```

#### GCP Logger

Google Cloud Platform structured logger compatible with **NestJS LoggerService interface**.

The GCP Logger automatically performs **data sanitization and redaction** for sensitive keys, ensuring that sensitive information (passwords, tokens, API keys, etc.) is never logged:

```typescript
import { GCPLogger } from '@jsfsi-core/ts-nodejs';

// Initialize with module name (like NestJS Logger)
const logger = new GCPLogger('UserService');

// Sensitive keys are automatically redacted
logger.log('User login attempt', {
  userId: '123',
  email: 'user@example.com',
  password: 'secret123', // Will be redacted as [HIDDEN BY LOGGER]
  token: 'abc123xyz', // Will be redacted as [HIDDEN BY LOGGER]
  authorization: 'Bearer token', // Will be redacted as [HIDDEN BY LOGGER]
});

// Output: Sensitive fields are automatically sanitized
// {
//   "severity": "INFO",
//   "message": {
//     "textPayload": "User login attempt",
//     "metadata": {
//       "userId": "123",
//       "email": "user@example.com",
//       "password": "[HIDDEN BY LOGGER]",
//       "token": "[HIDDEN BY LOGGER]",
//       "authorization": "[HIDDEN BY LOGGER]"
//     }
//   }
// }
```

**Automatically redacted sensitive keys include:**

- `password`, `pass`, `psw`
- `token`, `access_token`
- `authorization`, `authentication`, `auth`
- `x-api-key`, `x-api-token`, `x-key`, `x-token`
- `cookie`
- `secret`, `client-secret`
- `credentials`

**Features:**

- ✅ Compatible with **NestJS LoggerService** interface - can be used directly in NestJS applications
- ✅ **Automatic data sanitization** - sensitive keys are automatically redacted
- ✅ **Structured logging** - logs formatted for Google Cloud Platform
- ✅ **Safe stringification** - handles circular references safely
- ✅ **Severity mapping** - maps log levels to GCP severity levels

#### Mock Logger

For testing:

```typescript
import { MockLogger } from '@jsfsi-core/ts-nodejs';

const logger = new MockLogger();
logger.log('Hello world');

// Assertions
expect(logger.logs).toContainEqual({ level: 'log', message: 'Hello world' });
```

### Environment Loader

Type-safe environment variable loading:

```typescript
import { loadEnvConfig } from '@jsfsi-core/ts-nodejs';

// Load .env file from configuration directory
loadEnvConfig({
  configPath: './configuration',
  env: 'development', // optional, defaults to no suffix
});

// Access environment variables
const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
```

**Note**: For type-safe configuration with validation, use `@jsfsi-core/ts-crossplatform`'s `parseConfig` with Zod schemas.

## 📝 Naming Conventions

### Repositories

- **Repositories**: PascalCase suffix with `Repository` (e.g., `UserRepository`, `OrderRepository`)
- **Methods**: Use descriptive names (`findById`, `save`, `delete`)

### Entities

- **Entities**: PascalCase suffix with `Entity` (e.g., `UserEntity`, `OrderEntity`)

### Services

- **Services**: PascalCase suffix with `Service` (e.g., `UserService`, `OrderService`)

## 🧪 Testing Principles

### Testing Repositories

Use `buildTransactionalRepositoryMock` for testing:

```typescript
import { buildTransactionalRepositoryMock } from '@jsfsi-core/ts-nodejs';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    const mockDataSource = {} as DataSource;
    const repositoryInstance = new UserRepository(mockDataSource);
    repository = buildTransactionalRepositoryMock(repositoryInstance);
  });

  it('finds user by id', async () => {
    const user = await repository.findById('123');
    // Test implementation
  });
});
```

### Testing with Transactions

```typescript
describe('UserService', () => {
  it('creates user within transaction', async () => {
    const result = await userService.createUserWithProfile(userData, profileData);

    // Verify both user and profile were created
    expect(result.user).toBeDefined();
    expect(result.profile).toBeDefined();
  });
});
```

### Testing Logging

Use `MockLogger` for testing (it provides no-op implementations of all logging methods):

```typescript
import { MockLogger } from '@jsfsi-core/ts-nodejs';

describe('UserService', () => {
  let logger: MockLogger;
  let service: UserService;

  beforeEach(() => {
    logger = new MockLogger();
    service = new UserService(logger);
  });

  it('processes order without throwing', async () => {
    // MockLogger silently absorbs all logs, making tests cleaner
    await expect(service.processOrder('invalid-id')).resolves.not.toThrow();
  });
});
```

## ⚠️ Error Handling Principles

### Result Types in Repository Methods

**Repositories should return Result types** when operations can fail:

```typescript
import { Result, Ok, Fail, isFailure } from '@jsfsi-core/ts-crossplatform';

// ✅ Good - Return Result type
async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
  const repository = this.getRepository(UserEntity);
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    return Fail(new UserNotFoundFailure(id));
  }

  return Ok(user);
}

// ❌ Bad - Throwing exceptions
async findById(id: string): Promise<UserEntity> {
  const repository = this.getRepository(UserEntity);
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new Error('User not found'); // Don't throw in repository
  }

  return user;
}
```

### Transaction Error Handling

Transactions automatically rollback on errors:

```typescript
async function createUserWithProfile(
  userData: CreateUserData,
  profileData: CreateProfileData,
): Promise<Result<User, CreateUserFailure>> {
  return this.userRepository.withTransaction(async (userRepo) => {
    const [user, userFailure] = await userRepo.save(userData);

    if (isFailure(CreateUserFailure)(userFailure)) {
      // Transaction automatically rolls back
      return Fail(userFailure);
    }

    const [profile, profileFailure] = await this.profileRepository
      .withRepositoryManager(userRepo)
      .save(profileData);

    if (isFailure(CreateProfileFailure)(profileFailure)) {
      // Transaction automatically rolls back
      return Fail(profileFailure);
    }

    return Ok({ user, profile });
  });
}
```

### Try-Catch at Edges

**Try-catch should only be used at the edge** (when interfacing with external systems):

```typescript
// ✅ Good - In adapter (edge)
export class DatabaseAdapter implements IUserRepository {
  async save(user: UserEntity): Promise<Result<UserEntity, DatabaseFailure>> {
    try {
      const saved = await this.repository.save(user);
      return Ok(saved);
    } catch (error) {
      return Fail(new DatabaseFailure(error));
    }
  }
}

// ✅ Good - Domain service (no try-catch)
export class UserService {
  async createUser(data: CreateUserData): Promise<Result<User, CreateUserFailure>> {
    // No try-catch - errors are handled as Result types
    return this.userRepository.save(data);
  }
}
```

## 🎯 Domain-Driven Design

### Repository Pattern

Repositories abstract database access:

```typescript
// Domain interface
export interface IUserRepository {
  findById(id: string): Promise<Result<User, UserNotFoundFailure>>;
  save(user: User): Promise<Result<User, SaveUserFailure>>;
}

// Implementation in adapter
export class UserRepository extends TransactionalRepository implements IUserRepository {
  async findById(id: string): Promise<Result<User, UserNotFoundFailure>> {
    const repository = this.getRepository(UserEntity);
    const entity = await repository.findOne({ where: { id } });

    if (!entity) {
      return Fail(new UserNotFoundFailure(id));
    }

    return Ok(mapEntityToDomain(entity));
  }
}
```

### Entity Mapping

Map between database entities and domain models:

```typescript
// Domain model
export type User = {
  id: string;
  email: string;
  name: string;
};

// Database entity
@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;
}

// Mapping functions
function mapEntityToDomain(entity: UserEntity): User {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
  };
}

function mapDomainToEntity(user: User): UserEntity {
  const entity = new UserEntity();
  entity.id = user.id;
  entity.email = user.email;
  entity.name = user.name;
  return entity;
}
```

## 🔄 Result Class Integration

### Repository Methods

Always return Result types from repository methods:

```typescript
export class UserRepository extends TransactionalRepository {
  async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
    const repository = this.getRepository(UserEntity);
    const user = await repository.findOne({ where: { id } });

    if (!user) {
      return Fail(new UserNotFoundFailure(id));
    }

    return Ok(user);
  }

  async save(user: UserEntity): Promise<Result<UserEntity, SaveUserFailure>> {
    try {
      const repository = this.getRepository(UserEntity);
      const saved = await repository.save(user);
      return Ok(saved);
    } catch (error) {
      return Fail(new SaveUserFailure(error));
    }
  }
}
```

### Service Layer

Chain Result types in service layer:

```typescript
export class UserService {
  async createUser(data: CreateUserData): Promise<Result<User, CreateUserFailure>> {
    // Validate first
    const [validated, validationFailure] = validateUserData(data);
    if (isFailure(ValidationFailure)(validationFailure)) {
      return Fail(validationFailure);
    }

    // Save to database
    const [user, saveFailure] = await this.userRepository.save(validated);
    if (isFailure(SaveUserFailure)(saveFailure)) {
      return Fail(saveFailure);
    }

    return Ok(user);
  }
}
```

## 📚 Best Practices

### 1. Transaction Boundaries

Keep transactions as short as possible:

```typescript
// ✅ Good - Short transaction
async function createUser(data: CreateUserData): Promise<Result<User>> {
  return this.repository.withTransaction(async (repo) => {
    return repo.save(data);
  });
}

// ❌ Bad - Long transaction with external calls
async function createUser(data: CreateUserData): Promise<Result<User>> {
  return this.repository.withTransaction(async (repo) => {
    const user = await repo.save(data);
    await this.emailService.sendWelcomeEmail(user.email); // Don't do this in transaction
    await this.cacheService.invalidate(user.id); // Don't do this in transaction
    return Ok(user);
  });
}
```

### 2. Repository Methods

Keep repository methods focused on data access:

```typescript
// ✅ Good - Focused data access
async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
  const repository = this.getRepository(UserEntity);
  const user = await repository.findOne({ where: { id } });
  return user ? Ok(user) : Fail(new UserNotFoundFailure(id));
}

// ❌ Bad - Business logic in repository
async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
  const repository = this.getRepository(UserEntity);
  const user = await repository.findOne({ where: { id } });

  // Don't put business logic here
  if (user && user.isActive) {
    user.lastAccessed = new Date();
    await repository.save(user);
  }

  return user ? Ok(user) : Fail(new UserNotFoundFailure(id));
}
```

### 3. Error Handling

Use Result types, not exceptions:

```typescript
// ✅ Good
async findById(id: string): Promise<Result<UserEntity, UserNotFoundFailure>> {
  const user = await this.getRepository(UserEntity).findOne({ where: { id } });
  return user ? Ok(user) : Fail(new UserNotFoundFailure(id));
}

// ❌ Bad
async findById(id: string): Promise<UserEntity> {
  const user = await this.getRepository(UserEntity).findOne({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
```

### 4. Logging

Use structured logging:

```typescript
// ✅ Good - Structured logging
this.logger.log('User created', { userId: user.id, email: user.email });

// ❌ Bad - String interpolation
this.logger.log(`User ${user.id} created with email ${user.email}`);
```

### 5. Environment Variables

Use type-safe configuration:

```typescript
// ✅ Good - Type-safe with Zod
import { parseConfig } from '@jsfsi-core/ts-crossplatform';
import { z } from 'zod';

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number),
});

export const config = parseConfig(ConfigSchema);

// ❌ Bad - Direct environment access
const dbUrl = process.env.DATABASE_URL; // Not type-safe
```

## 🔗 Additional Resources

### TypeORM

- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Transactions](https://typeorm.io/transactions)

### Architecture

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)

### Error Handling

- [Result Type Pattern](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)

## 📄 License

ISC
