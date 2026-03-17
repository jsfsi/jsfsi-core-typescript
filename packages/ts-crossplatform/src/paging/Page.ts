import { z, ZodTypeAny } from 'zod';

export const createPageSchema = <T extends ZodTypeAny>(elementSchema: T) =>
  z.object({
    pages: z.number(),
    nextPage: z.number().optional(),
    totalElements: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
    elements: z.array(elementSchema),
  });

export type Page<T> = {
  pages: number;
  nextPage: number | undefined;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  elements: T[];
};

export function EmptyPage<T>(): Page<T> {
  return {
    pages: 0,
    nextPage: undefined,
    totalElements: 0,
    currentPage: 0,
    pageSize: 0,
    elements: [],
  };
}
