import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { UserAuthorizationExpiredFailure } from '../../domain/models/UserAuthorizationExpiredFailure';
// biome-ignore lint/style/useImportType: NestJS DI needs runtime class reference
import { UserService } from '../../domain/services/user-service/UserService';

/* v8 ignore start -- @preserve */
@Injectable()
export class UserGuard implements CanActivate {
  /* v8 ignore stop -- @preserve */
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO: needs to be abstracted using domain and adapters pattern
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const [user, failure] = await this.userService.decodeUser({
      rawAuthorization: authHeader,
    });

    if (isFailure(UserAuthorizationExpiredFailure)(failure)) {
      throw new UnauthorizedException(failure.name);
    }

    request.user = user;

    return true; // Always allow to proceed
  }
}
