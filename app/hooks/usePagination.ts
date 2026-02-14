// Custom hook for managing pagination state and actions
'use client';

import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function usePagination(initialPageSize = 10) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setTotal = useCallback((totalItems: number) => {
    const totalPages = Math.ceil(totalItems / state.pageSize);
    setState((prev) => ({ ...prev, totalItems, totalPages }));
  }, [state.pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page > 0 && page <= state.totalPages) {
      setPage(page);
    }
  }, [state.totalPages, setPage]);

  const nextPage = useCallback(() => {
    if (state.page < state.totalPages) {
      setPage(state.page + 1);
    }
  }, [state.page, state.totalPages, setPage]);

  const prevPage = useCallback(() => {
    if (state.page > 1) {
      setPage(state.page - 1);
    }
  }, [state.page, setPage]);

  return {
    ...state,
    setPage,
    setPageSize,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    offset: (state.page - 1) * state.pageSize,
  };
}