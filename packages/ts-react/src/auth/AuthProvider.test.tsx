import { Fail, Ok } from '@jsfsi-core/ts-crossplatform';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, type Mock } from 'vitest';

import { AuthProvider, useAuth, type AuthMethods } from './AuthProvider';
import { EmailVerificationFailure } from './EmailVerificationFailure';
import { PasswordResetEmailFailure } from './PasswordResetEmailFailure';
import { ReloadUserFailure } from './ReloadUserFailure';
import { SignInFailure } from './SignInFailure';
import { SignUpFailure } from './SignUpFailure';

type TestUser = { id: string; name: string; emailVerified: boolean };

function TestLoader() {
  return <div>Loading...</div>;
}

type TestCallbacks = {
  authCallback: ((user: TestUser | null) => void) | null;
  unsubscribe: Mock<() => void>;
  onAuthChanged: (callback: (user: TestUser | null) => void) => () => void;
  onSignIn: Mock<AuthMethods<TestUser>['signIn']>;
  onSignOut: Mock<AuthMethods<TestUser>['signOut']>;
  onSignInWithEmailAndPassword: Mock<AuthMethods<TestUser>['signInWithEmailAndPassword']>;
  onSignUp: Mock<AuthMethods<TestUser>['signUp']>;
  onSignUpWithEmailAndPassword: Mock<AuthMethods<TestUser>['signUpWithEmailAndPassword']>;
  onSendPasswordResetEmail: Mock<AuthMethods<TestUser>['sendPasswordResetEmail']>;
  onSendEmailVerification: Mock<AuthMethods<TestUser>['sendEmailVerification']>;
  onReloadUser: Mock<AuthMethods<TestUser>['reloadUser']>;
};

function createCallbacks(): TestCallbacks {
  const state: TestCallbacks = {
    authCallback: null,
    unsubscribe: vi.fn<() => void>(),
    onAuthChanged: (callback) => {
      state.authCallback = callback;
      return state.unsubscribe;
    },
    onSignIn: vi
      .fn<AuthMethods<TestUser>['signIn']>()
      .mockResolvedValue(Ok({ id: '1', name: 'Signed In', emailVerified: false })),
    onSignOut: vi.fn<AuthMethods<TestUser>['signOut']>().mockResolvedValue(undefined),
    onSignInWithEmailAndPassword: vi
      .fn<AuthMethods<TestUser>['signInWithEmailAndPassword']>()
      .mockResolvedValue(Ok({ id: '1', name: 'Signed In', emailVerified: false })),
    onSignUp: vi
      .fn<AuthMethods<TestUser>['signUp']>()
      .mockResolvedValue(Ok({ id: '1', name: 'Signed Up', emailVerified: false })),
    onSignUpWithEmailAndPassword: vi
      .fn<AuthMethods<TestUser>['signUpWithEmailAndPassword']>()
      .mockResolvedValue(Ok({ id: '1', name: 'Signed Up', emailVerified: false })),
    onSendPasswordResetEmail: vi
      .fn<AuthMethods<TestUser>['sendPasswordResetEmail']>()
      .mockResolvedValue(Ok(undefined)),
    onSendEmailVerification: vi
      .fn<AuthMethods<TestUser>['sendEmailVerification']>()
      .mockResolvedValue(Ok(undefined)),
    onReloadUser: vi
      .fn<AuthMethods<TestUser>['reloadUser']>()
      .mockResolvedValue(Ok({ id: '1', name: 'Reloaded', emailVerified: true })),
  };
  return state;
}

