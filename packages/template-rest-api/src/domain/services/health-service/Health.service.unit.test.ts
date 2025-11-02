import { mock } from '@jsfsi-core/ts-crossplatform';
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { INestApplication } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../../app/app.module';
import { User } from '../../models/User.model';

import { HealthService } from './Health.service';

describe('HealthService', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestingApp(AppModule, {
      logger: new MockLogger(),
    });
  });

  it('returns the health status without user', async () => {
    const healthService = app.get(HealthService);

    const health = await healthService.check();

    expect(health).toEqual({
      status: 'OK',
      version: 'latest',
    });
  });

  it('returns the health status with user', async () => {
    const healthService = app.get(HealthService);

    const health = await healthService.check(
      mock<User>({ id: 'some-user-id', email: 'some-user-email' }),
    );

    expect(health).toEqual({
      status: 'OK',
      version: 'latest',
      user: {
        id: 'some-user-id',
        email: 'some-user-email',
      },
    });
  });
});
