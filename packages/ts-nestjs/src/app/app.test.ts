import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { BadRequestException, Controller, Get, Logger, Module } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { createTestingApp } from '../test/testing-app';

@Controller('test')
class TestController {
  private logger = new Logger(TestController.name);

  @Get()
  getHello(): { message: string } {
    this.logger.log('some testing log');
    return { message: 'Hello World' };
  }

  @Get('http-error')
  httpError() {
    throw new BadRequestException('test');
  }
}

@Module({
  imports: [appConfigModuleSetup()],
  controllers: [TestController],
})
class TestModule {}

describe('app', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createApp', () => {
    it('creates a nestjs application', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello World' });
    });

    it('returns a 400 status code for http error', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test/http-error');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'test',
        statusCode: 400,
      });
    });

    it('logs using the provided logger', async () => {
      const mockLogger = new MockLogger();

      const logSpy = vi.spyOn(mockLogger, 'log');

      const app = await createTestingApp(TestModule, {
        logger: mockLogger,
      });

      vi.clearAllMocks();

      await request(app.getHttpServer()).get('/test');

      expect(logSpy).toHaveBeenCalledOnce();
      expect(logSpy).toHaveBeenCalledWith('some testing log', TestController.name);
    });
  });
});
