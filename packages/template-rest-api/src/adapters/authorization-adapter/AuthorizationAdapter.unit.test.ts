import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { INestApplication, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthError } from 'firebase-admin/lib/utils/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../../app/app.module';
import { UnableToValidateUserFailure } from '../../domain/models/UnableToValidateUserFailure';
import { UserAuthorizationExpiredFailure } from '../../domain/models/UserAuthorizationExpiredFailure';

import { AuthorizationAdapter } from './AuthorizationAdapter';

describe('AuthorizationAdapter', () => {
  let mockLogger: MockLogger;
  let app: INestApplication;

  beforeEach(async () => {
    mockLogger = new MockLogger();
    Logger.overrideLogger(mockLogger);

    app = await createTestingApp(AppModule, {
      logger: mockLogger,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns decoded user', async () => {
    const authorizationAdapter = app.get(AuthorizationAdapter);

    const decodedUser = await authorizationAdapter.decodeUser({
      rawAuthorization: 'Bearer some-raw-authorization',
    });

    expect(decodedUser).toEqual(Ok({ id: 'some-user-id', email: 'some-user-email' }));
  });

  it('returns error when authorization header is invalid', async () => {
    const warnSpy = vi.spyOn(mockLogger, 'warn');

    const authorizationAdapter = app.get(AuthorizationAdapter);

    const decodedUser = await authorizationAdapter.decodeUser({
      rawAuthorization: 'some-raw-authorization',
    });

    expect(decodedUser).toEqual(Fail(new UnableToValidateUserFailure()));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Invalid authorization header',
      {
        rawAuthorization: 'some-raw-authorization',
      },
      AuthorizationAdapter.name,
    );
  });

  it('returns undefined when authorization header is not provided', async () => {
    const warnSpy = vi.spyOn(mockLogger, 'warn');

    const authorizationAdapter = app.get(AuthorizationAdapter);

    const decodedUser = await authorizationAdapter.decodeUser({});

    expect(decodedUser).toEqual(Ok(undefined));
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns error when firebase token is invalid', async () => {
    const errorMock = new Error('some-error');
    vi.spyOn(admin.auth(), 'verifyIdToken').mockRejectedValue(errorMock);

    const warnSpy = vi.spyOn(mockLogger, 'warn');

    const authorizationAdapter = app.get(AuthorizationAdapter);

    const decodedUser = await authorizationAdapter.decodeUser({
      rawAuthorization: 'Bearer some-raw-authorization',
    });

    expect(decodedUser).toEqual(Fail(new UnableToValidateUserFailure(errorMock)));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Unable to decode firebase token',
      errorMock,
      AuthorizationAdapter.name,
    );
  });

  it('returns error when firebase token is expired', async () => {
    const errorMock = mock<FirebaseAuthError>({
      code: 'auth/id-token-expired',
    });
    vi.spyOn(admin.auth(), 'verifyIdToken').mockRejectedValue(errorMock);

    const authorizationAdapter = app.get(AuthorizationAdapter);

    const decodedUser = await authorizationAdapter.decodeUser({
      rawAuthorization: 'Bearer some-raw-authorization',
    });

    expect(decodedUser).toEqual(Fail(new UserAuthorizationExpiredFailure(errorMock)));
  });
});
