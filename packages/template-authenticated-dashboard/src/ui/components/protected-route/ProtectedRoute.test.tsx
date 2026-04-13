import { mock } from '@jsfsi-core/ts-crossplatform';
import * as TsReact from '@jsfsi-core/ts-react';
import { User } from '@jsfsi-core/ts-react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
}));

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    vi.spyOn(TsReact, 'useAuth').mockReturnValue({
      currentUser: mock<User>(),
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signInWithEmailAndPassword: vi.fn(),
      signUp: vi.fn(),
      signUpWithEmailAndPassword: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
    });

    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Route Children</div>
      </ProtectedRoute>,
    );

    expect(getByText('Protected Route Children')).toBeInTheDocument();
  });

  it('renders loading when authenticating', () => {
    vi.spyOn(TsReact, 'useAuth').mockReturnValue({
      currentUser: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signInWithEmailAndPassword: vi.fn(),
      signUp: vi.fn(),
      signUpWithEmailAndPassword: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
    });

    const { queryByText, getByText } = render(
      <ProtectedRoute>
        <div>Protected Route Children</div>
      </ProtectedRoute>,
    );

    expect(getByText('Loading...')).toBeInTheDocument();
    expect(queryByText('Protected Route Children')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    vi.spyOn(TsReact, 'useAuth').mockReturnValue({
      currentUser: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signInWithEmailAndPassword: vi.fn(),
      signUp: vi.fn(),
      signUpWithEmailAndPassword: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
    });

    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Route Children</div>
      </ProtectedRoute>,
    );

    expect(getByText('Navigate to /login')).toBeInTheDocument();
  });
});
