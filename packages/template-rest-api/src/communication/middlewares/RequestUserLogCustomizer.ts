import type { RequestMiddlewareLogCustomizer } from '@jsfsi-core/ts-nestjs';
import type { Request, Response } from 'express';

import type { User } from '../../domain/models/User.model';

type AuthenticatedRequest = {
  user?: User;
} & Request;

export class RequestUserLogCustomizer implements RequestMiddlewareLogCustomizer {
  buildLogPayload(req: AuthenticatedRequest, _res: Response): Record<string, unknown> {
    return {
      userId: req.user?.id,
    };
  }
}
