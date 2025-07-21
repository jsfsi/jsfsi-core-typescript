import { z, ZodType } from 'zod';

export const ConfigurationSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

const parseConfig = <T extends ZodType>(configSchema: T): z.infer<T> => {
  const result = configSchema.safeParse(import.meta.env);

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${JSON.stringify(result.error.issues)}`);
  }

  return result.data;
};

export const configuration = parseConfig(ConfigurationSchema);
