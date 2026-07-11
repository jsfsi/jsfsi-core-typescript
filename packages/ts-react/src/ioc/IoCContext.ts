import { Container, type ServiceIdentifier } from 'inversify';
import { createContext, useContext } from 'react';

export type IoCContextType = {
  container: Container;
};

export const IoCContext = createContext<IoCContextType>({
  container: new Container(),
});

export function useInjection<T>(type: new (...args: never[]) => T) {
  const { container } = useContext(IoCContext);
  return container.get<T>(type as ServiceIdentifier<T>);
}
