import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api';

export interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = true, dependencies = [], onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || (response.errors && response.errors[0]) || 'En feil oppstod';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'En feil oppstod';
      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const refresh = useCallback(() => execute(), [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset
  };
}

// Specialized hook for paginated data
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginatedApiResult<T> extends UseApiResult<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; limit: number; [key: string]: any }) => Promise<ApiResponse<T[]>>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const apiResult = useApi(
    (params = {}) => apiFunction({ page, limit, ...params }),
    {
      ...apiOptions,
      dependencies: [page, limit, ...(apiOptions.dependencies || [])],
      onSuccess: (response: any) => {
        if (response.pagination) {
          setTotal(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
        apiOptions.onSuccess?.(response);
      }
    }
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const setLimitAndReset = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    ...apiResult,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage,
    previousPage,
    goToPage,
    setLimit: setLimitAndReset
  };
}

// Hook for real-time data with polling
export interface UsePollingApiOptions extends UseApiOptions {
  interval?: number;
  enabled?: boolean;
}

export function usePollingApi<T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options: UsePollingApiOptions = {}
): UseApiResult<T> {
  const { interval = 5000, enabled = true, ...apiOptions } = options;
  
  const apiResult = useApi(apiFunction, apiOptions);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (!apiResult.loading) {
        apiResult.refresh();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, apiResult.loading, apiResult.refresh]);

  return apiResult;
} 