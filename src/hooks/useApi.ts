import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// ─── Generic API call hook ────────────────────────────────
export const useApiCall = <T = any, E = any>(
  asyncFn: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: E | null;
  execute: () => Promise<T | null>;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorData = err as AxiosError<any>;
      const errorMessage = errorData?.response?.data?.message || 'An error occurred';
      setError(errorMessage as any);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, execute };
};

// ─── Handle form submission ────────────────────────────────
export const useFormSubmit = <T = any>(
  onSubmit: (data: T) => Promise<any>,
  onSuccess?: () => void
): {
  loading: boolean;
  error: string | null;
  handleSubmit: (data: T) => Promise<void>;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data: T) => {
      setLoading(true);
      setError(null);
      try {
        await onSubmit(data);
        toast.success('Operation successful!');
        onSuccess?.();
      } catch (err) {
        const errorData = err as AxiosError<any>;
        const errorMessage = errorData?.response?.data?.message || 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, onSuccess]
  );

  return { loading, error, handleSubmit };
};

// ─── Fetch paginated data ─────────────────────────────────
export const usePagination = <T = any>(
  fetchFn: (page: number, limit: number) => Promise<any>
): {
  items: T[];
  page: number;
  total: number;
  pages: number;
  loading: boolean;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
} => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchFn(page, 10);
      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);
      setPages(response.pagination?.pages || 0);
    } catch (err) {
      console.error('Pagination fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page]);

  return { items, page, total, pages, loading, setPage, refetch };
};

// ─── Debounce hook ────────────────────────────────────────
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

import { useEffect } from 'react';
