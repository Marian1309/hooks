import { useCallback, useEffect, useRef } from "react";

type DebouncedCallbackOptions = {
  /** Whether the callback should be called immediately on the first call */
  leading?: boolean;
  /** Whether to call the callback on the trailing edge */
  trailing?: boolean;
  /** Maximum time to wait before forcing execution */
  maxWait?: number;
  /** Whether the timer should be reset on each call */
  resetTimer?: boolean;
};

/**
 * Hook that returns a debounced version of the provided callback
 * @template T Type of the callback function
 * @param {T} callback The function to debounce
 * @param {number} delay The delay in milliseconds
 * @param {DebouncedCallbackOptions} options Configuration options
 * @returns {T & { cancel: () => void }} Debounced callback with cancel method
 *
 * @example
 * // Basic usage
 * const handleSearch = useDebouncedCallback(
 *   (query: string) => {
 *     fetchResults(query);
 *   },
 *   500
 * );
 *
 * // With leading edge execution
 * const handleScroll = useDebouncedCallback(
 *   (event: UIEvent) => {
 *     console.log(window.scrollY);
 *   },
 *   100,
 *   { leading: true }
 * );
 *
 * // With maxWait
 * const handleResize = useDebouncedCallback(
 *   () => {
 *     updateLayout();
 *   },
 *   1000,
 *   { maxWait: 2000 }
 * );
 *
 * // Cancel debounce timer
 * const debouncedSave = useDebouncedCallback(save, 1000);
 * // Later...
 * debouncedSave.cancel();
 */
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  {
    leading = false,
    trailing = true,
    maxWait,
    resetTimer = false,
  }: DebouncedCallbackOptions = {}
): T & { cancel: () => void } => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const leadingCallRef = useRef(false);
  const callbackRef = useRef(callback);
  const argsRef = useRef<any[]>([]);

  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = undefined;
    }
    leadingCallRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;

      // Handle leading edge call
      if (leading && !timeoutRef.current && !leadingCallRef.current) {
        callbackRef.current(...args);
        leadingCallRef.current = true;
      }

      // Clear existing timeout if resetTimer is true
      if (resetTimer && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set maxWait timeout if specified
      if (maxWait && !maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          callbackRef.current(...argsRef.current);
          cleanup();
        }, maxWait);
      }

      // Set main debounce timeout
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          cleanup();
        }, delay);
      }
    },
    [delay, leading, trailing, maxWait, resetTimer, cleanup]
  ) as T & { cancel: () => void };

  // Add cancel method to the debounced function
  debouncedCallback.cancel = cleanup;

  return debouncedCallback;
};

export default useDebouncedCallback;
