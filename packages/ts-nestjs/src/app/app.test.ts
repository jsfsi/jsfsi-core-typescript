import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { BadRequestException, Body, Controller, Get, Logger, Module, Post } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { createTestingApp } from '../test/testing-app';
import { SafeRawBody } from '../validators/ZodValidator';

@Controller('test')
class TestController {
  private logger = new Logger(TestController.name);

  @Get()
  getHello(): { message: string } {
    this.logger.log('some testing log');
    return { message: 'Hello World' };
  }

  @Post()
  rawBody(@Body() body: unknown, @SafeRawBody() rawBody: string) {
    this.logger.debug(rawBody);
    this.logger.debug(body);
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

    it('has parsed body when json and also the raw body', async () => {
      const mockLogger = new MockLogger();

      const logSpy = vi.spyOn(mockLogger, 'debug');

      const app = await createTestingApp(TestModule, {
        logger: mockLogger,
      });

      await request(app.getHttpServer()).post('/test').send({ foo: 'bar' });

      expect(logSpy).toHaveBeenNthCalledWith(1, '{"foo":"bar"}', TestController.name);
      expect(logSpy).toHaveBeenNthCalledWith(2, { foo: 'bar' }, TestController.name);
    });
  });
});
