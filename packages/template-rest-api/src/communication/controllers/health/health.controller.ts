import { Controller, Get, UseGuards } from '@nestjs/common';

import type { User } from '../../../domain/models/User.model';
// biome-ignore lint/style/useImportType: NestJS DI needs runtime class reference
import { HealthService } from '../../../domain/services/health-service/Health.service';
import { Authorize } from '../../decorators/authorize.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { GlobalRateLimitGuard } from '../../guards/global-rate-limit.guard';

import type { HealthResponse } from './models/health-response.model';

/* v8 ignore start -- @preserve */
@Controller('health')
export class HealthController {
  /* v8 ignore stop -- @preserve */
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@CurrentUser() user?: User): Promise<HealthResponse> {
    return this.healthService.check(user);
  }

  @Get('rate-limited-sample')
  @UseGuards(GlobalRateLimitGuard)
  getRateLimitedSample(): { ok: boolean } {
    return { ok: true };
  }

  // TODO: to be removed when there will be real authorized endpoints
  @Get('test-auth')
  @Authorize('admin')
  async testAuth(): Promise<void> {
    return;
  }

  // TODO: to be removed when there will be real authorized endpoints
  @Get('test-auth-no-roles')
  @Authorize()
  async testAuthNoRoles(): Promise<void> {
    return;
  }
}
