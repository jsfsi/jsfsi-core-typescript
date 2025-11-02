import { Result } from '@jsfsi-core/ts-crossplatform';
import { Injectable } from '@nestjs/common';

import { AuthorizationAdapter } from '../../../adapters/authorization-adapter/AuthorizationAdapter';
import { UnableToValidateUserFailure } from '../../models/UnableToValidateUserFailure';
import { User } from '../../models/User.model';
import { UserAuthorizationExpiredFailure } from '../../models/UserAuthorizationExpiredFailure';
@Injectable()
export class UserService {
  constructor(private readonly authorizationAdapter: AuthorizationAdapter) {}

  public async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<
    Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>
  > {
    return this.authorizationAdapter.decodeUser({ rawAuthorization });
  }

  public async getUserRoles(_: User): Promise<string[]> {
    return ['admin'];
  }
}
