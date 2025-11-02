import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private mapStatusCode(error: object) {
    return 'getStatus' in error && typeof error.getStatus === 'function'
      ? error.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapError(error: object): unknown {
    return 'getResponse' in error && typeof error.getResponse === 'function'
      ? error.getResponse()
      : { error: 'internal-error' };
  }

  catch(error: object, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    this.logger.error('Unhandled exception', error);

    const httpStatus = this.mapStatusCode(error);

    const responseBody = this.mapError(error);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
