import { parseConfig } from '@jsfsi-core/ts-crossplatform';
import { ConfigModule } from '@nestjs/config';
import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const RATE_LIMIT_CONFIG_TOKEN = 'rate-limit-config';

export const RateLimitConfigSchema = z.object({
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('60000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'RATE_LIMIT_WINDOW_MS must be a valid number' })
    .refine((val) => val > 0, { message: 'RATE_LIMIT_WINDOW_MS must be positive' }),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'RATE_LIMIT_MAX_REQUESTS must be a valid number' })
    .refine((val) => val > 0, { message: 'RATE_LIMIT_MAX_REQUESTS must be positive' }),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

const createConfigModule = (configKey: string) =>
  ConfigModule.forRoot({
    ignoreEnvFile: true,
    isGlobal: true,
    expandVariables: true,
    cache: false,
    load: [registerAs(configKey, () => parseConfig(RateLimitConfigSchema))],
  });

export const rateLimitConfigModuleSetup = () => createConfigModule(RATE_LIMIT_CONFIG_TOKEN);
