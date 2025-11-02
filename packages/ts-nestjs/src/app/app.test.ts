import { MockLogger } from '@jsfsi-core/ts-nodejs';
import { BadRequestException, Controller, Get, Module } from '@nestjs/common';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { createTestingApp } from '../test/testing-app';

@Controller('test')
class TestController {
  @Get()
  getHello(): { message: string } {
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
  });
});
