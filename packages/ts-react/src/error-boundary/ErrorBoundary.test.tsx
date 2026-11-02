import { act, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

function FallbackComponent({ error }: { error: Error | null }) {
  return <div>Fallback: {error?.message}</div>;
}

function dispatchUnhandledRejection(reason: unknown): void {
  act(() => {
    window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason }));
  });
}

describe('ErrorBoundary', () => {
  describe('Render', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>child content</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('renders fallback component when error occurs', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      render(
        <ErrorBoundary fallback={FallbackComponent}>
          <ThrowingComponent error={new Error('test error')} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Fallback: test error')).toBeInTheDocument();
    });

    it('renders error message when no fallback is provided', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      render(
        <ErrorBoundary>
          <ThrowingComponent error={new Error('raw error message')} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('raw error message')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('logs error via componentDidCatch', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      render(
        <ErrorBoundary>
          <ThrowingComponent error={new Error('caught error')} />
        </ErrorBoundary>,
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'caught error' }),
        expect.objectContaining({ componentStack: expect.any(String) }),
      );
    });

    it('reports a caught error to onReport with its component stack', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();
      const error = new Error('caught error');

      render(
        <ErrorBoundary onReport={onReport}>
          <ThrowingComponent error={error} />
        </ErrorBoundary>,
      );

      expect(onReport).toHaveBeenCalledTimes(1);
      expect(onReport).toHaveBeenCalledWith({
        source: 'boundary',
        args: [error],
        componentStack: onReport.mock.calls[0]![0].componentStack,
      });
      expect(onReport.mock.calls[0]![0].componentStack).toContain('ThrowingComponent');
    });

    it('reports a caught error without a component stack when React gives none', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();
      const error = new Error('caught error');

      new ErrorBoundary({ onReport }).componentDidCatch(error, { componentStack: null });

      expect(onReport).toHaveBeenCalledWith({ source: 'boundary', args: [error], componentStack: undefined });
    });

    it('logs, reports and shows an unhandled promise rejection', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();
      const reason = new Error('rejected');

      render(
        <ErrorBoundary fallback={FallbackComponent} onReport={onReport}>
          <div>child content</div>
        </ErrorBoundary>,
      );
      dispatchUnhandledRejection(reason);

      expect(consoleErrorSpy).toHaveBeenCalledWith(reason);
      expect(onReport).toHaveBeenCalledWith({ source: 'unhandled-rejection', args: [reason] });
      expect(screen.getByText('Fallback: rejected')).toBeInTheDocument();
    });

    it('stops listening for unhandled rejections after unmount', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn();

      const { unmount } = render(
        <ErrorBoundary onReport={onReport}>
          <div>child content</div>
        </ErrorBoundary>,
      );
      unmount();
      dispatchUnhandledRejection(new Error('after unmount'));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(onReport).not.toHaveBeenCalled();
    });

    it('keeps rendering the fallback when onReport throws', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const onReport = vi.fn(() => {
        throw new Error('reporter down');
      });

      render(
        <ErrorBoundary fallback={FallbackComponent} onReport={onReport}>
          <ThrowingComponent error={new Error('crash')} />
        </ErrorBoundary>,
      );

      expect(onReport).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Fallback: crash')).toBeInTheDocument();
    });
  });
});
