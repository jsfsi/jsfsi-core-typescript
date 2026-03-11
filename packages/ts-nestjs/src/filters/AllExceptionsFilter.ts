import { LogLevel } from '@jsfsi-core/ts-nodejs';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

const MAP_STATUS_CODE_TO_SEVERITY: Record<string, LogLevel> = {
  '400': 'log',
  '401': 'log',
  '403': 'log',
  '404': 'log',
  '4XX': 'warn',
  '5XX': 'error',
};

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

  private statusCodeToSeverity(statusCode: number): LogLevel | undefined {
    const statusCodeString = statusCode.toString();

    if (MAP_STATUS_CODE_TO_SEVERITY[statusCodeString]) {
      return MAP_STATUS_CODE_TO_SEVERITY[statusCodeString];
    }

    return MAP_STATUS_CODE_TO_SEVERITY[`${statusCode.toString().slice(0, 1)}XX`];
  }

  catch(error: object, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus = this.mapStatusCode(error);

    const responseBody = this.mapError(error);

    const severity = this.statusCodeToSeverity(httpStatus);

    if (!severity) {
      this.logger.error('Unhandled exception', error);
    }

    if (severity === 'error' || severity === 'warn') {
      this.logger[severity]('Unhandled exception', error);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
