import { useCallback, useEffect, useRef, useState } from "react";
import { tryCatch } from "@pidchashyi/try-catch";

type FetchStatus = "idle" | "loading" | "success" | "error";

type UseFetchOptions<T, E = Error> = {
  /** Initial data before fetch completes */
  initialData?: T;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Cache duration in milliseconds (0 to disable) */
  cacheDuration?: number;
  /** Request headers */
  headers?: HeadersInit;
  /** Request options (extends Fetch API options) */
  options?: RequestInit;
  /** Transform response before setting data */
  transform?: (data: any) => T;
  /** Callback on fetch success */
  onSuccess?: (data: T) => void;
  /** Callback on fetch error */
  onError?: (error: E) => void;
  /** Dependencies array for refetching */
  deps?: any[];
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type UseFetchResult<T, E = Error> = {
  /** Fetched data */
  data: T | null;
  /** Current fetch status */
  status: FetchStatus;
  /** Error if fetch failed */
  error: E | null;
  /** Whether fetch is in progress */
  isLoading: boolean;
  /** Manually trigger fetch */
  refetch: () => Promise<void>;
  /** Cancel ongoing fetch */
  cancel: () => void;
};

// Cache storage
const cache = new Map<string, CacheEntry<any>>();

/**
 * Hook for data fetching with type-safe error handling using try-catch
 * @template T The type of data being fetched
 * @template E The type of error that can occur
 * @param {string} url The URL to fetch from
 * @param {UseFetchOptions<T, E>} options Configuration options
 * @returns {UseFetchResult<T, E>} Fetch result object
 *
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useFetch<User>("/api/user");
 *
 * // With options and error typing
 * const { data, refetch } = useFetch<Post[], ApiError>("/api/posts", {
 *   initialData: [],
 *   autoFetch: true,
 *   cacheDuration: 60000, // 1 minute
 *   headers: {
 *     "Authorization": "Bearer token"
 *   },
 *   transform: (data) => data.map(transformPost),
 *   onSuccess: (posts) => console.log("Posts loaded:", posts.length)
 * });
 */
const useFetch = <T, E = Error>(
  url: string,
  {
    initialData,
    autoFetch = true,
    cacheDuration = 0,
    headers,
    options = {},
    transform,
    onSuccess,
    onError,
    deps = [],
  }: UseFetchOptions<T, E> = {}
): UseFetchResult<T, E> => {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<E | null>(null);

  // Use refs for values that shouldn't trigger re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Check cache and return cached data if valid
  const getCachedData = useCallback((): T | null => {
    if (cacheDuration === 0) return null;

    const cached = cache.get(url);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheDuration;
    return isExpired ? null : cached.data;
  }, [url, cacheDuration]);

  // Update cache
  const updateCache = useCallback(
    (newData: T) => {
      if (cacheDuration > 0) {
        cache.set(url, {
          data: newData,
          timestamp: Date.now(),
        });
      }
    },
    [url, cacheDuration]
  );

  // Main fetch function
  const fetchData = useCallback(async (): Promise<void> => {
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setStatus("success");
      onSuccess?.(cachedData);
      return;
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setStatus("loading");
    setError(null);

    const result = await tryCatch(
      fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }),
      {
        select: transform,
        onError: (err) => {
          if (isMountedRef.current) {
            setError(err as E);
            setStatus("error");
            onError?.(err as E);
          }
        },
        onFinally: () => {
          abortControllerRef.current = null;
        },
      }
    );

    // Only update state if component is still mounted
    if (isMountedRef.current) {
      if (result.status === "success") {
        setData(result.data);
        setStatus("success");
        updateCache(result.data);
        onSuccess?.(result.data);
      }
    }
  }, [
    url,
    options,
    headers,
    transform,
    onSuccess,
    onError,
    getCachedData,
    updateCache,
  ]);

  // Cancel fetch
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Effect for auto-fetching and cleanup
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, [autoFetch, fetchData, cancel, ...deps]);

  return {
    data,
    status,
    error,
    isLoading: status === "loading",
    refetch: fetchData,
    cancel,
  };
};

export default useFetch;
