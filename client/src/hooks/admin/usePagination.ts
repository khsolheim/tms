import { useState, useMemo, useCallback } from 'react';

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  limitOptions?: number[];
}

export interface UsePaginationResult {
  page: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  goToPage: (page: number) => void;
  setTotal: (total: number) => void;
  getPageNumbers: () => number[];
  reset: () => void;
}

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const {
    initialPage = 1,
    initialLimit = 10,
    limitOptions = [5, 10, 25, 50, 100]
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  const hasNextPage = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return page > 1;
  }, [page]);

  const setPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageState(newPage);
    }
  }, [totalPages]);

  const setLimit = useCallback((newLimit: number) => {
    if (limitOptions.includes(newLimit)) {
      setLimitState(newLimit);
      setPageState(1); // Reset to first page when changing limit
    }
  }, [limitOptions]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageState(page + 1);
    }
  }, [hasNextPage, page]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPageState(page - 1);
    }
  }, [hasPreviousPage, page]);

  const firstPage = useCallback(() => {
    setPageState(1);
  }, []);

  const lastPage = useCallback(() => {
    setPageState(totalPages);
  }, [totalPages]);

  const goToPage = useCallback((targetPage: number) => {
    setPage(targetPage);
  }, [setPage]);

  const getPageNumbers = useCallback(() => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, -1); // -1 represents dots
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages); // -1 represents dots
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [page, totalPages]);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    offset,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    goToPage,
    setTotal,
    getPageNumbers,
    reset
  };
}

// Hook for client-side pagination of data
export function useClientPagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
) {
  const pagination = usePagination(options);
  
  // Update total when data changes
  useMemo(() => {
    pagination.setTotal(data.length);
  }, [data.length, pagination]);

  const paginatedData = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.limit;
    return data.slice(start, end);
  }, [data, pagination.offset, pagination.limit]);

  return {
    ...pagination,
    data: paginatedData,
    allData: data
  };
} 