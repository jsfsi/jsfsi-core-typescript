import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { IoCContextProvider, useAuth, type User } from '@jsfsi-core/ts-react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppBindingsOverrides } from '../../../test/app-bindings-overrides';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

import { AppAuthProvider } from './AppAuthProvider';

const testUser: User = {
  id: '1',
  providerId: 'mock',
  email: 'mock@test.com',
  name: 'mock',
  avatar: null,
  idToken: 'token',
  emailVerified: false,
};

function createAuthServiceMock() {
  let authCallback: ((user: User | null) => void) | null = null;
  const unsubscribe = vi.fn();

  const service = mock<AuthenticationService>({
    onAuthStateChanged: (cb) => {
      authCallback = cb;
      return unsubscribe;
    },
    signIn: vi.fn().mockResolvedValue(Ok(testUser)),
    signOut: vi.fn().mockResolvedValue(undefined),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
    signUp: vi.fn().mockResolvedValue(Ok(testUser)),
    signUpWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(Ok(undefined)),
    sendEmailVerification: vi.fn().mockResolvedValue(Ok(undefined)),
    reloadUser: vi.fn().mockResolvedValue(Ok({ ...testUser, emailVerified: true })),
  });

  return {
    service,
    unsubscribe,
    triggerAuthChange: (user: User | null) => authCallback?.(user),
  };
}

function renderWithService(Consumer: React.ComponentType, service: AuthenticationService) {
  return render(
    <IoCContextProvider
      bindings={AppBindingsOverrides({
        overrides: [{ type: AuthenticationService, instance: service }],
      })}
    >
      <AppAuthProvider>
        <Consumer />
      </AppAuthProvider>
    </IoCContextProvider>,
  );
}

describe('AppAuthProvider', () => {
  afterEach(() => vi.clearAllMocks());

  it('forwards every auth method call to the injected AuthenticationService', async () => {
    const { service, triggerAuthChange } = createAuthServiceMock();

    function Consumer() {
      const auth = useAuth<User>();
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

    renderWithService(Consumer, service);
    act(() => triggerAuthChange(null));

    await act(async () => screen.getByText('signIn').click());
    await act(async () => screen.getByText('signOut').click());
    await act(async () => screen.getByText('signInEmail').click());
    await act(async () => screen.getByText('signUp').click());
    await act(async () => screen.getByText('signUpEmail').click());
    await act(async () => screen.getByText('reset').click());
    await act(async () => screen.getByText('sendVerification').click());
    await act(async () => screen.getByText('reload').click());

    expect(service.signIn).toHaveBeenCalledTimes(1);
    expect(service.signOut).toHaveBeenCalledTimes(1);
    expect(service.signInWithEmailAndPassword).toHaveBeenCalledWith({ email: 'e', password: 'p' });
    expect(service.signUp).toHaveBeenCalledTimes(1);
    expect(service.signUpWithEmailAndPassword).toHaveBeenCalledWith({ email: 'e', password: 'p' });
    expect(service.sendPasswordResetEmail).toHaveBeenCalledWith('e');
    expect(service.sendEmailVerification).toHaveBeenCalledTimes(1);
    expect(service.reloadUser).toHaveBeenCalledTimes(1);
  });
});
