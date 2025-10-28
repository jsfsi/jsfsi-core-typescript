import { MockLogger } from '@jsfsi-core-core/ts-nodejs';
import { Controller, Get, Module } from '@nestjs/common';
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
  });
});
