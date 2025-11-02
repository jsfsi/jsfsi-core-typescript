import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { UserService } from '../../domain/services/user-service/UserService';

export type HandlerFunction = (...args: unknown[]) => unknown;

const rolesMap = new WeakMap<HandlerFunction, string[]>();

export function getRequiredRoles(handler: HandlerFunction): string[] | undefined {
  return rolesMap.get(handler);
}

export function setRequiredRoles(handler: HandlerFunction, roles: string[]): void {
  rolesMap.set(handler, roles);
}

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler() as HandlerFunction;
    const requiredRoles = getRequiredRoles(handler);

    if (!requiredRoles) {
      return true;
    }

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!requiredRoles.length) {
      return true;
    }

    const userRoles = await this.userService.getUserRoles(user);

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient roles');
    }

    return true;
  }
}
