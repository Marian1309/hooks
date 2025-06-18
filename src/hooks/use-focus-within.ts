import { useEffect, useState, useCallback } from "react";

type UseFocusWithinOptions = {
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Callback when focus enters the container */
  onFocusWithin?: (event: FocusEvent) => void;
  /** Callback when focus leaves the container */
  onBlurWithin?: (event: FocusEvent) => void;
  /** Whether to ignore focus changes within the container */
  ignoreInternalFocus?: boolean;
};

/**
 * Hook to detect if any element within a container has focus
 * @param {string} target CSS selector for the container element (id or class)
 * @param {UseFocusWithinOptions} options Configuration options
 * @returns {boolean} Whether any element within the container has focus
 *
 * @example
 * // Basic usage with ID
 * const isFormFocused = useFocusWithin("#login-form");
 *
 * // Using with class
 * const isNavFocused = useFocusWithin(".navigation");
 *
 * // With callbacks
 * const isFocused = useFocusWithin("#search-box", {
 *   onFocusWithin: (e) => console.log("Search box focused", e),
 *   onBlurWithin: (e) => console.log("Search box blurred", e)
 * });
 *
 * // Ignore internal focus changes
 * const isModalFocused = useFocusWithin("#modal", {
 *   ignoreInternalFocus: true
 * });
 */
const useFocusWithin = (
  target: string,
  {
    enabled = true,
    onFocusWithin,
    onBlurWithin,
    ignoreInternalFocus = false,
  }: UseFocusWithinOptions = {}
): boolean => {
  const [isFocusWithin, setIsFocusWithin] = useState<boolean>(false);

  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      if (!enabled) return;

      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      // Check if the newly focused element is within our target container
      if (targetElement.contains(event.target as Node)) {
        // If we're ignoring internal focus changes and we're already focused, do nothing
        if (ignoreInternalFocus && isFocusWithin) return;

        setIsFocusWithin(true);
        onFocusWithin?.(event);
      }
    },
    [enabled, target, isFocusWithin, ignoreInternalFocus, onFocusWithin]
  );

  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      if (!enabled) return;

      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      // Use requestAnimationFrame to wait for the next focused element
      requestAnimationFrame(() => {
        // Check if the new activeElement is still within our target
        const isWithinTarget = targetElement.contains(document.activeElement);

        if (!isWithinTarget) {
          setIsFocusWithin(false);
          onBlurWithin?.(event);
        }
      });
    },
    [enabled, target, onBlurWithin]
  );

  useEffect(() => {
    if (!enabled) {
      setIsFocusWithin(false);
      return;
    }

    const targetElement = document.querySelector(target);

    if (!targetElement) {
      console.warn(`Element with selector "${target}" not found`);
      return;
    }

    // Check initial focus state
    const hasFocus = targetElement.contains(document.activeElement);
    setIsFocusWithin(hasFocus);

    // Add event listeners
    document.addEventListener("focusin", handleFocusIn as EventListener);
    document.addEventListener("focusout", handleFocusOut as EventListener);

    return () => {
      document.removeEventListener("focusin", handleFocusIn as EventListener);
      document.removeEventListener("focusout", handleFocusOut as EventListener);
    };
  }, [enabled, target, handleFocusIn, handleFocusOut]);

  return isFocusWithin;
};

export default useFocusWithin;
