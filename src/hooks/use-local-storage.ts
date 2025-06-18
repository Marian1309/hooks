import { useCallback, useEffect, useState } from "react";

type LocalStorageOptions<T> = {
  /** Initial value if localStorage is empty */
  initialValue?: T;
  /** Whether to serialize the value as JSON (default: true) */
  serialize?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
};

type LocalStorageResult<T> = {
  /** Current stored value */
  value: T | null;
  /** Set a new value in localStorage */
  set: (value: T | ((prev: T | null) => T)) => void;
  /** Remove the value from localStorage */
  remove: () => void;
  /** Check if the value exists in localStorage */
  exists: () => boolean;
};

/**
 * Hook to persist and sync state with localStorage
 * @template T The type of value being stored
 * @param {string} key The localStorage key
 * @param {LocalStorageOptions<T>} options Configuration options
 * @returns {LocalStorageResult<T>} Object containing the value and methods to manage it
 * @example
 * // Basic usage
 * const { value, set } = useLocalStorage<string>("user-theme");
 *
 * // With initial value
 * const { value, set } = useLocalStorage<User>("user", {
 *   initialValue: { name: "Guest" }
 * });
 *
 * // Without JSON serialization (for strings)
 * const { value } = useLocalStorage<string>("token", {
 *   serialize: false
 * });
 */
const useLocalStorage = <T>(
  key: string,
  options: LocalStorageOptions<T> = {}
): LocalStorageResult<T> => {
  const {
    initialValue = null,
    serialize = true,
    onError = (error: Error) => console.warn(`localStorage error:`, error),
  } = options;

  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return serialize ? JSON.parse(item) : item;
      }
      // If no value exists, set initial value in localStorage
      if (initialValue !== null) {
        const value = serialize ? JSON.stringify(initialValue) : initialValue;
        window.localStorage.setItem(key, value as string);
      }
      return initialValue;
    } catch (error) {
      onError(error as Error);
      return initialValue;
    }
  });

  // Handle updates to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T | null) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        const serializedValue = serialize
          ? JSON.stringify(valueToStore)
          : (valueToStore as string);
        window.localStorage.setItem(key, serializedValue);
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, serialize, onError, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      onError(error as Error);
    }
  }, [key, onError]);

  // Check if value exists
  const exists = useCallback(() => {
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = serialize
            ? JSON.parse(event.newValue)
            : event.newValue;
          setStoredValue(newValue);
        } catch (error) {
          onError(error as Error);
          setStoredValue(null);
        }
      } else if (event.key === key) {
        // Handle removal
        setStoredValue(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, serialize, onError]);

  return {
    value: storedValue,
    set: setValue,
    remove: removeValue,
    exists,
  };
};

export default useLocalStorage;
