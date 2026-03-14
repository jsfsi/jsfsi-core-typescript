import { z } from 'zod';

export const PageQuery = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export type PageQuery = z.infer<typeof PageQuery>;
