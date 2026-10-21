import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../error-boundary/ErrorBoundary';

import { useService } from './useService';

describe('useService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data on mount and exposes it on the hook result', async () => {
    const service = vi.fn(async () => 'payload');

    const { result } = renderHook(() => useService({ service }, []));

    await waitFor(() => expect(result.current.data).toBe('payload'));
    expect(result.current.fetching).toBe(false);
    expect(service).toHaveBeenCalledTimes(1);
    expect(service).toHaveBeenCalledWith(false);
  });

  it('clears data when staleData is false', async () => {
    let resolveRefetch: ((value: string) => void) | undefined;
    const service = vi
      .fn<(isRefetching: boolean) => Promise<string>>()
      .mockResolvedValueOnce('initial')
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveRefetch = resolve;
          }),
      );

    const { result } = renderHook(() => useService({ service, staleData: false }, []));

    await waitFor(() => expect(result.current.data).toBe('initial'));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(result.current.fetching).toBe(true);

    await act(async () => {
      resolveRefetch!('refetched');
    });

    await waitFor(() => expect(result.current.data).toBe('refetched'));
  });

  it('preserves data when staleData is true', async () => {
    let resolveRefetch: ((value: string) => void) | undefined;
    const service = vi
      .fn<(isRefetching: boolean) => Promise<string>>()
      .mockResolvedValueOnce('initial')
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveRefetch = resolve;
          }),
      );

    const { result } = renderHook(() => useService({ service, staleData: true }, []));

    await waitFor(() => expect(result.current.data).toBe('initial'));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.fetching).toBe(true));
    expect(result.current.data).toBe('initial');

    await act(async () => {
      resolveRefetch!('refetched');
    });

    await waitFor(() => expect(result.current.data).toBe('refetched'));
  });

  it('refetch invokes service with isRefetching=true', async () => {
    const service = vi.fn<(isRefetching: boolean) => Promise<string>>().mockResolvedValue('value');

    const { result } = renderHook(() => useService({ service }, []));

    await waitFor(() => expect(service).toHaveBeenCalledTimes(1));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(service).toHaveBeenCalledTimes(2));
    expect(service.mock.calls[0]![0]).toBe(false);
    expect(service.mock.calls[1]![0]).toBe(true);
  });

  it('rethrows service errors from render so an ErrorBoundary can catch them', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = vi
      .fn<(isRefetching: boolean) => Promise<string>>()
      .mockRejectedValue(new Error('service exploded'));

    function Consumer() {
      useService({ service }, []);
      return <div>consumer content</div>;
    }

    function Fallback({ error }: { error: Error | null }) {
      return <div>boundary caught: {error?.message}</div>;
    }

    render(
      <ErrorBoundary fallback={Fallback}>
        <Consumer />
      </ErrorBoundary>,
    );

    await waitFor(() => expect(screen.getByText('boundary caught: service exploded')).toBeInTheDocument());

    consoleErrorSpy.mockRestore();
  });

  describe('superseded requests', () => {
    function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (error: Error) => void } {
      let resolve: (value: T) => void = () => undefined;
      let reject: (error: Error) => void = () => undefined;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    it('keeps the newer data when an older request resolves after the newer one', async () => {
      const requests: Record<string, ReturnType<typeof deferred<string>>> = {
        first: deferred<string>(),
        second: deferred<string>(),
      };
      const service = vi.fn((key: string) => requests[key]!.promise);

      const { result, rerender } = renderHook(({ key }) => useService({ service: () => service(key) }, [key]), {
        initialProps: { key: 'first' },
      });

      rerender({ key: 'second' });

      await act(async () => {
        requests.second!.resolve('second data');
      });
      await act(async () => {
        requests.first!.resolve('first data');
      });

      expect(result.current.data).toBe('second data');
      expect(result.current.fetching).toBe(false);
      expect(service.mock.calls).toEqual([['first'], ['second']]);
    });

    it('keeps fetching true until the latest request resolves', async () => {
      const requests: Record<string, ReturnType<typeof deferred<string>>> = {
        first: deferred<string>(),
        second: deferred<string>(),
      };
      const service = vi.fn((key: string) => requests[key]!.promise);

      const { result, rerender } = renderHook(({ key }) => useService({ service: () => service(key) }, [key]), {
        initialProps: { key: 'first' },
      });

      rerender({ key: 'second' });

      await act(async () => {
        requests.first!.resolve('first data');
      });

      expect(result.current.fetching).toBe(true);
      expect(result.current.data).toBeUndefined();

      await act(async () => {
        requests.second!.resolve('second data');
      });

      expect(result.current.fetching).toBe(false);
      expect(result.current.data).toBe('second data');
    });

    it('ignores an error from a superseded request', async () => {
      const requests: Record<string, ReturnType<typeof deferred<string>>> = {
        first: deferred<string>(),
        second: deferred<string>(),
      };
      const service = vi.fn((key: string) => requests[key]!.promise);

      const { result, rerender } = renderHook(({ key }) => useService({ service: () => service(key) }, [key]), {
        initialProps: { key: 'first' },
      });

      rerender({ key: 'second' });

      await act(async () => {
        requests.first!.reject(new Error('stale failure'));
      });
      await act(async () => {
        requests.second!.resolve('second data');
      });

      expect(result.current.data).toBe('second data');
      expect(result.current.fetching).toBe(false);
    });

    it('does not update state after unmount', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const request = deferred<string>();
      const service = vi.fn(() => request.promise);

      const { result, unmount } = renderHook(() => useService({ service }, []));

      expect(result.current.fetching).toBe(true);

      unmount();

      await act(async () => {
        request.resolve('late data');
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.fetching).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
