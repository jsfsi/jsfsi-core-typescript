import { LogLevel } from '@jsfsi-core-core/ts-nodejs';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const MAP_STATUS_CODE_TO_SEVERITY: Record<string, LogLevel> = {
  '2XX': 'verbose',
  '3XX': 'debug',
  '400': 'log',
  '401': 'log',
  '403': 'log',
  '404': 'log',
  '4XX': 'warn',
  '5XX': 'error',
};

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestMiddleware.name);

  private statusCodeToSeverity(statusCode: number): LogLevel {
    const statusCodeString = statusCode.toString();

    if (MAP_STATUS_CODE_TO_SEVERITY[statusCodeString]) {
      return MAP_STATUS_CODE_TO_SEVERITY[statusCodeString];
    }

    return MAP_STATUS_CODE_TO_SEVERITY[`${statusCode.toString().slice(0, 1)}XX`];
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Dont log requests for inner requests
    if (req.headers['host'] !== '127.0.0.1') {
      const startTime = Date.now();

      res.on('finish', () => {
        const timeSpent = Date.now() - startTime;

        const log = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          timeSpentMs: timeSpent,
          domain: req.hostname,
          requestHeaders: req.headers,
          responseHeaders: res.getHeaders(),
        };

        const severity = this.statusCodeToSeverity(res.statusCode);

        this.logger[severity](`Request: ${req.method} ${req.originalUrl} ${res.statusCode}`, log);
      });
    }

    next();
  }
}
