import * as path from 'path';
import 'reflect-metadata';

import { loadEnvConfig } from '@jsfsi-core/ts-nodejs';
import { LoggerService, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APP_CONFIG_TOKEN, AppConfig } from '../configuration/AppConfigurationService';

import { createApp } from './app';

type BootstrapOptions = {
  appModule: Type;
  configPath: string;
  logger?: LoggerService;
};

export async function bootstrap({
  appModule,
  configPath = path.resolve(__dirname, '../configuration'),
  logger: existentLogger,
}: BootstrapOptions) {
  loadEnvConfig({ env: '', configPath });

  const { app, logger } = await createApp({ appModule, existentLogger });

  // Get the configuration using ConfigService with the proper token
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfig>(APP_CONFIG_TOKEN);

  if (!config) {
    throw new Error(`Configuration with token ${APP_CONFIG_TOKEN} not found`);
  }

  await app.listen(config.APP_PORT);

  logger.log(`NestJS App is running at http://localhost:${config.APP_PORT}`);
}
