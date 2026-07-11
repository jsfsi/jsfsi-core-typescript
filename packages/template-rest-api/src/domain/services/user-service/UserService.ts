import type { Result } from '@jsfsi-core/ts-crossplatform';
import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: NestJS DI needs runtime class reference
import { AuthorizationAdapter } from '../../../adapters/authorization-adapter/AuthorizationAdapter';
import type { UnableToValidateUserFailure } from '../../models/UnableToValidateUserFailure';
import type { User } from '../../models/User.model';
import type { UserAuthorizationExpiredFailure } from '../../models/UserAuthorizationExpiredFailure';
/* v8 ignore start -- @preserve */
@Injectable()
export class UserService {
  /* v8 ignore stop -- @preserve */
  constructor(private readonly authorizationAdapter: AuthorizationAdapter) {}

  public async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>> {
    return this.authorizationAdapter.decodeUser({ rawAuthorization });
  }

  public async getUserRoles(_: User): Promise<string[]> {
    return ['admin'];
  }
}
