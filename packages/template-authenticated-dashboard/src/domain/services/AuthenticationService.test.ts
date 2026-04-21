import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import {
  AuthenticationAdapter,
  EmailVerificationFailure,
  PasswordResetEmailFailure,
  ReloadUserFailure,
  SignInFailure,
  SignUpFailure,
  type User,
} from '@jsfsi-core/ts-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthenticationService } from './AuthenticationService';

const testUser: User = {
  id: 'mock-id',
  providerId: 'mock-provider',
  email: 'mock@test.com',
  name: 'mock',
  avatar: null,
  idToken: 'mock-token',
  emailVerified: true,
};

describe('AuthenticationService', () => {
  afterEach(() => vi.clearAllMocks());

  it('delegates onAuthStateChanged to the adapter', () => {
    const unsubscribe = vi.fn();
    const callback = vi.fn();
    const adapter = mock<AuthenticationAdapter<User>>({
      onAuthStateChanged: vi.fn().mockReturnValue(unsubscribe),
    });

    const result = new AuthenticationService(adapter).onAuthStateChanged(callback);

    expect(adapter.onAuthStateChanged).toHaveBeenCalledWith(callback);
    expect(result).toBe(unsubscribe);
  });

  it('delegates signOut to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({ signOut: vi.fn() });

    await new AuthenticationService(adapter).signOut();

    expect(adapter.signOut).toHaveBeenCalledWith();
  });

  it('delegates signIn to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      signIn: vi.fn().mockResolvedValue(Ok(testUser)),
    });

    const result = await new AuthenticationService(adapter).signIn();

    expect(result).toEqual(Ok(testUser));
  });

  it('delegates signInWithEmailAndPassword to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      signInWithEmailAndPassword: vi.fn().mockResolvedValue(Fail(new SignInFailure('nope'))),
    });
    const credentials = { email: 'a@b.c', password: 'p' };

    const result = await new AuthenticationService(adapter).signInWithEmailAndPassword(credentials);

    expect(adapter.signInWithEmailAndPassword).toHaveBeenCalledWith(credentials);
    expect(result).toEqual(Fail(new SignInFailure('nope')));
  });

  it('delegates signUp to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      signUp: vi.fn().mockResolvedValue(Ok(testUser)),
    });

    const result = await new AuthenticationService(adapter).signUp();

    expect(result).toEqual(Ok(testUser));
  });

  it('delegates signUpWithEmailAndPassword to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      signUpWithEmailAndPassword: vi.fn().mockResolvedValue(Fail(new SignUpFailure('nope'))),
    });
    const credentials = { email: 'a@b.c', password: 'p' };

    const result = await new AuthenticationService(adapter).signUpWithEmailAndPassword(credentials);

    expect(adapter.signUpWithEmailAndPassword).toHaveBeenCalledWith(credentials);
    expect(result).toEqual(Fail(new SignUpFailure('nope')));
  });

  it('delegates sendPasswordResetEmail to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      sendPasswordResetEmail: vi
        .fn()
        .mockResolvedValue(Fail(new PasswordResetEmailFailure('nope'))),
    });

    const result = await new AuthenticationService(adapter).sendPasswordResetEmail('a@b.c');

    expect(adapter.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.c');
    expect(result).toEqual(Fail(new PasswordResetEmailFailure('nope')));
  });

  it('delegates sendEmailVerification to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      sendEmailVerification: vi.fn().mockResolvedValue(Fail(new EmailVerificationFailure('nope'))),
    });

    const result = await new AuthenticationService(adapter).sendEmailVerification();

    expect(adapter.sendEmailVerification).toHaveBeenCalledTimes(1);
    expect(result).toEqual(Fail(new EmailVerificationFailure('nope')));
  });

  it('delegates reloadUser to the adapter', async () => {
    const adapter = mock<AuthenticationAdapter<User>>({
      reloadUser: vi.fn().mockResolvedValue(Fail(new ReloadUserFailure('nope'))),
    });

    const result = await new AuthenticationService(adapter).reloadUser();

    expect(adapter.reloadUser).toHaveBeenCalledTimes(1);
    expect(result).toEqual(Fail(new ReloadUserFailure('nope')));
  });
});
