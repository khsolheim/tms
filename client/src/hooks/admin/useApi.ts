import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginationParams, PaginatedResponse } from '../../types/admin';

// Base API hook
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  execute: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: { immediate?: boolean } = { immediate: true }
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.errors?.[0] || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [...dependencies, fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    execute: fetchData
  };
}

// Paginated API hook
export interface UsePaginatedApiResult<T> extends UseApiResult<PaginatedResponse<T>> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePaginatedApi<T>(
  apiCall: (params: PaginationParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialParams: Partial<PaginationParams> & { immediate?: boolean } = {},
  dependencies: any[] = []
): UsePaginatedApiResult<T> {
  const { immediate, ...paginationParams } = initialParams;
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    ...paginationParams
  });

  const apiResult = useApi(
    () => apiCall(params),
    [params, ...dependencies],
    { immediate }
  );

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (apiResult.data?.pagination.hasNextPage) {
      setPage(params.page + 1);
    }
  }, [apiResult.data?.pagination.hasNextPage, params.page, setPage]);

  const previousPage = useCallback(() => {
    if (apiResult.data?.pagination.hasPreviousPage) {
      setPage(params.page - 1);
    }
  }, [apiResult.data?.pagination.hasPreviousPage, params.page, setPage]);

  return {
    ...apiResult,
    page: params.page,
    limit: params.limit,
    total: apiResult.data?.pagination.total || 0,
    totalPages: apiResult.data?.pagination.totalPages || 0,
    hasNextPage: apiResult.data?.pagination.hasNextPage || false,
    hasPreviousPage: apiResult.data?.pagination.hasPreviousPage || false,
    setPage,
    goToPage,
    setLimit,
    nextPage,
    previousPage
  };
}

// Polling API hook
export interface UsePollingApiResult<T> extends UseApiResult<T> {
  start: () => void;
  stop: () => void;
  isPolling: boolean;
}

export function usePollingApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 5000,
  autoStart: boolean = true,
  dependencies: any[] = []
): UsePollingApiResult<T> {
  const [isPolling, setIsPolling] = useState(autoStart);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const apiResult = useApi(apiCall, dependencies);

  const start = useCallback(() => {
    if (!isPolling) {
      setIsPolling(true);
      const id = setInterval(() => {
        apiResult.refresh();
      }, interval);
      setIntervalId(id);
    }
  }, [isPolling, interval, apiResult.refresh]);

  const stop = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPolling(false);
  }, [intervalId]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoStart, start, intervalId]);

  return {
    ...apiResult,
    start,
    stop,
    isPolling
  };
}

// Mutation hook for creating/updating/deleting data
export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: TData | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mutationFn(variables);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.errors?.[0] || 'Mutation failed');
        throw new Error(response.errors?.[0] || 'Mutation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      console.error('Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
} 