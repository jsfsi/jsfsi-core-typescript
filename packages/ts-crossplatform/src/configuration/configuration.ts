import { z, ZodSchema } from 'zod';

export const parseConfig = <T extends ZodSchema>(
  configSchema: T,
  env: unknown = process.env,
): z.infer<T> => {
  const result = configSchema.safeParse(env);

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${JSON.stringify(result.error.issues)}`);
  }

  return result.data;
};
