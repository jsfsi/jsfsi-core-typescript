import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce, useDebounce } from './useDebounce';

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fires the action exactly once after the delay elapses', () => {
    vi.useFakeTimers();
    const action = vi.fn();
    const debounced = debounce(action, 100);

    debounced('first');
    vi.advanceTimersByTime(100);

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('first');
  });

  it('cancels previous scheduled calls when invoked rapidly — only the last args reach the action', () => {
    vi.useFakeTimers();
    const action = vi.fn();
    const debounced = debounce(action, 100);

    debounced('first');
    vi.advanceTimersByTime(50);
    debounced('second');
    vi.advanceTimersByTime(50);
    debounced('third');
    vi.advanceTimersByTime(100);

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('third');
  });
});

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns a memoised function and fires the action after the delay', () => {
    vi.useFakeTimers();
    const action = vi.fn();

    const { result } = renderHook(() => useDebounce(action, 100));
    result.current('value');
    vi.advanceTimersByTime(100);

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('value');
  });

  it('returns the same function across re-renders', () => {
    const action = vi.fn();

    const { result, rerender } = renderHook(() => useDebounce(action, 100));
    const firstRender = result.current;
    rerender();
    const secondRender = result.current;

    expect(secondRender).toBe(firstRender);
  });
});
