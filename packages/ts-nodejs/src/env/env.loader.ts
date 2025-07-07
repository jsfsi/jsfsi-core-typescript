import path from 'path';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type LoadEnvConfigOptions = {
  env?: string;
  configPath?: string;
};

export const loadEnvConfig = (options: LoadEnvConfigOptions = {}) => {
  const { env, configPath } = options;

  const envFilePath = path.resolve(__dirname, `${configPath ?? '.'}/.env${env ? `.${env}` : ''}`);

  const { parsed } = dotenv.config({ path: envFilePath });

  return parsed;
};
