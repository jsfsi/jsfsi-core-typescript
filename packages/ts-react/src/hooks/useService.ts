import { type DependencyList, useCallback, useEffect, useRef, useState } from 'react';

type UseServiceResult<T> = {
  data?: T;
  fetching: boolean;
  refetch: () => void;
};

export function useService<T = Record<string, unknown>>(
  {
    service,
    staleData = false,
  }: {
    service: (isRefetching: boolean) => Promise<T> | T;
    staleData?: boolean;
  },
  dependencies: DependencyList,
): UseServiceResult<T> {
  const [error, setError] = useState<Error>();
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState<T>();
  const latestRequestRef = useRef(0);

  const getData = useCallback(async (isRefetching: boolean) => {
    const requestId = ++latestRequestRef.current;
    const isLatest = (): boolean => requestId === latestRequestRef.current;

    if (!staleData) {
      setData(undefined);
    }

    try {
      setFetching(true);
      const serviceData = await service(isRefetching);
      if (isLatest()) {
        setData(serviceData);
      }
    } catch (err) {
      if (isLatest()) {
        setError(err as Error);
      }
    } finally {
      if (isLatest()) {
        setFetching(false);
      }
    }
  }, dependencies);

  const refetch = useCallback(async () => {
    void getData(true);
  }, [getData, ...dependencies]);

  useEffect(() => {
    void getData(false);

    return () => {
      latestRequestRef.current += 1;
    };
  }, dependencies);

  if (error) {
    setError(undefined);
    throw error;
  }

  return { data, fetching, refetch };
}
