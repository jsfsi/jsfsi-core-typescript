import { z } from 'zod';

export const PageQuery = z.object({
  page: z.number(),
  pageSize: z.number(),
});

export type PageQuery = z.infer<typeof PageQuery>;
