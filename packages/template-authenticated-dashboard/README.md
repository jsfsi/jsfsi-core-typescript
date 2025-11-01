# Template Authenticated Dashboard

A React application template demonstrating best practices for building authenticated dashboards using Hexagonal Architecture, Domain-Driven Design, and functional error handling.

## 🏗️ Architecture

This template follows **Hexagonal Architecture** (Ports and Adapters) with clear separation of concerns:

```
src/
├── domain/                    # Domain Layer (Pure business logic)
│   ├── models/               # Domain entities and failures
│   │   ├── User.ts
│   │   ├── SignInFailure.ts
│   │   ├── SignUpFailure.ts
│   │   └── PasswordResetEmailFailure.ts
│   └── services/            # Domain services
│       └── AuthenticationService.ts
├── adapters/                 # Adapter Layer (External integrations)
│   ├── FirebaseClient/      # Firebase integration (edge)
│   └── AuthenticationAdapter/ # Authentication adapter
└── ui/                       # Application/UI Layer
    ├── app/                 # Application setup
    ├── components/          # React components
    ├── pages/              # Page components
    └── hooks/               # React hooks
```

### Architecture Principles

1. **Domain Layer**: Contains pure business logic with no external dependencies
2. **Adapter Layer**: Handles external services (Firebase, APIs, etc.) and converts exceptions to Result types
3. **UI Layer**: React components that use domain services and handle presentation logic
4. **Dependency Injection**: Uses IoC container for dependency management

### Example Flow

```
UI Component → Domain Service → Adapter → External Service (Firebase)
     ↓              ↓              ↓              ↓
  React        Business Logic   Result Type   Try-Catch (Edge)
```

## 📋 Features

- **Authentication**: Sign in, sign up, password reset with Google and email/password
- **Protected Routes**: Route protection based on authentication state
- **Type-Safe**: Full TypeScript support with strict types
- **Error Handling**: Result types for functional error handling
- **Dependency Injection**: IoC container for managing dependencies
- **Testing**: Comprehensive test coverage with Vitest

## 📝 Naming Conventions

### Files and Directories

- **Components**: PascalCase (e.g., `LoginForm.tsx`, `DashboardPage.tsx`)
- **Services**: PascalCase suffix with `Service` (e.g., `AuthenticationService.ts`)
- **Adapters**: PascalCase suffix with `Adapter` (e.g., `AuthenticationAdapter.ts`)
- **Models**: PascalCase (e.g., `User.ts`, `SignInFailure.ts`)
- **Hooks**: camelCase prefix with `use` (e.g., `useAuth.ts`, `useTheme.ts`)

### Code Naming

- **Components**: PascalCase (e.g., `LoginForm`, `DashboardPage`)
- **Services**: PascalCase (e.g., `AuthenticationService`)
- **Failures**: PascalCase suffix with `Failure` (e.g., `SignInFailure`)
- **Functions**: camelCase (e.g., `signIn`, `handleSubmit`)

## 🧪 Testing Principles

### Test-Driven Development (TDD)

This template follows TDD principles:

1. **Write failing test first**
2. **Write minimal code to pass**
3. **Refactor while keeping tests green**

### Testing Components

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('displays error message on sign in failure', async () => {
    const mockSignIn = vi.fn().mockResolvedValue([
      undefined,
      new SignInFailure('Invalid credentials'),
    ]);

    render(<LoginForm onSignIn={mockSignIn} />);

    // Test implementation
    const [user, failure] = await mockSignIn();

    expect(isFailure(SignInFailure)(failure)).toBe(true);
  });

  it('navigates to dashboard on successful sign in', async () => {
    const mockUser: User = { id: '1', email: 'test@example.com' };
    const mockSignIn = vi.fn().mockResolvedValue([mockUser, undefined]);

    render(<LoginForm onSignIn={mockSignIn} />);

    // Test implementation
  });
});
```

### Testing Services

```typescript
import { describe, it, expect } from 'vitest';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { AuthenticationService } from './AuthenticationService';

