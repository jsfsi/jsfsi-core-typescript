import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

function FallbackComponent({ error }: { error: Error | null }) {
  return <div>Fallback: {error?.message}</div>;
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
  });
});
