import { Controller, Get, UseGuards } from '@nestjs/common';

import { User } from '../../../domain/models/User.model';
import { HealthService } from '../../../domain/services/health-service/Health.service';
import { Authorize } from '../../decorators/authorize.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { GlobalRateLimitGuard } from '../../guards/global-rate-limit.guard';

import { HealthResponse } from './models/health-response.model';

@Controller('health')
export class HealthController {
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
