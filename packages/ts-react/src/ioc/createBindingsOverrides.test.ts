import { describe, expect, it } from 'vitest';

import { createBindingsOverrides } from './createBindingsOverrides';
import { BindingType } from './IoCContextProvider';

class ServiceA {
  getValue() {
    return 'a';
  }
}

class ServiceB {
  getValue() {
    return 'b';
  }
}

class ServiceC {
  getValue() {
    return 'c';
  }
}

describe('createBindingsOverrides', () => {
  describe('Behavior', () => {
    it('returns the original bindings when no overrides are provided', () => {
      const a = new ServiceA();
      const b = new ServiceB();
      const bindings: readonly BindingType<unknown>[] = [
        { type: ServiceA, instance: a },
        { type: ServiceB, instance: b },
      ];

      const bindingsOverrides = createBindingsOverrides(bindings);

      const result = bindingsOverrides({ overrides: [] });

      expect(result).toEqual([
        { type: ServiceA, instance: a },
        { type: ServiceB, instance: b },
      ]);
    });

    it('replaces a matching binding with the override while preserving order', () => {
      const a = new ServiceA();
      const b = new ServiceB();
      const overrideB = new ServiceB();
      const bindings: readonly BindingType<unknown>[] = [
        { type: ServiceA, instance: a },
        { type: ServiceB, instance: b },
      ];

      const bindingsOverrides = createBindingsOverrides(bindings);

      const result = bindingsOverrides({
        overrides: [{ type: ServiceB, instance: overrideB }],
      });

      expect(result).toEqual([
        { type: ServiceA, instance: a },
        { type: ServiceB, instance: overrideB },
      ]);
    });

    it('ignores overrides for types that are not in the original bindings', () => {
      const a = new ServiceA();
      const overrideC = new ServiceC();
      const bindings: readonly BindingType<unknown>[] = [{ type: ServiceA, instance: a }];

      const bindingsOverrides = createBindingsOverrides(bindings);

      const result = bindingsOverrides({
        overrides: [{ type: ServiceC, instance: overrideC }],
      });

      expect(result).toEqual([{ type: ServiceA, instance: a }]);
    });
  });
});
