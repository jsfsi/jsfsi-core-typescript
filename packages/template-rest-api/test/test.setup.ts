import * as path from 'path';
import 'reflect-metadata';

import './mocks/firebase-admin';

import { loadEnvConfig } from '@jsfsi-core/ts-nodejs';

loadEnvConfig({ env: 'test', configPath: path.resolve(__dirname, '../configuration') });
