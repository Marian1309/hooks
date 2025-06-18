import { useState, useCallback } from "react";

type ArrayActions<T> = {
  /** The current array */
  array: T[];
  /** Set the entire array */
  set: (array: T[]) => void;
  /** Add an item to the end of the array */
  push: (item: T) => void;
  /** Remove an item at a specific index */
  remove: (index: number) => void;
  /** Remove items that match the filter */
  filter: (callback: (item: T, index: number) => boolean) => void;
  /** Update an item at a specific index */
  update: (index: number, item: T) => void;
  /** Clear the array */
  clear: () => void;
  /** Add an item at a specific index */
  insertAt: (index: number, item: T) => void;
  /** Remove the last item and return it */
  pop: () => T | undefined;
  /** Map over the array and update all items */
  updateAll: (callback: (item: T, index: number) => T) => void;
};

/**
 * Hook to manage an array with utility methods
 * @template T The type of items in the array
 * @param {T[]} initialArray The initial array
 * @returns {ArrayActions<T>} Object containing the array and utility methods
 *
 * @example
 * // Basic usage with numbers
 * const {
 *   array,
 *   push,
 *   remove,
 *   update
 * } = useArray([1, 2, 3]);
 *
 * // Push a new number
 * push(4); // [1, 2, 3, 4]
 *
 * // Remove at index
 * remove(1); // [1, 3, 4]
 *
 * // Update at index
 * update(0, 10); // [10, 3, 4]
 *
 * // With objects
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const {
 *   array: users,
 *   push: addUser,
 *   filter: filterUsers
 * } = useArray<User>([]);
 *
 * // Add a user
 * addUser({ id: 1, name: "John" });
 *
 * // Filter active users
 * filterUsers(user => user.id !== 1);
 */
const useArray = <T>(initialArray: T[] = []): ArrayActions<T> => {
  const [array, setArray] = useState<T[]>(initialArray);

  const push = useCallback((item: T) => {
    setArray((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((index: number) => {
    setArray((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, []);

  const update = useCallback((index: number, item: T) => {
    setArray((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return [...prev.slice(0, index), item, ...prev.slice(index + 1)];
    });
  }, []);

  const filter = useCallback(
    (callback: (item: T, index: number) => boolean) => {
      setArray((prev) => prev.filter(callback));
    },
    []
  );

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  const set = useCallback((newArray: T[]) => {
    setArray(newArray);
  }, []);

  const insertAt = useCallback((index: number, item: T) => {
    setArray((prev) => {
      if (index < 0) return [item, ...prev];
      if (index >= prev.length) return [...prev, item];
      return [...prev.slice(0, index), item, ...prev.slice(index)];
    });
  }, []);

  const pop = useCallback((): T | undefined => {
    let item: T | undefined;
    setArray((prev) => {
      if (prev.length === 0) return prev;
      item = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return item;
  }, []);

  const updateAll = useCallback((callback: (item: T, index: number) => T) => {
    setArray((prev) => prev.map(callback));
  }, []);

  return {
    array,
    set,
    push,
    remove,
    filter,
    update,
    clear,
    insertAt,
    pop,
    updateAll,
  };
};

export default useArray;
