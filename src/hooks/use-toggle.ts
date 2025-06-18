import { useCallback, useState } from "react";

type ToggleCallback = () => void;

type ToggleActions<T> = {
  /** Toggle between values */
  toggle: ToggleCallback;
  /** Set to first value */
  setFirst: ToggleCallback;
  /** Set to second value */
  setSecond: ToggleCallback;
  /** Set to specific value */
  setValue: (value: T) => void;
};

/**
 * Hook to toggle between two values
 * @template T Type of values to toggle between
 * @param {T} firstValue First value (default: false)
 * @param {T} secondValue Second value (default: true)
 * @returns {[T, ToggleActions<T>]} Current value and toggle actions
 *
 * @example
 * // Basic boolean toggle
 * const [isOpen, { toggle }] = useToggle();
 *
 * // Custom values
 * const [theme, { toggle, setValue }] = useToggle("light", "dark");
 *
 * // With all actions
 * const [value, { toggle, setFirst, setSecond, setValue }] = useToggle(1, 2);
 *
 * // With type specification
 * const [status, actions] = useToggle<"idle" | "loading">("idle", "loading");
 */

const useToggle = <T = boolean>(
  firstValue: T = false as T,
  secondValue: T = true as T
): [T, ToggleActions<T>] => {
  const [value, setValue] = useState<T>(firstValue);

  const actions: ToggleActions<T> = {
    toggle: useCallback(() => {
      setValue((current) =>
        current === firstValue ? secondValue : firstValue
      );
    }, [firstValue, secondValue]),

    setFirst: useCallback(() => {
      setValue(firstValue);
    }, [firstValue]),

    setSecond: useCallback(() => {
      setValue(secondValue);
    }, [secondValue]),

    setValue: useCallback((newValue: T) => {
      setValue(newValue);
    }, []),
  };

  return [value, actions];
};

export default useToggle;
