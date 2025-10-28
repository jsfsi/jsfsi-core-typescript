import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private mapStatusCode(error: unknown) {
    return error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapError(error: unknown): unknown {
    return error instanceof HttpException ? error.getResponse() : { error: 'internal-error' };
  }

  catch(error: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    this.logger.error('Unhandled exception', error);

    const httpStatus = this.mapStatusCode(error);

    const responseBody = this.mapError(error);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
