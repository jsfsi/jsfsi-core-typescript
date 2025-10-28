import { parseConfig } from '@jsfsi-core-core/ts-crossplatform';
import { registerAs } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

export const APP_CONFIG_TOKEN = 'nestjs-app-config';

export const AppConfigSchema = z.object({
  APP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'APP_PORT must be a valid number' })
    .refine((val) => val > 0, { message: 'APP_PORT must be a positive number' }),
  LOGGER_PROVIDER: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  CORS_METHODS: z
    .string()
    .default('GET,POST,PUT,DELETE,PATCH,OPTIONS')
    .transform((val) => val.split(',').map((method) => method.trim())),
  CORS_ALLOWED_HEADERS: z
    .string()
    .default('Content-Type,Authorization')
    .transform((val) => val.split(',').map((header) => header.trim())),
  CORS_CREDENTIALS: z
    .string()
    .default('true')
    .transform((val) => val.toLowerCase() === 'true'),
  CORS_MAX_AGE: z
    .string()
    .default('3600')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'CORS_MAX_AGE must be a valid number' }),
  CORE_API_VERSION: z.string().default('latest'),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

const createConfigModule = (configKey: string) =>
  ConfigModule.forRoot({
    ignoreEnvFile: true,
    isGlobal: true,
    expandVariables: true,
    cache: false,
    load: [registerAs(configKey, () => parseConfig(AppConfigSchema))],
  });

export const appConfigModuleSetup = () => createConfigModule(APP_CONFIG_TOKEN);
