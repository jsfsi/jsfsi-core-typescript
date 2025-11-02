import * as path from 'path';

import { bootstrap } from '@jsfsi-core/ts-nestjs';
import { GCPLogger } from '@jsfsi-core/ts-nodejs';

import { AppModule } from './app/app.module';

bootstrap({
  appModule: AppModule,
  configPath: path.resolve(__dirname, '../configuration'),
  logger: new GCPLogger('template-rest-api'),
});
