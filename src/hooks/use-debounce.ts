import { useEffect, useState } from "react";

/**
 * Hook that delays updating a value until after a specified delay
 * @template T The type of the value being debounced
 * @param {T} value The value to debounce
 * @param {number} [delay=500] The delay in milliseconds (defaults to 500ms)
 * @returns {T} The debounced value
 * @example
 * const searchTerm = "hello";
 * const debouncedSearch = useDebounce(searchTerm); // Updates after 500ms
 * // or with custom delay
 * const debouncedValue = useDebounce(value, 1000); // Updates after 1s
 */
const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Don't create a timer if delay is 0
    if (delay === 0) {
      setDebouncedValue(value);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout on value/delay change or unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
