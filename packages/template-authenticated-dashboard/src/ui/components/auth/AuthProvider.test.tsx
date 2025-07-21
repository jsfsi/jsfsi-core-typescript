import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../../domain/models/User';
import * as AuthenticationService from '../../../domain/services/AuthenticationService';
import { AppBindings } from '../../app/AppBindings';
import { IoCContextProvider } from '../ioc/IoCContextProvider';

import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthProvider';

function MockComponent() {
  const { currentUser, signIn, signOut, loading, signUp, signUpWithEmailAndPassword } = useAuth();

  return (
    <div>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={signUp}>Sign Up</button>
      <button
        onClick={() =>
          signUpWithEmailAndPassword({ email: 'test@example.com', password: 'password' })
        }
      >
        Sign Up With Email And Password
      </button>
      <div>{`isLoading: ${loading}`}</div>
      <div>{`currentUser: ${currentUser?.email}`}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    const { getByText } = render(
      <IoCContextProvider bindings={AppBindings}>
        <AuthProvider>
          <MockComponent />
        </AuthProvider>
      </IoCContextProvider>,
    );

    expect(getByText('isLoading: false')).toBeInTheDocument();
    expect(getByText('currentUser: undefined')).toBeInTheDocument();
  });

  describe('behavior', () => {
    it('should sign in with authentication service', async () => {
      const signInSpy = vi
        .spyOn(AuthenticationService.AuthenticationService.prototype, 'signIn')
        .mockResolvedValue(Ok(mock<User>()));

      const { getByText } = render(
        <IoCContextProvider bindings={AppBindings}>
          <AuthProvider>
            <MockComponent />
          </AuthProvider>
        </IoCContextProvider>,
      );

      await act(async () => {
        fireEvent.click(getByText('Sign In'));
      });

      expect(signInSpy).toHaveBeenCalledTimes(1);
      expect(signInSpy).toHaveBeenCalledWith();
    });

    it('should sign out with authentication service', async () => {
      const signOutSpy = vi
        .spyOn(AuthenticationService.AuthenticationService.prototype, 'signOut')
        .mockResolvedValue(undefined);

      const { getByText } = render(
        <IoCContextProvider bindings={AppBindings}>
          <AuthProvider>
            <MockComponent />
          </AuthProvider>
        </IoCContextProvider>,
      );

      fireEvent.click(getByText('Sign Out'));

      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(signOutSpy).toHaveBeenCalledWith();
    });

    it('should sign up with authentication service', async () => {
      const signUpSpy = vi
        .spyOn(AuthenticationService.AuthenticationService.prototype, 'signUp')
        .mockResolvedValue(Ok(mock<User>()));

      const { getByText } = render(
        <IoCContextProvider bindings={AppBindings}>
          <AuthProvider>
            <MockComponent />
          </AuthProvider>
        </IoCContextProvider>,
      );

      await act(async () => {
        fireEvent.click(getByText('Sign Up'));
      });

      expect(signUpSpy).toHaveBeenCalledTimes(1);
      expect(signUpSpy).toHaveBeenCalledWith();
    });

    it('should sign up with email and password with authentication service', async () => {
      const signUpWithEmailAndPasswordSpy = vi
        .spyOn(AuthenticationService.AuthenticationService.prototype, 'signUpWithEmailAndPassword')
        .mockResolvedValue(Ok(mock<User>()));

      const { getByText } = render(
        <IoCContextProvider bindings={AppBindings}>
          <AuthProvider>
            <MockComponent />
          </AuthProvider>
        </IoCContextProvider>,
      );

      await act(async () => {
        fireEvent.click(getByText('Sign Up With Email And Password'));
      });

      expect(signUpWithEmailAndPasswordSpy).toHaveBeenCalledTimes(1);
      expect(signUpWithEmailAndPasswordSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });
});