describe('AuthenticationService', () => {
  it('returns user on successful sign in', async () => {
    const service = new AuthenticationService(mockAdapter);
    const [user, failure] = await service.signIn();

    expect(user).toBeDefined();
    expect(failure).toBeUndefined();
  });

  it('returns SignInFailure on authentication error', async () => {
    const service = new AuthenticationService(mockAdapter);
    const [user, failure] = await service.signIn();

    expect(user).toBeUndefined();
    expect(isFailure(SignInFailure)(failure)).toBe(true);
  });
});
```

### Testing Adapters

```typescript
import { describe, it, expect } from 'vitest';
import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { FirebaseClient } from './FirebaseClient';

describe('FirebaseClient', () => {
  it('converts exceptions to Result types', async () => {
    const client = new FirebaseClient();
    client.initialize();

    // Mock Firebase to throw exception
    const [user, failure] = await client.signInWithEmailAndPassword({
      email: 'invalid',
      password: 'password',
    });

    expect(user).toBeUndefined();
    expect(isFailure(SignInFailure)(failure)).toBe(true);
  });
});
```

## ⚠️ Error Handling Principles

### Result Types in Domain

**Domain services return Result types** - no exceptions thrown:

```typescript
// ✅ Good - Domain service
export class AuthenticationService {
  async signIn(): Promise<Result<User, SignInFailure>> {
    // No try-catch - errors handled as Result types
    return this.authAdapter.signIn();
  }
}

// ❌ Bad - Throwing exceptions in domain
export class AuthenticationService {
  async signIn(): Promise<User> {
    if (!this.isValid()) {
      throw new Error('Invalid'); // Don't throw in domain
    }
  }
}
```

### Try-Catch at Edges

**Try-catch blocks only exist in adapters** (edges of hexagonal architecture):

```typescript
// ✅ Good - In adapter (edge)
export class FirebaseClient {
  public async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithEmailAndPassword(email, password);

      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      const user = await this.mapFirebaseUserToUser(firebaseUser.user);
      return Ok(user);
    } catch (error) {
      // Exception caught at edge and converted to Result
      return Fail(new SignInFailure(error));
    }
  }
}

// ✅ Good - Domain service (no try-catch)
export class AuthenticationService {
  async signIn(): Promise<Result<User, SignInFailure>> {
    // No try-catch - errors handled as Result types
    return this.authAdapter.signIn();
  }
}
```

### Failure Checking

**Always use `isFailure` and `notFailure` matchers:**

```typescript
import { isFailure, notFailure } from '@jsfsi-core/ts-crossplatform';

// ✅ Good
const [user, failure] = await authenticationService.signIn();

if (isFailure(SignInFailure)(failure)) {
  // Handle SignInFailure
  console.error('Sign in failed:', failure.error);
  return;
}

if (notFailure(SignInFailure)(failure)) {
  // Not a SignInFailure (could be another failure type or undefined)
}

// ❌ Bad - Don't use instanceof
if (failure instanceof SignInFailure) {
  // Avoid this pattern
}
```

### UI Error Handling

Handle Result types in UI components:

```typescript
const handleSignIn = async (email: string, password: string) => {
  const [user, failure] = await authenticationService.signInWithEmailAndPassword({
    email,
    password,
  });

  if (isFailure(SignInFailure)(failure)) {
    // Display error to user
    setError('Sign in failed. Please check your credentials.');
    return;
  }

  // Success - navigate to dashboard
  navigate('/dashboard');
};
```

## 🎯 Domain-Driven Design

### Domain Models

Domain models represent business concepts:

```typescript
// Domain entity
export type User = {
  id: string;
  providerId: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  idToken: string;
};

// Domain failure
export class SignInFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
```

### Domain Services

Domain services contain business logic:

```typescript
// ✅ Good - Domain service (no React/Firebase dependencies)
export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  async signIn(): Promise<Result<User, SignInFailure>> {
    // Business logic here
    return this.authAdapter.signIn();
  }

  async signUpWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignUpFailure>> {
    // Business logic here
    return this.authAdapter.signUpWithEmailAndPassword({ email, password });
  }
}
```

### Adapters Implement Domain Interfaces

Adapters bridge domain and external services:

```typescript
// ✅ Good - Adapter implements domain interface
export class AuthenticationAdapter {
  constructor(private readonly firebaseClient: FirebaseClient) {}

