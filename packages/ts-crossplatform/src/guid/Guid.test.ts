import { describe, expect, it } from 'vitest';

import { Guid } from './Guid';

describe('#Guid', () => {
  it('created a valid guid', () => {
    const guid = Guid.new();

    expect(Guid.isValid(guid.toString())).toBe(true);
  });

  it.each([undefined, null])('null or empty guid is not valid', (guid?: string | null) => {
    expect(Guid.isValid(guid)).toBe(false);
  });

  it('creates an empty string', () => {
    const emptyGuid = Guid.empty();

    expect(emptyGuid.toString()).toEqual('00000000-0000-0000-0000-000000000000');
  });

  it('validates different guids are equal', () => {
    const firstGuid = Guid.new();
    const secondGuid = new Guid(firstGuid.toString());

    expect(firstGuid.equals(secondGuid)).toBe(true);
  });

  it.each`
    value                                     | result
    ${undefined}                              | ${undefined}
    ${null}                                   | ${undefined}
    ${''}                                     | ${undefined}
    ${'invalid guid'}                         | ${undefined}
    ${'9474c66b-4516-48d9-915b-be006d86fc4d'} | ${new Guid('9474c66b-4516-48d9-915b-be006d86fc4d')}
  `(
    'parses string `$value` to guid `$result`',
    ({ value, result }: { value: string; result: Guid }) => {
      const parsedGuid = Guid.parse(value);

      expect(parsedGuid).toEqual(result);
    },
  );
});
