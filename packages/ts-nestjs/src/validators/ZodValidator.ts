import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ZodType } from 'zod';

export function ZodValidator<T>(schema: ZodType<T>, source: 'body' | 'query' | 'params' = 'body') {
  return createParamDecorator((_: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest();
    const dataSource = request[source];

    const parsedData = schema.safeParse(dataSource);

    if (!parsedData.success) {
      throw new BadRequestException({
        message: `Invalid ${source} data`,
        errors: parsedData.error,
      });
    }

    return parsedData.data;
  })();
}

export function SafeQuery<T>(schema: ZodType<T>) {
  return ZodValidator(schema, 'query');
}

export function SafeBody<T>(schema: ZodType<T>) {
  return ZodValidator(schema, 'body');
}

export function SafeParams<T>(schema: ZodType<T>) {
  return ZodValidator(schema, 'params');
}

/* v8 ignore start */
export function SafeRawBody() {
  return createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // In NestJS with rawBody: true, the raw body is stored in req.rawBody as a Buffer
    // Check multiple possible locations where the raw body might be stored
    const rawBody = request.rawBody || request.body?.rawBody || request._rawBody;

    if (rawBody === undefined || rawBody === null) {
      // If raw body is not available, try to reconstruct from the parsed body
      // This is a fallback for when rawBody option might not be working as expected
      const parsedBody = request.body;
      if (parsedBody && typeof parsedBody === 'object') {
        return JSON.stringify(parsedBody);
      }
      return '';
    }

    if (Buffer.isBuffer(rawBody)) {
      return rawBody.toString('utf8');
    }

    return String(rawBody);
  })();
}
