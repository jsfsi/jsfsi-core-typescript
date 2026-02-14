import { CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

export type InMemoryRateLimitGuardOptions = {
  windowMs: number;
  maxRequests: number;
};

export class InMemoryRateLimitGuard implements CanActivate {
  private readonly requestTimestamps = new Map<string, number[]>();
  private readonly options: InMemoryRateLimitGuardOptions;

  constructor(options: InMemoryRateLimitGuardOptions) {
    if (options.windowMs <= 0 || options.maxRequests <= 0) {
      throw new Error('windowMs and maxRequests must be positive');
    }
    this.options = options;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const ip = this.extractIp(request);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    const timestamps = this.requestTimestamps.get(ip) ?? [];
    const validTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (validTimestamps.length >= this.options.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + this.options.windowMs - now) / 1000);

      response.setHeader('Retry-After', retryAfter);
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    validTimestamps.push(now);
    this.requestTimestamps.set(ip, validTimestamps);

    this.cleanupExpiredEntries(now);

    return true;
  }

  private extractIp(request: {
    ip?: string;
    headers?: Record<string, string | string[] | undefined>;
  }): string {
    const xForwardedFor = request.headers?.['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
      return ips.split(',')[0].trim();
    }

    if (request.ip) {
      return request.ip;
    }

    return 'unknown';
  }

  private cleanupExpiredEntries(now: number): void {
    const windowStart = now - this.options.windowMs;

    for (const [ip, timestamps] of this.requestTimestamps.entries()) {
      const validTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

      if (validTimestamps.length === 0) {
        this.requestTimestamps.delete(ip);
      } else {
        this.requestTimestamps.set(ip, validTimestamps);
      }
    }
  }
}
