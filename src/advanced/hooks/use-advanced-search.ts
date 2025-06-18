import { useQueryState } from "nuqs";
import { useMemo } from "react";
import fuzzysort from "fuzzysort";

/**
 * Represents a field to sort by, either in ascending or descending order.
 * Example: "name" for ascending, "-name" for descending
 */
type SortField<T> = keyof T | `${"-"}${keyof T & string}`;

/**
 * Configuration options for the advanced search hook
 */
type UseAdvancedSearchConfig<T> = {
  /** Array of object keys to perform fuzzy search on */
  keys: (keyof T)[];
  /** Default sort field and direction */
  defaultSort?: SortField<T>;
  /** Whether to include highlight information in results */
  highlight?: boolean;
};

/**
 * Search result type when highlighting is enabled
 */
type WithHighlight<T> = T & {
  _highlight: Fuzzysort.Results;
};

/**
 * Return type for the useAdvancedSearch hook
 */
type UseAdvancedSearchReturn<T> = {
  /** Current search query */
  query: string | null;
  /** Function to update search query */
  setQuery: (value: string | null) => void;
  /** Current active filters */
  filters: Partial<Record<keyof T, string>> | null;
  /** Function to update filters */
  setFilters: (value: Partial<Record<keyof T, string>> | null) => void;
  /** Current sort field and direction */
  sortBy: SortField<T> | null;
  /** Function to update sort field */
  setSortBy: (value: SortField<T> | null) => void;
  /** Filtered and sorted search results */
  results: (T | WithHighlight<T>)[];
};

/**
 * A custom hook for advanced searching, filtering, and sorting of data
 * @param data Array of items to search through
 * @param config Search configuration options
 * @returns Object containing search state and results
 */
const useAdvancedSearch = <T extends Record<string, any>>(
  data: T[],
  config: UseAdvancedSearchConfig<T>
): UseAdvancedSearchReturn<T> => {
  const [query, setQuery] = useQueryState("q");
  const [sortBy, setSortBy] = useQueryState<SortField<T> | null>("sort", {
    history: "replace",
    parse: (val) => (val ? JSON.parse(val) : null),
    serialize: (val) => (val ? JSON.stringify(val) : ""),
  });
  const [filters, setFilters] = useQueryState<Partial<Record<keyof T, string>>>(
    "filters",
    {
      history: "replace",
      parse: (val) => (val ? JSON.parse(val) : {}),
      serialize: (val) => JSON.stringify(val),
    }
  );

  const results = useMemo(() => {
    let filtered: T[] = [...data];

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value != null) {
          filtered = filtered.filter(
            (item) => String(item[key as keyof T]) === value
          );
        }
      }
    }

    // Fuzzy search
    if (query) {
      const fuzzed = fuzzysort.go(query, filtered, {
        keys: config.keys as string[],
        threshold: -10000,
        limit: 50,
      });

      filtered = fuzzed.map((res) => {
        return {
          ...(res.obj as T),
          ...(config.highlight ? { _highlight: res } : {}),
        };
      });
    }

    const sortKey = sortBy || config.defaultSort;
    if (sortKey) {
      const field = (
        typeof sortKey === "string" && sortKey.startsWith("-")
          ? sortKey.slice(1)
          : sortKey
      ) as keyof T;
      const direction =
        typeof sortKey === "string" && sortKey.startsWith("-") ? -1 : 1;

      filtered.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        return aVal > bVal ? direction : aVal < bVal ? -direction : 0;
      });
    }

    return filtered;
  }, [data, query, filters, sortBy, config]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    results,
  } satisfies UseAdvancedSearchReturn<T>;
};

export type {
  UseAdvancedSearchConfig,
  UseAdvancedSearchReturn,
  SortField,
  WithHighlight,
};
export default useAdvancedSearch;
