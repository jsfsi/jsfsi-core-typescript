import { CustomLogger } from '@jsfsi-core/ts-nestjs';
import { Injectable } from '@nestjs/common';

import { HealthCheck } from '../../models/HealthCheck.model';
import { User } from '../../models/User.model';

@Injectable()
export class HealthService {
  private readonly logger = new CustomLogger(HealthService.name);

  async check(user?: User): Promise<HealthCheck> {
    this.logger.log('Checking health');

    return { status: 'OK', version: 'latest', user };
  }
}
