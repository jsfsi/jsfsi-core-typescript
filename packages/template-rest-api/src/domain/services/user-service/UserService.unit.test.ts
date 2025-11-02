import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthorizationAdapter } from '../../../adapters/authorization-adapter/AuthorizationAdapter';
import { AppModule } from '../../../app/app.module';
import { User } from '../../models/User.model';

import { UserService } from './UserService';

describe('UserService', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestingApp(AppModule, {
      logger: new MockLogger(),
      providers: [
        {
          type: AuthorizationAdapter,
          value: mock<AuthorizationAdapter>({
            decodeUser: vi
              .fn()
              .mockResolvedValue(Ok(mock<User>({ id: 'some-user-id', email: 'some-user-email' }))),
          }),
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#decodeUser', () => {
    it.each([undefined, mock<User>({ id: 'some-user-id', email: 'some-user-email' })])(
      'returns user %s from the request',
      async (user: User) => {
        const authorizationAdapter = app.get(AuthorizationAdapter);

        const decodeUserSpy = vi
          .spyOn(authorizationAdapter, 'decodeUser')
          .mockResolvedValue(Ok(user));

        const userService = app.get(UserService);

        const decodedUser = await userService.decodeUser({
          rawAuthorization: 'some-raw-authorization',
        });

        expect(decodedUser).toEqual(Ok(user));
        expect(decodeUserSpy).toHaveBeenCalledTimes(1);
        expect(decodeUserSpy).toHaveBeenCalledWith({
          rawAuthorization: 'some-raw-authorization',
        });
      },
    );
  });

  describe('#getUserRoles', () => {
    it('returns the user roles', async () => {
      const userService = app.get(UserService);

      const userRoles = await userService.getUserRoles(mock<User>());

      expect(userRoles).toEqual(['admin']);
    });
  });
});
