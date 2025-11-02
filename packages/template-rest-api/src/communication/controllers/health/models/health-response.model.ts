import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string().optional(),
    })
    .optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
