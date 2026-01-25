import { INestApplication, Logger, LoggerService, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { APP_CONFIG_TOKEN, AppConfig } from '../configuration/AppConfigurationService';
import { AllExceptionsFilter } from '../filters/AllExceptionsFilter';

export type AppOptions = {
  existentApp?: INestApplication;
  existentLogger?: LoggerService;
  appModule?: Type;
};

export const createApp = async ({
  existentApp,
  existentLogger,
  appModule,
}: AppOptions): Promise<{ app: INestApplication; logger: LoggerService }> => {
  if (!existentApp && !appModule) {
    throw new Error('Either existentApp or appModule must be provided');
  }

  const logger: LoggerService =
    process.env.LOGGER_PROVIDER === 'NESTJS' || !existentLogger ? new Logger() : existentLogger;

  logger.setLogLevels?.(['verbose', 'debug', 'log', 'warn', 'error', 'fatal']);

  const app =
    existentApp ||
    (await NestFactory.create<NestExpressApplication>(appModule!, {
      bufferLogs: true,
      logger,
      rawBody: true,
    }));

  app.useLogger(logger);

  // Get the configuration using ConfigService
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfig>(APP_CONFIG_TOKEN);

  if (!config) {
    throw new Error(`Configuration with token ${APP_CONFIG_TOKEN} not found`);
  }

  logger.setLogLevels?.(config.LOG_LEVELS);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Enable CORS with configuration
  app.enableCors({
    origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
    methods: config.CORS_METHODS,
    allowedHeaders: config.CORS_ALLOWED_HEADERS,
    credentials: config.CORS_CREDENTIALS,
    maxAge: config.CORS_MAX_AGE,
  });

  return { app, logger };
};
