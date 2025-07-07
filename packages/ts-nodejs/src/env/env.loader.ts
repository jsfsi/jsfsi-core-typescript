import path from 'path';

import * as dotenv from 'dotenv';

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
