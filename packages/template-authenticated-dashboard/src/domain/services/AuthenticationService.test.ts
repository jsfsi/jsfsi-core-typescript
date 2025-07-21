import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthenticationAdapter } from '../../adapters/AuthenticationAdapter/AuthenticationAdapter';
import { SignInFailure } from '../../domain/models/SignInFailure';
import { User } from '../../domain/models/User';
import { PasswordResetEmailFailure } from '../models/PasswordResetEmailFailure';
import { SignUpFailure } from '../models/SignUpFailure';

import { AuthenticationService, OnAuthStateChangedCallback } from './AuthenticationService';

describe('AuthenticationService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('signOut', () => {
    it('calls authentication adapter signOut()', () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signOut: vi.fn(),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      authenticationService.signOut();

      expect(authenticationAdapterMock.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn', () => {
    it('calls authentication adapter signIn()', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signIn: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signIn();

      expect(authenticationAdapterMock.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(undefined));
    });

    it('returns a sign in failure if authentication adapter signIn() fails', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signIn: vi.fn().mockResolvedValue(Fail(new SignInFailure(new Error('Sign in failed')))),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signIn();

      expect(result).toEqual(Fail(new SignInFailure(new Error('Sign in failed'))));
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('calls authentication adapter signInWithEmailAndPassword()', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signInWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(authenticationAdapterMock.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(authenticationAdapterMock.signInWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toEqual(Ok(undefined));
    });

    it('returns a sign in failure if authentication adapter signInWithEmailAndPassword() fails', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signInWithEmailAndPassword: vi
          .fn()
          .mockResolvedValue(Fail(new SignInFailure(new Error('Sign in failed')))),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toEqual(Fail(new SignInFailure(new Error('Sign in failed'))));
    });
  });

  describe('onAuthStateChanged', () => {
    it.each([null, mock<User>()])('callbacks user on change %s', (user) => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        onAuthStateChanged: (callback: OnAuthStateChangedCallback) => {
          callback(user);
        },
      });

      let resultUser: User | null;

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      authenticationService.onAuthStateChanged((user) => {
        resultUser = user;
      });

      expect(resultUser!).toEqual(user);
    });
  });

  describe('signUpWithEmailAndPassword', () => {
    it('calls authentication adapter signUpWithEmailAndPassword()', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signUpWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      await authenticationService.signUpWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(authenticationAdapterMock.signUpWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(authenticationAdapterMock.signUpWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('returns a sign up failure if authentication adapter signUpWithEmailAndPassword() fails', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signUpWithEmailAndPassword: vi
          .fn()
          .mockResolvedValue(Fail(new SignUpFailure('Sign up failed'))),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signUpWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toEqual(Fail(new SignUpFailure('Sign up failed')));
    });
  });

  describe('signUp', () => {
    it('calls authentication adapter signUp()', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signIn: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      await authenticationService.signUp();

      expect(authenticationAdapterMock.signIn).toHaveBeenCalledTimes(1);
      expect(authenticationAdapterMock.signIn).toHaveBeenCalledWith();
    });

    it('returns a sign up failure if authentication adapter signUp() fails', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        signIn: vi.fn().mockResolvedValue(Fail(new SignUpFailure('Sign up failed'))),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.signUp();

      expect(result).toEqual(Fail(new SignUpFailure('Sign up failed')));
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('calls authentication adapter sendPasswordResetEmail()', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        sendPasswordResetEmail: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      await authenticationService.sendPasswordResetEmail('test@test.com');

      expect(authenticationAdapterMock.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(authenticationAdapterMock.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });

    it('returns a failure if authentication adapter sendPasswordResetEmail() fails', async () => {
      const authenticationAdapterMock = mock<AuthenticationAdapter>({
        sendPasswordResetEmail: vi
          .fn()
          .mockResolvedValue(
            Fail(new PasswordResetEmailFailure('Failed to send password reset email')),
          ),
      });

      const authenticationService = new AuthenticationService(authenticationAdapterMock);
      const result = await authenticationService.sendPasswordResetEmail('test@test.com');

      expect(result).toEqual(
        Fail(new PasswordResetEmailFailure('Failed to send password reset email')),
      );
    });
  });
});
