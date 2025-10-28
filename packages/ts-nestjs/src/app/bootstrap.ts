import * as path from 'path';
import 'reflect-metadata';

import { loadEnvConfig } from '@jsfsi-core-core/ts-nodejs';
import { Logger, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APP_CONFIG_TOKEN, AppConfig } from '../configuration/AppConfigurationService';

import { createApp } from './app';

export async function bootstrap(
  appModule: Type,
  configPath: string = path.resolve(__dirname, '../configuration'),
) {
  loadEnvConfig({ env: '', configPath });

  const app = await createApp({ appModule });

  // Get the configuration using ConfigService with the proper token
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfig>(APP_CONFIG_TOKEN);

  if (!config) {
    throw new Error(`Configuration with token ${APP_CONFIG_TOKEN} not found`);
  }

  await app.listen(config.APP_PORT);

  const logger = new Logger('NestJS App');
  logger.log(`NestJS App is running at http://localhost:${config.APP_PORT}`);
}
