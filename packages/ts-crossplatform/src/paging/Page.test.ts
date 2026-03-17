import { describe, expect, it } from 'vitest';

import { EmptyPage } from './Page';

describe('EmptyPage', () => {
  it('returns a page with zero counts and empty elements', () => {
    const result = EmptyPage<number>();

    expect(result).toEqual({
      pages: 0,
      nextPage: undefined,
      totalElements: 0,
      currentPage: 0,
      pageSize: 0,
      elements: [],
    });
  });

  it('returns same shape for any element type', () => {
    type Item = { id: string; name: string };
    const result = EmptyPage<Item>();

    expect(result).toEqual({
      pages: 0,
      nextPage: undefined,
      totalElements: 0,
      currentPage: 0,
      pageSize: 0,
      elements: [],
    });
  });
});
