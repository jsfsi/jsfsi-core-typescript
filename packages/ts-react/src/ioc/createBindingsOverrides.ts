import { BindingType } from './IoCContextProvider';

export function createBindingsOverrides(bindings: readonly BindingType<unknown>[]) {
  return ({ overrides }: { overrides: readonly BindingType<unknown>[] }) =>
    bindings.map((binding) => {
      const override = overrides.find((o) => o.type === binding.type);
      return override ?? binding;
    });
}
