import { useCallback, useEffect, useState, type DependencyList } from 'react';

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

  const getData = useCallback(async (isRefetching: boolean) => {
    if (!staleData) {
      setData(undefined);
    }

    try {
      setFetching(true);
      const serviceData = await service(isRefetching);
      setData(serviceData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setFetching(false);
    }
  }, dependencies);

  const refetch = useCallback(async () => {
    void getData(true);
  }, [getData, ...dependencies]);

  useEffect(() => {
    void getData(false);
  }, dependencies);

  if (error) {
    setError(undefined);
    throw error;
  }

  return { data, fetching, refetch };
}
