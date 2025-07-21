import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { useCrashlytics } from './CrashlyticsContext';
import { CrashlyticsProvider } from './CrashlyticsProvider';

describe('#CrashlyticsProvider', () => {
  const consoleErrorSpy = vi.spyOn(global.console, 'error').mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('renders error page', () => {
      const DummyComponent = () => {
        const [error, setError] = React.useState<Error>();

        if (error) {
          throw error;
        }

        useEffect(() => {
          setError(new Error('some error'));
        }, [error]);

        return null;
      };

      const { getByText } = render(
        <CrashlyticsProvider>
          <DummyComponent />
        </CrashlyticsProvider>,
      );

      expect(getByText('some error')).toBeInTheDocument();
    });

    it('reports crash with console.error', () => {
      const DummyComponent = () => {
        const [error, setError] = React.useState<Error>();

        if (error) {
          throw error;
        }

        useEffect(() => {
          setError(new Error('some error'));
        }, [error]);

        return null;
      };

      render(
        <CrashlyticsProvider>
          <DummyComponent />
        </CrashlyticsProvider>,
      );

      // Note: first call is made by react itself and is not possible to control at this stage
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        new Error('some error'),
        expect.anything(),
      );
    });

    it('reports error with crashlytics hook', () => {
      const DummyComponent = () => {
        const { reportFailure } = useCrashlytics();

        useEffect(() => {
          reportFailure(new Error('some error'));
        }, []);

        return null;
      };

      render(
        <CrashlyticsProvider>
          <DummyComponent />
        </CrashlyticsProvider>,
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith([new Error('some error')]);
    });
  });
});
