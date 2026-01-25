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
