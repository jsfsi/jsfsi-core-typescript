import { isFailure } from '@jsfsi-core/ts-crossplatform';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { UserAuthorizationExpiredFailure } from '../../domain/models/UserAuthorizationExpiredFailure';
import { UserService } from '../../domain/services/user-service/UserService';

@Injectable()
export class UserGuard implements CanActivate {
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
