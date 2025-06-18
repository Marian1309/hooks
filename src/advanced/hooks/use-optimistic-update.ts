import { tryCatch } from "@pidchashyi/try-catch";
import { useState } from "react";

/**
 * Supported mutation types for optimistic updates
 */
type UpdateType = "add" | "remove";

/**
 * Represents an update action with the type of mutation and item to be updated
 */
type UpdateAction<T> = {
  /** Type of mutation to perform */
  type: UpdateType;
  /** Item to be added or removed */
  item: T;
};

/**
 * Configuration options for the optimistic update hook
 */
type OptimisticUpdateConfig<T> = {
  /** Initial array of data */
  initialData: T[];
  /** Callback function to perform the actual mutation */
  onMutate: (updatedData: T[]) => Promise<void>;
  /** Function to extract unique identifier from an item */
  getId: (item: T) => string | number;
};

/**
 * Return type for the useOptimisticUpdate hook
 */
type OptimisticUpdateReturn<T> = {
  /** Current state of the data */
  data: T[];
  /** Error state if mutation fails */
  error: Error | null;
  /** Function to perform optimistic updates */
  update: (action: UpdateAction<T>) => Promise<void>;
};

/**
 * A custom hook for handling optimistic updates in arrays of data
 *
 * @example
 * ```typescript
 * const { data, error, update } = useOptimisticUpdate({
 *   initialData: todos,
 *   onMutate: async (updatedTodos) => {
 *     await api.updateTodos(updatedTodos);
 *   },
 *   getId: (todo) => todo.id
 * });
 *
 * // Add item optimistically
 * await update({ type: 'add', item: newTodo });
 *
 * // Remove item optimistically
 * await update({ type: 'remove', item: todoToRemove });
 * ```
 */
const useOptimisticUpdate = <T extends Record<string, any>>({
  initialData,
  onMutate,
  getId,
}: OptimisticUpdateConfig<T>): OptimisticUpdateReturn<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [error, setError] = useState<Error | null>(null);

  const update = async ({ type, item }: UpdateAction<T>): Promise<void> => {
    const itemId = getId(item);
    let newData: T[];

    if (type === "add") {
      newData = [...data, item];
    } else if (type === "remove") {
      newData = data.filter((d) => getId(d) !== itemId);
    } else {
      return;
    }

    const prevData = data;
    setData(newData);
    setError(null);

    const { error } = await tryCatch(onMutate(newData));

    if (error) {
      console.error("Optimistic update failed, reverting", error);
      setData(prevData);
      setError(error);
    }
  };

  return {
    data,
    error,
    update,
  } satisfies OptimisticUpdateReturn<T>;
};

export type {
  UpdateType,
  UpdateAction,
  OptimisticUpdateConfig,
  OptimisticUpdateReturn,
};

export default useOptimisticUpdate;
