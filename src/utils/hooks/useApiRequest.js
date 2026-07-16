/**
 * useApiRequest.js
 * A reusable hook that wraps any async API call with loading / error / retry state.
 *
 * Usage:
 *   const { data, isLoading, isError, errorInfo, retry } = useApiRequest(fetchFn, deps);
 *
 * - fetchFn  : () => Promise<data>   — the function that calls the API
 * - deps     : any[]                 — re-runs whenever these values change (like useEffect deps)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseApiError } from '@/utils/APIs/parseApiError';

/**
 * @template T
 * @param {() => Promise<T>} fetchFn
 * @param {any[]} [deps=[]]
 * @returns {{
 *   data: T | null,
 *   isLoading: boolean,
 *   isError: boolean,
 *   errorInfo: import('@/utils/APIs/parseApiError').ParsedError | null,
 *   retry: () => void,
 * }}
 */
export function useApiRequest(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // Track current fetch so stale responses are ignored after unmount / retry
  const abortRef = useRef(false);

  const execute = useCallback(async () => {
    abortRef.current = false;
    setIsLoading(true);
    setIsError(false);
    setErrorInfo(null);

    try {
      const result = await fetchFn();
      if (!abortRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!abortRef.current) {
        setIsError(true);
        setErrorInfo(parseApiError(err));
      }
    } finally {
      if (!abortRef.current) {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
    return () => {
      abortRef.current = true;
    };
  }, [execute]);

  /** Re-triggers the fetch and resets error state */
  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return { data, isLoading, isError, errorInfo, retry };
}
