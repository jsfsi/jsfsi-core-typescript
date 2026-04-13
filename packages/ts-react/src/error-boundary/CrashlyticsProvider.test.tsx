import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCrashlytics } from './CrashlyticsContext';
import { CrashlyticsProvider } from './CrashlyticsProvider';

function CrashlyticsConsumer() {
  const { reportFailure } = useCrashlytics();
  return <button onClick={() => reportFailure('test failure')}>Report</button>;
}

function FallbackComponent({ error }: { error: Error | null }) {
  return <div>Custom Fallback: {error?.message}</div>;
}

function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

describe('CrashlyticsProvider', () => {
  describe('Render', () => {
    it('renders children', () => {
      render(
        <CrashlyticsProvider>
          <div>child content</div>
        </CrashlyticsProvider>,
      );

      expect(screen.getByText('child content')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('provides reportFailure via context that logs to console.error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      render(
        <CrashlyticsProvider>
          <CrashlyticsConsumer />
        </CrashlyticsProvider>,
      );

      screen.getByText('Report').click();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(['test failure']);
    });

    it('passes fallback prop to ErrorBoundary', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      render(
        <CrashlyticsProvider fallback={FallbackComponent}>
          <ThrowingComponent error={new Error('crash')} />
        </CrashlyticsProvider>,
      );

      expect(screen.getByText('Custom Fallback: crash')).toBeInTheDocument();
    });
  });
});
