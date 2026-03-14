import { describe, expect, it } from 'vitest';

import { PageQuery } from './PageQuery';

describe('PageQuery', () => {
  describe('parse', () => {
    it('parses string page and pageSize to numbers', () => {
      const result = PageQuery.parse({ page: '1', pageSize: '10' });

      expect(result).toEqual({ page: 1, pageSize: 10 });
    });

    it('parses negative string page and pageSize to numbers', () => {
      const result = PageQuery.parse({ page: '-1', pageSize: '-10' });

      expect(result).toEqual({ page: -1, pageSize: -10 });
    });

    it('parses only page string to number with pageSize undefined', () => {
      const result = PageQuery.parse({ page: '1' });

      expect(result).toEqual({ page: 1, pageSize: undefined });
    });

    it('parses only pageSize string to number with page undefined', () => {
      const result = PageQuery.parse({ pageSize: '10' });

      expect(result).toEqual({ page: undefined, pageSize: 10 });
    });

    it('parses empty object to undefined page and pageSize', () => {
      const result = PageQuery.parse({});

      expect(result).toEqual({ page: undefined, pageSize: undefined });
    });

    it('throws when page and pageSize are non-numeric strings', () => {
      expect(() => PageQuery.parse({ page: 'foo', pageSize: 'bar' })).toThrow();
    });
  });
});
