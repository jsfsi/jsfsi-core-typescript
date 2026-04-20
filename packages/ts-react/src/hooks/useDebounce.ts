import { useMemo } from 'react';

export const debounce = <T extends unknown[]>(action: (...args: T) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      action(...args);
    }, delay);
  };
};

export const useDebounce = <T extends unknown[]>(action: (...args: T) => void, delay: number) => {
  return useMemo(() => debounce(action, delay), []);
};
