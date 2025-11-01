import { MockLogger } from '@jsfsi-core/ts-nodejs';
import {
  Controller,
  Get,
  HttpCode,
  INestApplication,
  LoggerService,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appConfigModuleSetup } from '../configuration/AppConfigurationService';
import { AllExceptionsFilter } from '../filters/AllExceptionsFilter';
import { createTestingApp } from '../test/testing-app';

import { RequestMiddleware } from './RequestMiddleware';

@Controller()
class TestController {
  @Get('success')
  @HttpCode(200)
  success() {
    return 'ok';
  }

  @Get('redirect')
  @HttpCode(300)
  redirect() {
    return 'ok';
  }

  @Get('bad-request')
  @HttpCode(400)
  badRequest() {
    return 'ok';
  }

  @Get('unauthorized')
  @HttpCode(401)
  unauthorized() {
    return 'ok';
  }

  @Get('forbidden')
  @HttpCode(403)
  forbidden() {
    return 'ok';
  }

  @Get('not-found')
  @HttpCode(404)
  notFound() {
    return 'ok';
  }

  @Get('not-acceptable')
  @HttpCode(406)
  notAcceptable() {
    return 'ok';
  }

  @Get('error')
  error() {
    throw new Error('test');
  }
}

@Module({
  imports: [appConfigModuleSetup()],
  controllers: [TestController],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}

describe('RequestMiddleware', () => {
  let mockLogger: LoggerService;
  let app: INestApplication;

  beforeEach(async () => {
    mockLogger = new MockLogger();
    app = await createTestingApp(TestModule, {
      logger: mockLogger,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    statusCode | severity     | path
    ${200}     | ${'verbose'} | ${'/success'}
    ${300}     | ${'debug'}   | ${'/redirect'}
    ${400}     | ${'log'}     | ${'/bad-request'}
    ${401}     | ${'log'}     | ${'/unauthorized'}
    ${403}     | ${'log'}     | ${'/forbidden'}
    ${404}     | ${'log'}     | ${'/not-found'}
    ${406}     | ${'warn'}    | ${'/not-acceptable'}
  `(
    'logs the request with status code $statusCode and severity $severity',
    async ({ statusCode, severity, path }) => {
      const logSpy = vi.spyOn(mockLogger, severity);

      await request(app.getHttpServer()).get(path);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Request: GET ${path} ${statusCode}`,
        expect.objectContaining({
          domain: '127.0.0.1',
          method: 'GET',
          requestHeaders: expect.objectContaining({
            'accept-encoding': 'gzip, deflate',
            connection: 'close',
            host: expect.stringMatching(/127\.0\.0\.1:\d+/),
          }),
          responseHeaders: expect.objectContaining({
            'content-length': '2',
            'content-type': 'text/html; charset=utf-8',
            etag: expect.any(String),
            'x-powered-by': 'Express',
          }),
          statusCode,
          timeSpentMs: expect.any(Number),
          url: path,
        }),
        RequestMiddleware.name,
      );
    },
  );

  it('logs the request with status code 500 and severity error', async () => {
    const logSpy = vi.spyOn(mockLogger, 'error');

    await request(app.getHttpServer()).get('/error');

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'Unhandled exception',
      new Error('test'),
      AllExceptionsFilter.name,
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'Request: GET /error 500',
      {
        domain: '127.0.0.1',
        method: 'GET',
        requestHeaders: {
          'accept-encoding': 'gzip, deflate',
          connection: 'close',
          host: expect.stringMatching(/127\.0\.0\.1:\d+/),
        },
        responseHeaders: {
          'access-control-allow-credentials': 'true',
          'access-control-allow-origin': 'http://localhost:5003',
          'content-length': '26',
          'content-type': 'application/json; charset=utf-8',
          etag: expect.any(String),
          'x-powered-by': 'Express',
          vary: 'Origin',
        },
        statusCode: 500,
        timeSpentMs: expect.any(Number),
        url: '/error',
      },
      RequestMiddleware.name,
    );
  });

  it('does not log inner requests from 127.0.0.1', async () => {
    const logSpy = vi.spyOn(mockLogger, 'verbose');

    await request(app.getHttpServer()).get('/success').set('host', '127.0.0.1');

    expect(logSpy).not.toHaveBeenCalled();
  });
});
