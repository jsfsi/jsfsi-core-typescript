import { Container, ResolutionContext } from 'inversify';
import { ReactNode } from 'react';

import { IoCContext } from './IoCContext';

export interface BindingType<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: new (...args: any[]) => T;
  instance?: T;
  dynamicValue?: (context: ResolutionContext) => T;
}

interface IoCContextProviderProps {
  children: ReactNode;
  bindings: readonly BindingType<unknown>[];
}

function registerBinding<T>({
  type,
  instance,
  dynamicValue,
  container,
}: {
  type: new (...args: unknown[]) => T;
  instance?: T;
  dynamicValue?: (context: ResolutionContext) => T;
  container: Container;
}) {
  /* v8 ignore else -- @preserve */
  if (instance) {
    container.bind<T>(type).toConstantValue(instance);
  } else if (dynamicValue) {
    container.bind<T>(type).toDynamicValue(dynamicValue);
  } else {
    container.bind<T>(type).toSelf();
  }
}

export const IoCContextProvider = ({ children, bindings }: IoCContextProviderProps) => {
  const container = new Container();

  bindings.forEach(({ type, instance, dynamicValue }) => {
    registerBinding({ type, instance, dynamicValue, container });
  });

  return (
    <IoCContext.Provider
      value={{
        container,
      }}
    >
      {children}
    </IoCContext.Provider>
  );
};
