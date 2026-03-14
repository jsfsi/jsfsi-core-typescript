import { z } from 'zod';

const optionalCoercedNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((val) => (val === undefined || val === '' ? undefined : Number(val)))
  .refine((val) => val === undefined || !Number.isNaN(val), { message: 'Must be a valid number' });

export const PageQuery = z.object({
  page: optionalCoercedNumber,
  pageSize: optionalCoercedNumber,
});

export type PageQuery = z.infer<typeof PageQuery>;
