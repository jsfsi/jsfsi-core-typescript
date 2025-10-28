import { MockLogger } from '@jsfsi-core-core/ts-nodejs';
import { Controller, Get, Module, Post } from '@nestjs/common';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { createTestingApp } from '../test/testing-app';

import { SafeBody, SafeParams, SafeQuery } from './ZodValidator';

const TestQuery = z.object({
  url: z.url('Invalid URL'),
});
type TestQuery = z.infer<typeof TestQuery>;

const TestBody = z.object({
  url: z.url('Invalid URL'),
  foo: z.object({
    bar: z.string('Invalid bar'),
  }),
});
type TestBody = z.infer<typeof TestBody>;

const TestParams = z.object({
  id: z.coerce.number('Invalid ID'),
});
type TestParams = z.infer<typeof TestParams>;

@Controller('test')
class TestController {
  @Get()
  testUrlValidation(@SafeQuery(TestQuery) query: TestQuery): { url: string } {
    return { url: query.url.toString() };
  }

  @Post()
  testBodyValidation(@SafeBody(TestBody) body: TestBody): { url: string; foo: string } {
    return { url: body.url.toString(), foo: body.foo.bar };
  }

  @Get(':id')
  testParamsValidation(@SafeParams(TestParams) params: TestParams): { id: number } {
    return { id: params.id };
  }
}

@Module({
  imports: [appConfigModuleSetup()],
  controllers: [TestController],
})
class TestModule {}

describe('ZodValidator', () => {
  describe('url validation', () => {
    it('returns a 400 status code for invalid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test?url=invalid-url');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: {
          message: JSON.stringify(
            [
              {
                code: 'invalid_format',
                format: 'url',
                path: ['url'],
                message: 'Invalid URL',
              },
            ],
            null,
            2,
          ),
          name: 'ZodError',
        },
        message: 'Invalid query data',
      });
    });

    it('returns a 200 status code for valid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test?url=https://www.google.com');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ url: 'https://www.google.com' });
    });
  });

  describe('body validation', () => {
    it('returns a 400 status code for invalid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer())
        .post('/test')
        .send({ url: 'invalid-url' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: {
          message: JSON.stringify(
            [
              {
                code: 'invalid_format',
                format: 'url',
                path: ['url'],
                message: 'Invalid URL',
              },
              {
                expected: 'object',
                code: 'invalid_type',
                path: ['foo'],
                message: 'Invalid input: expected object, received undefined',
              },
            ],
            null,
            2,
          ),
          name: 'ZodError',
        },
        message: 'Invalid body data',
      });
    });

    it('returns a 200 status code for valid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer())
        .post('/test')
        .send({ url: 'https://www.google.com', foo: { bar: 'test' } });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ url: 'https://www.google.com', foo: 'test' });
    });
  });

  describe('params validation', () => {
    it('returns a 400 status code for invalid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: {
          message: JSON.stringify(
            [
              {
                expected: 'number',
                code: 'invalid_type',
                received: 'NaN',
                path: ['id'],
                message: 'Invalid ID',
              },
            ],
            null,
            2,
          ),
          name: 'ZodError',
        },
        message: 'Invalid params data',
      });
    });

    it('returns a 200 status code for valid $field', async () => {
      const app = await createTestingApp(TestModule, {
        logger: new MockLogger(),
      });

      const response = await request(app.getHttpServer()).get('/test/456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 456 });
    });
  });
});
