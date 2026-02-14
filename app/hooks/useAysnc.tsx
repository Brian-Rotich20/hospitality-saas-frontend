// Custom hook for managing asynchronous operations, including loading state, error handling, and data management
'use client';

import { useEffect, useReducer, useRef } from 'react';

// State interface for the async operation, including data, loading status, and error
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncAction<T> =
  | { type: 'PENDING' }
  | { type: 'SUCCESS'; payload: T }
  | { type: 'ERROR'; payload: Error };

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, dispatch] = useReducer( 
    (
      state: AsyncState<T>,
      action: AsyncAction<T>
    ): AsyncState<T> => {
      switch (action.type) {
        case 'PENDING':
          return { ...state, loading: true, error: null };
        case 'SUCCESS':
          return { data: action.payload, loading: false, error: null };
        case 'ERROR':
          return { ...state, loading: false, error: action.payload };
        default:
          return state;
      }
    },
    {
      data: null,
      loading: immediate,
      error: null,
    }
  );

  const isMounted = useRef(true);

  const execute = async () => {
    dispatch({ type: 'PENDING' });
    try {
      const response = await asyncFunction();
      if (isMounted.current) {
        dispatch({ type: 'SUCCESS', payload: response });
      }
    } catch (error) {
      if (isMounted.current) {
        dispatch({
          type: 'ERROR',
          payload: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { ...state, execute };
}