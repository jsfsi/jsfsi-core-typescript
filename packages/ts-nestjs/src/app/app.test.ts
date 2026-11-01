import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { BadRequestException, Body, Controller, Get, Logger, Module, Post } from '@nestjs/common';
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

  @Post('echo-length')
  echoLength(@Body() body: { text: string }): { length: number } {
    return { length: body.text.length };
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
    delete process.env.JSON_BODY_LIMIT;
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

    it('refuses a JSON body over the default 100kb limit', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer())
        .post('/test/echo-length')
        .send({ text: 'a'.repeat(200_000) });

      expect(response.status).toBe(413);
    });

    it('accepts a JSON body up to the configured JSON_BODY_LIMIT', async () => {
      process.env.JSON_BODY_LIMIT = '1mb';
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer())
        .post('/test/echo-length')
        .send({ text: 'a'.repeat(200_000) });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ length: 200_000 });
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