function renderWithCallbacks(Consumer: React.ComponentType, callbacks: TestCallbacks) {
  return render(
    <AuthProvider<TestUser>
      loader={TestLoader}
      onAuthChanged={callbacks.onAuthChanged}
      onSignIn={callbacks.onSignIn}
      onSignOut={callbacks.onSignOut}
      onSignInWithEmailAndPassword={callbacks.onSignInWithEmailAndPassword}
      onSignUp={callbacks.onSignUp}
      onSignUpWithEmailAndPassword={callbacks.onSignUpWithEmailAndPassword}
      onSendPasswordResetEmail={callbacks.onSendPasswordResetEmail}
      onSendEmailVerification={callbacks.onSendEmailVerification}
      onReloadUser={callbacks.onReloadUser}
    >
      <Consumer />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  describe('Render', () => {
    it('renders loader while loading', () => {
      renderWithCallbacks(() => <div>content</div>, createCallbacks());

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('content')).not.toBeInTheDocument();
    });

    it('hides loader and renders children after auth state resolves', () => {
      const callbacks = createCallbacks();
      renderWithCallbacks(() => <div>content</div>, callbacks);

      act(() => {
        callbacks.authCallback!({ id: '1', name: 'User', emailVerified: false });
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('provides currentUser after auth state change', () => {
      const callbacks = createCallbacks();

      function Consumer() {
        const { currentUser } = useAuth<TestUser>();
        return <div>{currentUser?.name ?? 'no user'}</div>;
      }

      renderWithCallbacks(Consumer, callbacks);

      act(() => callbacks.authCallback!(null));
      expect(screen.getByText('no user')).toBeInTheDocument();

      act(() => {
        callbacks.authCallback!({ id: '1', name: 'Jane', emailVerified: false });
      });

      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    it('delegates each wrapped method to the corresponding callback', async () => {
      const callbacks = createCallbacks();

      function Consumer() {
        const auth = useAuth<TestUser>();
        return (
          <div>
            <button onClick={() => auth.signIn()}>signIn</button>
            <button onClick={() => auth.signOut()}>signOut</button>
            <button onClick={() => auth.signInWithEmailAndPassword({ email: 'e', password: 'p' })}>
              signInEmail
            </button>
            <button onClick={() => auth.signUp()}>signUp</button>
            <button onClick={() => auth.signUpWithEmailAndPassword({ email: 'e', password: 'p' })}>
              signUpEmail
            </button>
            <button onClick={() => auth.sendPasswordResetEmail('e')}>reset</button>
            <button onClick={() => auth.sendEmailVerification()}>sendVerification</button>
            <button onClick={() => auth.reloadUser()}>reload</button>
          </div>
        );
      }

      renderWithCallbacks(Consumer, callbacks);

      act(() => callbacks.authCallback!(null));

      await act(async () => screen.getByText('signIn').click());
      await act(async () => screen.getByText('signOut').click());
      await act(async () => screen.getByText('signInEmail').click());
      await act(async () => screen.getByText('signUp').click());
      await act(async () => screen.getByText('signUpEmail').click());
      await act(async () => screen.getByText('reset').click());
      await act(async () => screen.getByText('sendVerification').click());
      await act(async () => screen.getByText('reload').click());

      expect(callbacks.onSignIn).toHaveBeenCalledTimes(1);
      expect(callbacks.onSignOut).toHaveBeenCalledTimes(1);
      expect(callbacks.onSignInWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'e',
        password: 'p',
      });
      expect(callbacks.onSignUp).toHaveBeenCalledTimes(1);
      expect(callbacks.onSignUpWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'e',
        password: 'p',
      });
      expect(callbacks.onSendPasswordResetEmail).toHaveBeenCalledWith('e');
      expect(callbacks.onSendEmailVerification).toHaveBeenCalledTimes(1);
      expect(callbacks.onReloadUser).toHaveBeenCalledTimes(1);
    });

    it('updates currentUser with the refreshed user after a successful reloadUser', async () => {
      const callbacks = createCallbacks();

      function Consumer() {
        const { currentUser, reloadUser } = useAuth<TestUser>();
        return (
          <div>
            <div>name: {currentUser?.name ?? 'none'}</div>
            <div>verified: {String(currentUser?.emailVerified ?? false)}</div>
            <button onClick={() => reloadUser()}>reload</button>
          </div>
        );
      }

      renderWithCallbacks(Consumer, callbacks);
      act(() => callbacks.authCallback!({ id: '1', name: 'Stale', emailVerified: false }));

      expect(screen.getByText('name: Stale')).toBeInTheDocument();
      expect(screen.getByText('verified: false')).toBeInTheDocument();

      await act(async () => screen.getByText('reload').click());

      expect(screen.getByText('name: Reloaded')).toBeInTheDocument();
      expect(screen.getByText('verified: true')).toBeInTheDocument();
    });

    it('leaves currentUser unchanged when reloadUser returns Ok(null)', async () => {
      const callbacks = createCallbacks();
      callbacks.onReloadUser.mockResolvedValue(Ok(null));

      function Consumer() {
        const { currentUser, reloadUser } = useAuth<TestUser>();
        return (
          <div>
            <div>name: {currentUser?.name ?? 'none'}</div>
            <button onClick={() => reloadUser()}>reload</button>
          </div>
        );
      }

      renderWithCallbacks(Consumer, callbacks);
      act(() => callbacks.authCallback!({ id: '1', name: 'Kept', emailVerified: false }));

      await act(async () => screen.getByText('reload').click());

      expect(screen.getByText('name: Kept')).toBeInTheDocument();
    });

    it('leaves currentUser unchanged when reloadUser fails', async () => {
      const callbacks = createCallbacks();
      callbacks.onReloadUser.mockResolvedValue(Fail(new ReloadUserFailure('nope')));

      function Consumer() {
        const { currentUser, reloadUser } = useAuth<TestUser>();
        return (
          <div>
            <div>name: {currentUser?.name ?? 'none'}</div>
            <button onClick={() => reloadUser()}>reload</button>
          </div>
        );
      }

      renderWithCallbacks(Consumer, callbacks);
      act(() => callbacks.authCallback!({ id: '1', name: 'Stable', emailVerified: false }));

      await act(async () => screen.getByText('reload').click());

      expect(screen.getByText('name: Stable')).toBeInTheDocument();
    });

    it('toggles loading around each wrapped call', async () => {
      const callbacks = createCallbacks();
      callbacks.onSignIn.mockImplementation(async () => Fail(new SignInFailure('nope')));

      function Consumer() {
        const { loading, signIn } = useAuth<TestUser>();
        return (
          <div>
            <button onClick={() => signIn()}>signIn</button>
            <div>loading: {String(loading)}</div>
          </div>
        );
      }

      renderWithCallbacks(Consumer, callbacks);

      act(() => callbacks.authCallback!(null));
      expect(screen.getByText('loading: false')).toBeInTheDocument();

      await act(async () => screen.getByText('signIn').click());

      expect(screen.getByText('loading: false')).toBeInTheDocument();
    });

    it('uses the latest callback refs without re-subscribing', async () => {
      const callbacks = createCallbacks();

      function Consumer() {
        const { signIn } = useAuth<TestUser>();
        return <button onClick={() => signIn()}>signIn</button>;
      }

      const { rerender } = renderWithCallbacks(Consumer, callbacks);
      act(() => callbacks.authCallback!(null));

      const newSignIn = vi
        .fn<AuthMethods<TestUser>['signIn']>()
        .mockResolvedValue(Ok({ id: '2', name: 'Renewed', emailVerified: false }));
      rerender(
        <AuthProvider<TestUser>
          loader={TestLoader}
          onAuthChanged={callbacks.onAuthChanged}
          onSignIn={newSignIn}
          onSignOut={callbacks.onSignOut}
          onSignInWithEmailAndPassword={callbacks.onSignInWithEmailAndPassword}
          onSignUp={callbacks.onSignUp}
          onSignUpWithEmailAndPassword={callbacks.onSignUpWithEmailAndPassword}
          onSendPasswordResetEmail={callbacks.onSendPasswordResetEmail}
          onSendEmailVerification={callbacks.onSendEmailVerification}
          onReloadUser={callbacks.onReloadUser}
        >
          <Consumer />
        </AuthProvider>,
      );

      await act(async () => screen.getByText('signIn').click());

      expect(newSignIn).toHaveBeenCalledTimes(1);
      expect(callbacks.onSignIn).not.toHaveBeenCalled();
      expect(callbacks.unsubscribe).not.toHaveBeenCalled();
    });

    it('unsubscribes from auth state changes on unmount', () => {
      const callbacks = createCallbacks();
      const { unmount } = renderWithCallbacks(() => <div>content</div>, callbacks);

      unmount();

      expect(callbacks.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('throws when useAuth called outside provider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      function Consumer() {
        useAuth<TestUser>();
        return null;
      }

      expect(() => render(<Consumer />)).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('failures', () => {
  it('SignInFailure stores the underlying error', () => {
    const error = new Error('boom');
    expect(new SignInFailure(error).error).toBe(error);
  });

  it('SignUpFailure stores the underlying error', () => {
    const error = new Error('boom');
    expect(new SignUpFailure(error).error).toBe(error);
  });

  it('PasswordResetEmailFailure stores the underlying error', () => {
    const error = new Error('boom');
    expect(new PasswordResetEmailFailure(error).error).toBe(error);
  });

  it('EmailVerificationFailure stores the underlying error', () => {
    const error = new Error('boom');
    expect(new EmailVerificationFailure(error).error).toBe(error);
  });

  it('ReloadUserFailure stores the underlying error', () => {
    const error = new Error('boom');
    expect(new ReloadUserFailure(error).error).toBe(error);
  });
});
