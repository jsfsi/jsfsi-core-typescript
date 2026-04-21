import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthenticationAdapter, type AuthClient } from './AuthenticationAdapter';
import { EmailVerificationFailure } from './EmailVerificationFailure';
import { PasswordResetEmailFailure } from './PasswordResetEmailFailure';
import { ReloadUserFailure } from './ReloadUserFailure';
import { SignInFailure } from './SignInFailure';
import { SignUpFailure } from './SignUpFailure';
import { type User } from './User';

const testUser: User = {
  id: 'mock-id',
  providerId: 'mock-provider',
  email: 'mock@test.com',
  name: 'mock',
  avatar: null,
  idToken: 'mock-token',
  emailVerified: true,
};

describe('AuthenticationAdapter', () => {
  afterEach(() => vi.clearAllMocks());

  describe('onAuthStateChanged', () => {
    it('delegates to the client', () => {
      const unsubscribe = vi.fn();
      const callback = vi.fn();
      const client = mock<AuthClient<User>>({
        onAuthStateChanged: vi.fn().mockReturnValue(unsubscribe),
      });

      const result = new AuthenticationAdapter(client).onAuthStateChanged(callback);

      expect(client.onAuthStateChanged).toHaveBeenCalledWith(callback);
      expect(result).toBe(unsubscribe);
    });
  });

  describe('signOut', () => {
    it('delegates to the client', async () => {
      const client = mock<AuthClient<User>>({ signOut: vi.fn() });

      await new AuthenticationAdapter(client).signOut();

      expect(client.signOut).toHaveBeenCalledTimes(1);
      expect(client.signOut).toHaveBeenCalledWith();
    });
  });

  describe('signIn', () => {
    it('returns the user from client.signInWithGoogle', async () => {
      const client = mock<AuthClient<User>>({
        signInWithGoogle: vi.fn().mockResolvedValue(Ok(testUser)),
      });

      const result = await new AuthenticationAdapter(client).signIn();

      expect(client.signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(testUser));
    });

    it('returns a sign in failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        signInWithGoogle: vi.fn().mockResolvedValue(Fail(new SignInFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).signIn();

      expect(result).toEqual(Fail(new SignInFailure('nope')));
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('delegates credentials to the client', async () => {
      const client = mock<AuthClient<User>>({
        signInWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
      });
      const credentials = { email: 'a@b.c', password: 'p' };

      const result = await new AuthenticationAdapter(client).signInWithEmailAndPassword(
        credentials,
      );

      expect(client.signInWithEmailAndPassword).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(Ok(testUser));
    });

    it('returns a sign in failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        signInWithEmailAndPassword: vi.fn().mockResolvedValue(Fail(new SignInFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).signInWithEmailAndPassword({
        email: 'a@b.c',
        password: 'p',
      });

      expect(result).toEqual(Fail(new SignInFailure('nope')));
    });
  });

  describe('signUp', () => {
    it('returns the user from client.signInWithGoogle', async () => {
      const client = mock<AuthClient<User>>({
        signInWithGoogle: vi.fn().mockResolvedValue(Ok(testUser)),
      });

      const result = await new AuthenticationAdapter(client).signUp();

      expect(client.signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(testUser));
    });
  });

  describe('signUpWithEmailAndPassword', () => {
    it('delegates credentials to the client', async () => {
      const client = mock<AuthClient<User>>({
        createUserWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
      });
      const credentials = { email: 'a@b.c', password: 'p' };

      const result = await new AuthenticationAdapter(client).signUpWithEmailAndPassword(
        credentials,
      );

      expect(client.createUserWithEmailAndPassword).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(Ok(testUser));
    });

    it('returns a sign up failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        createUserWithEmailAndPassword: vi.fn().mockResolvedValue(Fail(new SignUpFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).signUpWithEmailAndPassword({
        email: 'a@b.c',
        password: 'p',
      });

      expect(result).toEqual(Fail(new SignUpFailure('nope')));
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('delegates email to the client', async () => {
      const client = mock<AuthClient<User>>({
        sendPasswordResetEmail: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      await new AuthenticationAdapter(client).sendPasswordResetEmail('a@b.c');

      expect(client.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.c');
    });

    it('returns a failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        sendPasswordResetEmail: vi
          .fn()
          .mockResolvedValue(Fail(new PasswordResetEmailFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).sendPasswordResetEmail('a@b.c');

      expect(result).toEqual(Fail(new PasswordResetEmailFailure('nope')));
    });
  });

  describe('sendEmailVerification', () => {
    it('delegates to the client', async () => {
      const client = mock<AuthClient<User>>({
        sendEmailVerification: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const result = await new AuthenticationAdapter(client).sendEmailVerification();

      expect(client.sendEmailVerification).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(undefined));
    });

    it('returns a failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        sendEmailVerification: vi
          .fn()
          .mockResolvedValue(Fail(new EmailVerificationFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).sendEmailVerification();

      expect(result).toEqual(Fail(new EmailVerificationFailure('nope')));
    });
  });

  describe('reloadUser', () => {
    it('delegates to the client and returns the refreshed user', async () => {
      const client = mock<AuthClient<User>>({
        reloadUser: vi.fn().mockResolvedValue(Ok(testUser)),
      });

      const result = await new AuthenticationAdapter(client).reloadUser();

      expect(client.reloadUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(testUser));
    });

    it('returns a failure when client fails', async () => {
      const client = mock<AuthClient<User>>({
        reloadUser: vi.fn().mockResolvedValue(Fail(new ReloadUserFailure('nope'))),
      });

      const result = await new AuthenticationAdapter(client).reloadUser();

      expect(result).toEqual(Fail(new ReloadUserFailure('nope')));
    });
  });
});
