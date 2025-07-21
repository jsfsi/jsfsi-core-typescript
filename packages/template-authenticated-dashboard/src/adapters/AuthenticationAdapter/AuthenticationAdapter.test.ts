import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PasswordResetEmailFailure } from '../../domain/models/PasswordResetEmailFailure';
import { SignInFailure } from '../../domain/models/SignInFailure';
import { SignUpFailure } from '../../domain/models/SignUpFailure';
import { FirebaseClient } from '../FirebaseClient/FirebaseClient';

import { AuthenticationAdapter } from './AuthenticationAdapter';

describe('AuthenticationAdapter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signOut', () => {
    it('calls firebase client signOut()', () => {
      const firebaseClientMock = mock<FirebaseClient>({
        signOut: vi.fn(),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      authAdapter.signOut();

      expect(firebaseClientMock.signOut).toHaveBeenCalledTimes(1);
      expect(firebaseClientMock.signOut).toHaveBeenCalledWith();
    });
  });

  describe('signIn', () => {
    it('calls firebase client signIn()', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        signInWithGoogle: vi
          .fn()
          .mockResolvedValue(
            Ok({ providerId: 'mock-provider-id', email: 'mock-email', idToken: 'mock-id-token' }),
          ),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.signIn();

      expect(firebaseClientMock.signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        Ok({ providerId: 'mock-provider-id', email: 'mock-email', idToken: 'mock-id-token' }),
      );
    });

    it('returns a sign in failure if firebase client signIn() fails', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        signInWithGoogle: vi.fn().mockResolvedValue(Fail(new SignInFailure('Sign in failed'))),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.signIn();

      expect(firebaseClientMock.signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Fail(new SignInFailure('Sign in failed')));
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('calls firebase client signInWithEmailAndPassword()', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        signInWithEmailAndPassword: vi
          .fn()
          .mockResolvedValue(
            Ok({ providerId: 'mock-provider-id', email: 'mock-email', idToken: 'mock-id-token' }),
          ),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebaseClientMock.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebaseClientMock.signInWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toEqual(
        Ok({ providerId: 'mock-provider-id', email: 'mock-email', idToken: 'mock-id-token' }),
      );
    });

    it('returns a sign in failure if firebase client signInWithEmailAndPassword() fails', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        signInWithEmailAndPassword: vi
          .fn()
          .mockResolvedValue(Fail(new SignInFailure('Sign in failed'))),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebaseClientMock.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Fail(new SignInFailure('Sign in failed')));
    });
  });

  describe('signUpWithEmailAndPassword', () => {
    it('calls firebase client signUpWithEmailAndPassword()', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        createUserWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      await authAdapter.signUpWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebaseClientMock.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebaseClientMock.createUserWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('returns a sign up failure if firebase client createUserWithEmailAndPassword() fails', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        createUserWithEmailAndPassword: vi
          .fn()
          .mockResolvedValue(Fail(new SignUpFailure('Sign up failed'))),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.signUpWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toEqual(Fail(new SignUpFailure('Sign up failed')));
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('calls firebase client sendPasswordResetEmail()', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        sendPasswordResetEmail: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      await authAdapter.sendPasswordResetEmail('test@test.com');

      expect(firebaseClientMock.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(firebaseClientMock.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('returns a failure if firebase client sendPasswordResetEmail() fails', async () => {
      const firebaseClientMock = mock<FirebaseClient>({
        sendPasswordResetEmail: vi
          .fn()
          .mockResolvedValue(
            Fail(new PasswordResetEmailFailure('Failed to send password reset email')),
          ),
      });

      const authAdapter = new AuthenticationAdapter(firebaseClientMock);
      const result = await authAdapter.sendPasswordResetEmail('test@test.com');

      expect(result).toEqual(
        Fail(new PasswordResetEmailFailure('Failed to send password reset email')),
      );
    });
  });
});
