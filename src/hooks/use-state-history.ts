import { useCallback, useEffect, useRef, useState } from "react";
import { tryCatch } from "@pidchashyi/try-catch";

type DataHistoryOptions<T> = {
  /** Maximum number of history states to keep */
  maxHistory?: number;
  /** Key for localStorage */
  storageKey: string;
  /** Initial data state */
  initialData: T;
  /** Whether to save to localStorage */
  persist?: boolean;
  /** Custom serializer function */
  serialize?: (data: T) => string;
  /** Custom deserializer function */
  deserialize?: (data: string) => T;
  /** Debounce time for saving to localStorage (ms) */
  debounceTime?: number;
};

type DataHistoryResult<T> = {
  /** Current data state */
  data: T;
  /** Update data and add to history */
  update: (newData: T | ((prev: T) => T)) => void;
  /** Go back to previous state */
  undo: () => void;
  /** Go forward to next state if available */
  redo: () => void;
  /** Clear all history */
  clear: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current history index */
  currentIndex: number;
  /** Total history length */
  historyLength: number;
};

/**
 * Hook for managing data history with localStorage persistence
 * @template T The type of data to store
 * @param {DataHistoryOptions<T>} options Configuration options
 * @returns {DataHistoryResult<T>} History management methods and state
 *
 * @example
 * const { data, update, undo, redo, canUndo, canRedo } = useDataHistory({
 *   storageKey: 'my-data',
 *   initialData: { count: 0 },
 *   maxHistory: 50
 * });
 */
const useStateHistory = <T>({
  maxHistory = 100,
  storageKey,
  initialData,
  persist = true,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  debounceTime = 1000,
}: DataHistoryOptions<T>): DataHistoryResult<T> => {
  // State for history management
  const [history, setHistory] = useState<T[]>([initialData]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Load initial data from localStorage
  useEffect(() => {
    if (!persist) return;

    const loadFromStorage = async () => {
      const result = await tryCatch(
        Promise.resolve().then(() => {
          const stored = localStorage.getItem(storageKey);
          if (!stored) return null;
          return deserialize(stored);
        }),
        {
          onError: (error) => {
            console.error("Error loading from localStorage:", error);
          },
        }
      );

      if (result.status === "success" && result.data && isMountedRef.current) {
        setHistory([result.data]);
        setCurrentIndex(0);
      }
    };

    loadFromStorage();

    return () => {
      isMountedRef.current = false;
    };
  }, [storageKey, persist, deserialize]);

  // Save to localStorage with debouncing
  const saveToStorage = useCallback(
    (data: T) => {
      if (!persist) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const result = await tryCatch(
          Promise.resolve().then(() => {
            localStorage.setItem(storageKey, serialize(data));
          }),
          {
            onError: (error) => {
              console.error("Error saving to localStorage:", error);
            },
          }
        );

        if (result.status === "success") {
          debounceTimerRef.current = null;
        }
      }, debounceTime);
    },
    [persist, storageKey, serialize, debounceTime]
  );

  // Update data and history
  const update = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setHistory((currentHistory) => {
        const currentData = currentHistory[currentIndex];
        const nextData =
          typeof newData === "function"
            ? (newData as (prev: T) => T)(currentData)
            : newData;

        // Don't update if data hasn't changed
        if (serialize(nextData) === serialize(currentData)) {
          return currentHistory;
        }

        // Create new history array with updated data
        const newHistory = currentHistory.slice(0, currentIndex + 1);
        newHistory.push(nextData);

        // Limit history length
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          setCurrentIndex((prev) => prev - 1);
        }

        // Save to localStorage
        saveToStorage(nextData);

        return newHistory;
      });

      setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [currentIndex, maxHistory, saveToStorage, serialize]
  );

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const previousData = history[currentIndex - 1];
      saveToStorage(previousData);
    }
  }, [currentIndex, history, saveToStorage]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const nextData = history[currentIndex + 1];
      saveToStorage(nextData);
    }
  }, [currentIndex, history, saveToStorage]);

  // Clear history
  const clear = useCallback(() => {
    setHistory([initialData]);
    setCurrentIndex(0);
    if (persist) {
      localStorage.removeItem(storageKey);
    }
  }, [initialData, persist, storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    data: history[currentIndex],
    update,
    undo,
    redo,
    clear,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    currentIndex,
    historyLength: history.length,
  };
};

export default useStateHistory;
