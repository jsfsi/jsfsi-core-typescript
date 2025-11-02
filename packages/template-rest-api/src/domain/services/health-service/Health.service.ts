import { Injectable } from '@nestjs/common';

import { HealthCheck } from '../../models/HealthCheck.model';
import { User } from '../../models/User.model';

@Injectable()
export class HealthService {
  async check(user?: User): Promise<HealthCheck> {
    return { status: 'OK', version: 'latest', user };
  }
}
