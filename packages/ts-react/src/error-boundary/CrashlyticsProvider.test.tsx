import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCrashlytics } from './CrashlyticsContext';
import { CrashlyticsProvider } from './CrashlyticsProvider';

function UnstableConsumer({ onRender }: { onRender: (reportFailure: (...args: unknown[]) => void) => void }) {
  const { reportFailure } = useCrashlytics();
  onRender(reportFailure);
  return null;
}

function CrashlyticsConsumer() {
  const { reportFailure } = useCrashlytics();
  return (
    <button type="button" onClick={() => reportFailure('test failure')}>
      Report
    </button>
  );
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

    it('sends reportFailure calls to onReport', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();

      render(
        <CrashlyticsProvider onReport={onReport}>
          <CrashlyticsConsumer />
        </CrashlyticsProvider>,
      );

      screen.getByText('Report').click();

      expect(onReport).toHaveBeenCalledTimes(1);
      expect(onReport).toHaveBeenCalledWith({ source: 'report-failure', args: ['test failure'] });
    });

    it('sends render crashes to onReport', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();
      const error = new Error('crash');

      render(
        <CrashlyticsProvider fallback={FallbackComponent} onReport={onReport}>
          <ThrowingComponent error={error} />
        </CrashlyticsProvider>,
      );

      expect(onReport).toHaveBeenCalledTimes(1);
      expect(onReport.mock.calls[0]![0]).toEqual({
        source: 'boundary',
        args: [error],
        componentStack: onReport.mock.calls[0]![0].componentStack,
      });
    });

    it('keeps the app working when onReport throws', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn(() => {
        throw new Error('reporter down');
      });

      render(
        <CrashlyticsProvider onReport={onReport}>
          <CrashlyticsConsumer />
        </CrashlyticsProvider>,
      );

      screen.getByText('Report').click();

      expect(onReport).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(['test failure']);
      expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('keeps reportFailure stable across renders and uses the latest onReport', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const seen: Array<(...args: unknown[]) => void> = [];
      const firstReporter = vi.fn();
      const secondReporter = vi.fn();

      const { rerender } = render(
        <CrashlyticsProvider onReport={firstReporter}>
          <UnstableConsumer onRender={(reportFailure) => seen.push(reportFailure)} />
        </CrashlyticsProvider>,
      );
      rerender(
        <CrashlyticsProvider onReport={secondReporter}>
          <UnstableConsumer onRender={(reportFailure) => seen.push(reportFailure)} />
        </CrashlyticsProvider>,
      );
      seen[1]!('after rerender');

      expect(seen[0]).toBe(seen[1]);
      expect(firstReporter).not.toHaveBeenCalled();
      expect(secondReporter).toHaveBeenCalledWith({ source: 'report-failure', args: ['after rerender'] });
    });
  });
});
