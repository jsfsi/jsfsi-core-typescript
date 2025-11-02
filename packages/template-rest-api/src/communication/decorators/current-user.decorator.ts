import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../../domain/models/User.model';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
