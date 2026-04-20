import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './useIsMobile';

const setInnerWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value,
  });
};

describe('useIsMobile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when window.innerWidth is greater than or equal to the mobile breakpoint', () => {
    setInnerWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns true when window.innerWidth is below the mobile breakpoint', () => {
    setInnerWidth(500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('updates the returned value when the matchMedia change listener fires', () => {
    setInnerWidth(1024);
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    const [, onChange] = addEventListener.mock.calls[0]!;
    setInnerWidth(500);
    act(() => {
      onChange();
    });

    expect(result.current).toBe(true);
  });

  it('removes the matchMedia change listener on unmount with the same handler that was added', () => {
    setInnerWidth(1024);
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useIsMobile());
    const [, registeredHandler] = addEventListener.mock.calls[0]!;
    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith('change', registeredHandler);
  });
});
