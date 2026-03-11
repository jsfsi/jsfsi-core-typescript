import { RequestMiddlewareLogCustomizer } from '@jsfsi-core/ts-nestjs';
import { Request, Response } from 'express';

import { User } from '../../domain/models/User.model';

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
