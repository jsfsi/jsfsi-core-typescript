import { describe, expect, it } from 'vitest';

import { mock } from './mock';

class SomeEntity {
  a: string;
  b: number;
  c: boolean;
}

describe('mock', () => {
  it('mocks an entity without properties', () => {
    const mockedEntity = mock<SomeEntity>();

    expect(mockedEntity).toEqual({});
  });

  it('mocks an entity with partial properties', () => {
    const mockedEntity = mock<SomeEntity>({
      b: 1,
    });

    expect(mockedEntity).toEqual({
      b: 1,
    });
  });

  it('mocks an entity with all properties', () => {
    const mockedEntity = mock<SomeEntity>({
      a: 'a',
      b: 1,
      c: true,
    });

    expect(mockedEntity).toEqual({
      a: 'a',
      b: 1,
      c: true,
    });
  });
});
