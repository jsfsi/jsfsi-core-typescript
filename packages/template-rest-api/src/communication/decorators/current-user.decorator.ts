import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { User } from '../../domain/models/User.model';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): User | undefined => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
