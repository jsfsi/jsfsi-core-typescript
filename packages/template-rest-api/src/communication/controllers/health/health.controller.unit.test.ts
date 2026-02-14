import { Fail, mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { createTestingApp } from '@jsfsi-core/ts-nestjs';
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../../../app/app.module';
import {
  RATE_LIMIT_CONFIG_TOKEN,
  RateLimitConfig,
} from '../../../app/rate-limit-configuration.service';
import { HealthCheck } from '../../../domain/models/HealthCheck.model';
import { User } from '../../../domain/models/User.model';
import { UserAuthorizationExpiredFailure } from '../../../domain/models/UserAuthorizationExpiredFailure';
import { HealthService } from '../../../domain/services/health-service/Health.service';
import { UserService } from '../../../domain/services/user-service/UserService';

describe('HealthController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestingApp(AppModule, {
      logger: new MockLogger(),
      providers: [
        {
          type: HealthService,
          value: mock<HealthService>({
            check: vi.fn().mockResolvedValue(
              mock<HealthCheck>({
                status: 'OK',
                version: '1.0.0',
                user: {
                  id: 'some-user-id',
                  email: 'some-user-email',
                },
              }),
            ),
          }),
        },
        {
          type: UserService,
          value: mock<UserService>({
            decodeUser: vi
              .fn()
              .mockResolvedValue(Ok(mock<User>({ id: 'some-user-id', email: 'some-user-email' }))),
            getUserRoles: vi.fn().mockResolvedValue(['admin']),
          }),
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns the health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'OK',
        version: '1.0.0',
        user: {
          id: 'some-user-id',
          email: 'some-user-email',
        },
      });
    });

    it('returns the health status when user is not authenticated', async () => {
      const userService = app.get(UserService);
      vi.spyOn(userService, 'decodeUser').mockResolvedValue(Ok(undefined));
      const healthService = app.get(HealthService);
      vi.spyOn(healthService, 'check').mockResolvedValue(
        mock<HealthCheck>({
          status: 'OK',
          version: '1.0.0',
        }),
      );

      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'OK',
        version: '1.0.0',
      });
    });

    it('fetches the health status from health service', async () => {
      const healthService = app.get(HealthService);
      const checkSpy = vi.spyOn(healthService, 'check');

      await request(app.getHttpServer()).get('/health');

      expect(checkSpy).toHaveBeenCalledTimes(1);
      expect(checkSpy).toHaveBeenCalledWith({
        id: 'some-user-id',
        email: 'some-user-email',
      });
    });

    it('returns 401 when user token expired', async () => {
      const userService = app.get(UserService);
      vi.spyOn(userService, 'decodeUser').mockResolvedValue(
        Fail(new UserAuthorizationExpiredFailure()),
      );

      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toEqual(401);
      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: UserAuthorizationExpiredFailure.name,
        statusCode: 401,
      });
    });
  });

  // TODO: to be removed when there will be real authorized endpoints
  describe('GET /health/test-auth', () => {
    it('returns the health status', async () => {
      const response = await request(app.getHttpServer()).get('/health/test-auth');

      expect(response.status).toEqual(200);
    });

    it('returns the health status with no roles', async () => {
      const response = await request(app.getHttpServer()).get('/health/test-auth-no-roles');

      expect(response.status).toEqual(200);
    });

    it('returns 403 when user is not authenticated', async () => {
      const userService = app.get(UserService);
      vi.spyOn(userService, 'decodeUser').mockResolvedValue(Ok(undefined));

      const response = await request(app.getHttpServer()).get('/health/test-auth');

      expect(response.status).toEqual(403);
    });

    it('returns 403 when user is not authorized', async () => {
      const userService = app.get(UserService);
      vi.spyOn(userService, 'getUserRoles').mockResolvedValue(['user']);

      const response = await request(app.getHttpServer()).get('/health/test-auth');

      expect(response.status).toEqual(403);
    });
  });

  describe('GET /health/rate-limited-sample', () => {
    it('returns 200 when under the limit', async () => {
      const response = await request(app.getHttpServer()).get('/health/rate-limited-sample');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ ok: true });
    });

    it('returns 429 when limit from .env.test is reached', async () => {
      const configService = app.get(ConfigService);
      const rateLimitMaxRequests =
        configService.get<RateLimitConfig>(RATE_LIMIT_CONFIG_TOKEN)!.RATE_LIMIT_MAX_REQUESTS;

      const server = app.getHttpServer();

      for (let i = 0; i < rateLimitMaxRequests; i++) {
        await request(server).get('/health/rate-limited-sample');
      }
      const response = await request(server).get('/health/rate-limited-sample');

      expect(response.status).toEqual(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
    });
  });
});
