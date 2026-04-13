import { render, screen } from '@testing-library/react';
import { ResolutionContext } from 'inversify';
import { describe, expect, it } from 'vitest';

import { useInjection } from './IoCContext';
import { BindingType, IoCContextProvider } from './IoCContextProvider';

class TestService {
  getValue() {
    return 'test-value';
  }
}

class DependencyService {
  getValue() {
    return 'dependency-value';
  }
}

function TestConsumer() {
  const service = useInjection(TestService);
  return <div>{service.getValue()}</div>;
}

describe('IoCContextProvider', () => {
  describe('Render', () => {
    it('renders children', () => {
      const bindings: readonly BindingType<unknown>[] = [];

      render(
        <IoCContextProvider bindings={bindings}>
          <div>child content</div>
        </IoCContextProvider>,
      );

      expect(screen.getByText('child content')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('registers instance bindings and resolves them via useInjection', () => {
      const instance = new TestService();
      const bindings: readonly BindingType<unknown>[] = [{ type: TestService, instance }];

      render(
        <IoCContextProvider bindings={bindings}>
          <TestConsumer />
        </IoCContextProvider>,
      );

      expect(screen.getByText('test-value')).toBeInTheDocument();
    });

    it('registers dynamic value bindings and resolves them via useInjection', () => {
      const bindings: readonly BindingType<unknown>[] = [
        {
          type: TestService,
          dynamicValue: (_context: ResolutionContext) => {
            const service = new TestService();
            return service;
          },
        },
      ];

      render(
        <IoCContextProvider bindings={bindings}>
          <TestConsumer />
        </IoCContextProvider>,
      );

      expect(screen.getByText('test-value')).toBeInTheDocument();
    });

    it('registers multiple bindings', () => {
      const bindings: readonly BindingType<unknown>[] = [
        { type: TestService, instance: new TestService() },
        { type: DependencyService, instance: new DependencyService() },
      ];

      function MultiConsumer() {
        const testService = useInjection(TestService);
        const depService = useInjection(DependencyService);
        return (
          <div>
            {testService.getValue()} {depService.getValue()}
          </div>
        );
      }

      render(
        <IoCContextProvider bindings={bindings}>
          <MultiConsumer />
        </IoCContextProvider>,
      );

      expect(screen.getByText('test-value dependency-value')).toBeInTheDocument();
    });

    it('provides container to children via context', () => {
      const bindings: readonly BindingType<unknown>[] = [
        { type: TestService, instance: new TestService() },
      ];

      function ContainerConsumer() {
        const service = useInjection(TestService);
        return <div>{service.getValue()}</div>;
      }

      render(
        <IoCContextProvider bindings={bindings}>
          <ContainerConsumer />
        </IoCContextProvider>,
      );

      expect(screen.getByText('test-value')).toBeInTheDocument();
    });
  });
});
