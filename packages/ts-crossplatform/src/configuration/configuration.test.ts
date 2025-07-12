import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseConfig } from './configuration';

describe('configuration', () => {
  describe('parseConfig', () => {
    it('parses config with valid schema', () => {
      const schema = z.object({
        foo: z.number(),
        bar: z.string(),
      });

      const config = parseConfig(schema, {
        foo: 3000,
        bar: 'test',
      });

      expect(config).toEqual({
        foo: 3000,
        bar: 'test',
      });
    });

    it('throws an error with invalid schema', () => {
      const schema = z.object({
        foo: z.number(),
      });

      expect(() =>
        parseConfig(schema, {
          foo: 'test',
        }),
      ).toThrow(
        new Error(
          'Invalid environment variables: [{"expected":"number","code":"invalid_type","path":["foo"],"message":"Invalid input: expected number, received string"}]',
        ),
      );
    });
  });
});
