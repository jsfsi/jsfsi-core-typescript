import { mock } from '@jsfsi-core/ts-crossplatform';
import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { Controller, ExecutionContext, Get, Injectable, Module, UseGuards } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { createTestingApp } from '../test/testing-app';

import { InMemoryRateLimitGuard, InMemoryRateLimitGuardOptions } from './InMemoryRateLimitGuard';

function createMockContext(req: {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}): ExecutionContext {
  const response = { setHeader: vi.fn() };
  return mock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => response,
    }),
  });
}

let testRateLimitOptions: InMemoryRateLimitGuardOptions = {
  windowMs: 60000,
  maxRequests: 100,
};

@Injectable()
class TestRateLimitGuard extends InMemoryRateLimitGuard {
  constructor() {
    super(testRateLimitOptions);
  }
}

@Controller('ping')
class PingController {
  @Get()
  @UseGuards(TestRateLimitGuard)
  ping(): { ok: boolean } {
    return { ok: true };
  }
}

@Module({
  imports: [appConfigModuleSetup()],
  controllers: [PingController],
  providers: [TestRateLimitGuard],
})
class RateLimitTestModule {}

describe('InMemoryRateLimitGuard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('throws when windowMs is not positive', () => {
      expect(() => new InMemoryRateLimitGuard({ windowMs: 0, maxRequests: 10 })).toThrow(
        'windowMs and maxRequests must be positive',
      );
      expect(() => new InMemoryRateLimitGuard({ windowMs: -1, maxRequests: 10 })).toThrow(
        'windowMs and maxRequests must be positive',
      );
    });

    it('throws when maxRequests is not positive', () => {
      expect(() => new InMemoryRateLimitGuard({ windowMs: 1000, maxRequests: 0 })).toThrow(
        'windowMs and maxRequests must be positive',
      );
      expect(() => new InMemoryRateLimitGuard({ windowMs: 1000, maxRequests: -1 })).toThrow(
        'windowMs and maxRequests must be positive',
      );
    });
  });

  describe('happy path', () => {
    it('allows requests under the limit', async () => {
      testRateLimitOptions = { windowMs: 60000, maxRequests: 3 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/ping');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });

    it('allows requests from different IPs to have separate limits', async () => {
      testRateLimitOptions = { windowMs: 60000, maxRequests: 2 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      await request(server).get('/ping').set('x-forwarded-for', '192.168.1.1');
      const r2 = await request(server).get('/ping').set('x-forwarded-for', '192.168.1.1');
      const r3 = await request(server).get('/ping').set('x-forwarded-for', '192.168.1.2');

      expect(r2.status).toBe(200);
      expect(r3.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('returns 429 and sets Retry-After when over limit', async () => {
      testRateLimitOptions = { windowMs: 60000, maxRequests: 2 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      await request(server).get('/ping');
      await request(server).get('/ping');
      const response = await request(server).get('/ping');

      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
    });
  });

  describe('extractIp', () => {
    it('uses first IP from x-forwarded-for header', async () => {
      testRateLimitOptions = { windowMs: 60000, maxRequests: 1 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      const r1 = await request(server).get('/ping').set('x-forwarded-for', '10.0.0.1, 10.0.0.2');
      const r2 = await request(server).get('/ping').set('x-forwarded-for', '10.0.0.1, 10.0.0.2');

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(429);
    });

    it('uses request.ip when x-forwarded-for is not set', async () => {
      testRateLimitOptions = { windowMs: 60000, maxRequests: 1 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      const r1 = await request(server).get('/ping');
      const r2 = await request(server).get('/ping');

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(429);
    });

    it('uses first IP when x-forwarded-for is an array', async () => {
      const guard = new InMemoryRateLimitGuard({ windowMs: 60000, maxRequests: 1 });
      const req = {
        headers: { 'x-forwarded-for': ['10.0.0.1', '10.0.0.2'] as string[] },
      };

      await guard.canActivate(createMockContext(req));
      await expect(guard.canActivate(createMockContext(req))).rejects.toThrow('Too Many Requests');
    });

    it('uses unknown when no ip and no x-forwarded-for', async () => {
      const guard = new InMemoryRateLimitGuard({ windowMs: 60000, maxRequests: 1 });
      const req = { headers: {}, ip: undefined };

      await guard.canActivate(createMockContext(req));
      await expect(guard.canActivate(createMockContext(req))).rejects.toThrow('Too Many Requests');
    });
  });

  describe('cleanup', () => {
    it('removes expired entries so limit resets after window', async () => {
      vi.useFakeTimers();
      testRateLimitOptions = { windowMs: 1000, maxRequests: 2 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      const r1 = await request(server).get('/ping');
      const r2 = await request(server).get('/ping');
      const r3 = await request(server).get('/ping');

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      expect(r3.status).toBe(429);

      vi.advanceTimersByTime(1500);

      const r4 = await request(server).get('/ping');

      expect(r4.status).toBe(200);

      vi.useRealTimers();
    });

    it('keeps valid timestamps when cleanup runs within window', async () => {
      vi.useFakeTimers();
      testRateLimitOptions = { windowMs: 1000, maxRequests: 3 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      await request(server).get('/ping');
      await request(server).get('/ping');
      vi.advanceTimersByTime(500);
      const response = await request(server).get('/ping');

      expect(response.status).toBe(200);
      vi.useRealTimers();
    });

    it('deletes IP entry when all its timestamps are expired on cleanup', async () => {
      vi.useFakeTimers();
      testRateLimitOptions = { windowMs: 1000, maxRequests: 2 };
      const app = await createTestingApp(RateLimitTestModule, {
        logger: new MockLogger(),
      });

      const server = app.getHttpServer();

      await request(server).get('/ping').set('x-forwarded-for', '192.168.1.1');
      await request(server).get('/ping').set('x-forwarded-for', '192.168.1.1');
      vi.advanceTimersByTime(1500);
      const response = await request(server).get('/ping').set('x-forwarded-for', '192.168.1.2');

      expect(response.status).toBe(200);
      vi.useRealTimers();
    });
  });
});
