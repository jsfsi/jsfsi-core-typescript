import * as path from 'path';
import 'reflect-metadata';

import { loadEnvConfig } from '@jsfsi-core/ts-nodejs';

loadEnvConfig({ env: 'test', configPath: path.resolve(__dirname, './') });
