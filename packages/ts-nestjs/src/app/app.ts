import { type INestApplication, Logger, type LoggerService, type Type } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, ModulesContainer, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { APP_CONFIG_TOKEN, type AppConfig } from '../configuration/AppConfigurationService';
import { AllExceptionsFilter } from '../filters/AllExceptionsFilter';

import { JSON_BODY_LIMIT_METADATA } from './JsonBodyLimit';

export type AppOptions = {
  existentApp?: INestApplication;
  existentLogger?: LoggerService;
  appModule?: Type;
};

const useControllerJsonBodyLimits = (app: INestApplication) => {
  for (const module of app.get(ModulesContainer).values()) {
    // A controller is registered under its own class.
    for (const controller of module.controllers.keys()) {
      const limit: string | number | undefined = Reflect.getMetadata(JSON_BODY_LIMIT_METADATA, controller);

      if (limit === undefined) {
        continue;
      }

      const paths: string[] = [Reflect.getMetadata(PATH_METADATA, controller)].flat();

      for (const path of paths) {
        app.use(`/${path.replace(/^\/+/, '')}`, json({ limit }));
      }
    }
  }
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

  // Registered before init, so Nest skips its default 100kb JSON parser. A
  // controller's own limit is mounted first: the app-wide parser then finds the
  // body already read and leaves it.
  useControllerJsonBodyLimits(app);
  (app as NestExpressApplication).useBodyParser('json', { limit: config.JSON_BODY_LIMIT });

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
