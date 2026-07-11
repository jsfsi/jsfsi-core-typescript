import { InMemoryRateLimitGuard } from '@jsfsi-core/ts-nestjs';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI needs runtime class reference
import { ConfigService } from '@nestjs/config';

import { RATE_LIMIT_CONFIG_TOKEN, type RateLimitConfig } from '../../app/rate-limit-configuration.service';

@Injectable()
export class GlobalRateLimitGuard extends InMemoryRateLimitGuard {
  constructor(configService: ConfigService) {
    const config = configService.get<RateLimitConfig>(RATE_LIMIT_CONFIG_TOKEN);
    if (!config) {
      throw new Error(`Configuration with token ${RATE_LIMIT_CONFIG_TOKEN} not found`);
    }
    super({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
    });
  }
}
