import { useEffect, useRef } from "react";

/**
 * Hook to keep track of a value from the previous render
 * @template T The type of value to track
 * @param {T} value The value to track
 * @returns {T | undefined} The value from the previous render
 *
 * @example
 * // Basic usage
 * const counter = useState(0);
 * const previousCounter = usePreviousValue(counter);
 *
 * // With objects
 * const [user, setUser] = useState<User>();
 * const previousUser = usePreviousValue(user);
 *
 * // Compare changes
 * useEffect(() => {
 *   if (previousValue !== currentValue) {
 *     console.log("Value changed from", previousValue, "to", currentValue);
 *   }
 * }, [previousValue, currentValue]);
 *
 * // With undefined check
 * const prevValue = usePreviousValue(value);
 * const hasChanged = prevValue !== undefined && prevValue !== value;
 */
const usePreviousValue = <T>(value: T): T | undefined => {
  // Keep track of previous value in a ref
  const previousRef = useRef<T>(value);

  // Update previous value after each render
  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  // Return previous value (will be undefined on first render)
  return previousRef.current;
};

export default usePreviousValue;