  async signIn(): Promise<Result<User, SignInFailure>> {
    // Converts Firebase operations to domain Result types
    return this.firebaseClient.signInWithGoogle();
  }
}
```

## 🔄 Result Class Usage

### Using Result Types in Components

```typescript
import { Result, isFailure } from '@jsfsi-core/ts-crossplatform';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

export function LoginForm() {
  const authenticationService = useInjection(AuthenticationService);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    const [user, failure] = await authenticationService.signInWithEmailAndPassword({
      email,
      password,
    });

    if (isFailure(SignInFailure)(failure)) {
      setError('Sign in failed. Please check your credentials.');
      return;
    }

    // Success - user is guaranteed to be defined
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Chaining Results

```typescript
async function authenticateAndGetProfile(
  email: string,
  password: string,
): Promise<Result<Profile, SignInFailure | ProfileLoadFailure>> {
  const [user, signInFailure] = await authenticationService.signInWithEmailAndPassword({
    email,
    password,
  });

  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  const [profile, profileFailure] = await profileService.getProfile(user.id);

  if (isFailure(ProfileLoadFailure)(profileFailure)) {
    return Fail(profileFailure);
  }

  return Ok(profile);
}
```

### Multiple Failure Types

```typescript
type AuthResult = Result<User, SignInFailure | NetworkFailure | ValidationFailure>;

async function authenticate(email: string, password: string): Promise<AuthResult> {
  // Validate first
  const [validated, validationFailure] = validateCredentials({ email, password });
  if (isFailure(ValidationFailure)(validationFailure)) {
    return Fail(validationFailure);
  }

  // Check network
  const [networkCheck, networkFailure] = await checkNetwork();
  if (isFailure(NetworkFailure)(networkFailure)) {
    return Fail(networkFailure);
  }

  // Sign in
  const [user, signInFailure] = await authenticationService.signIn(
    validated.email,
    validated.password,
  );
  if (isFailure(SignInFailure)(signInFailure)) {
    return Fail(signInFailure);
  }

  return Ok(user);
}
```

## 📚 Best Practices

### 1. Dependency Injection

Use IoC container for dependencies:

```typescript
// ✅ Good - Dependency injection
export function LoginForm() {
  const authenticationService = useInjection(AuthenticationService);
  // ...
}

// ❌ Bad - Direct instantiation
export function LoginForm() {
  const authenticationService = new AuthenticationService(new AuthenticationAdapter());
  // ...
}
```

### 2. Component Organization

Keep components focused and small:

```typescript
// ✅ Good - Focused component
export function LoginForm() {
  const { signIn } = useAuth();

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}

// ❌ Bad - Component doing too much
export function LoginPage() {
  // Authentication logic
  // Form validation
  // API calls
  // Navigation
  // Error handling
  // ...
}
```

### 3. Custom Hooks

Extract logic into custom hooks:

```typescript
// ✅ Good - Custom hook
export function useAuth() {
  const authenticationService = useInjection(AuthenticationService);

  const signIn = async (email: string, password: string) => {
    return authenticationService.signInWithEmailAndPassword({ email, password });
  };

  return { signIn };
}

// Use in component
export function LoginForm() {
  const { signIn } = useAuth();
  // ...
}
```

### 4. Error Boundaries

Use error boundaries for unhandled errors:

```typescript
export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Routes */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

### 5. Type Safety

Always use TypeScript types:

```typescript
// ✅ Good - Explicit types
async function signIn(email: string, password: string): Promise<Result<User, SignInFailure>> {
  // ...
}

// ❌ Bad - No types
async function signIn(email, password) {
  // ...
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 25.1.0
- npm 11.6.2
- Firebase project (for authentication)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.test .env
```

3. Configure Firebase:
   - Create a Firebase project
   - Add your Firebase configuration to `.env`

### Configuration

Edit `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting

```bash
npm run lint
```

## 🔗 Additional Resources

### Architecture

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### React

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)

### Firebase

- [Firebase Authentication](https://firebase.google.com/docs/auth)

### Error Handling

- [Result Type Pattern](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

## 📄 License

ISC
