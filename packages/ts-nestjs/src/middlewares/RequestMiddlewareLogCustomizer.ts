import { Request, Response } from 'express';

export const REQUEST_MIDDLEWARE_LOG_CUSTOMIZER = 'REQUEST_MIDDLEWARE_LOG_CUSTOMIZER';

export interface RequestMiddlewareLogCustomizer {
  buildLogPayload(req: Request, res: Response): Record<string, unknown>;
}
