import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthorizeGuard, HandlerFunction, setRequiredRoles } from '../guards/authorize.guard';
import { UserGuard } from '../guards/user.guard';

export function Authorize(...roles: string[]) {
  return applyDecorators(
    (target: unknown, _?: string, descriptor?: PropertyDescriptor) => {
      /* v8 ignore next -- @preserve */
      const handler = (descriptor?.value || target) as HandlerFunction;
      setRequiredRoles(handler, roles);
    },
    UseGuards(UserGuard, AuthorizeGuard),
  );
}
