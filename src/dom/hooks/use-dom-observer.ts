import { useCallback, useEffect, useRef } from "react";

type ObserverOptions = {
  /** Run callback only once when element is found (default: true) */
  once?: boolean;
  /** Timeout in ms to stop observing if element is not found (default: 0 - no timeout) */
  timeout?: number;
  /** Mutation observer options */
  observerOptions?: MutationObserverInit;
  /** Callback when element is not found after timeout */
  onTimeout?: () => void;
  /** Whether to run callback immediately if element exists (default: true) */
  immediate?: boolean;
};

const DEFAULT_OBSERVER_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
};

/**
 * Hook to observe DOM for an element and execute callback when found
 * @param selector CSS selector to find element
 * @param callback Function to execute when element is found
 * @param options Configuration options
 * @example
 * // Basic usage - run once when element is found
 * useDOMObserver("#my-element", (element) => {
 *   console.log("Element found:", element);
 * });
 *
 * // Continuous observation
 * useDOMObserver(".dynamic-content", (element) => {
 *   console.log("Content updated:", element);
 * }, { once: false });
 *
 * // With timeout
 * useDOMObserver("#lazy-loaded", (element) => {
 *   element.scrollIntoView();
 * }, {
 *   timeout: 5000,
 *   onTimeout: () => console.log("Element not found after 5s")
 * });
 */
const useDOMObserver = (
  selector: string,
  callback: (element: Element) => void,
  {
    once = true,
    timeout = 0,
    observerOptions = DEFAULT_OBSERVER_OPTIONS,
    onTimeout,
    immediate = true,
  }: ObserverOptions = {}
): void => {
  // Keep reference to the latest callback
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Store timeout ID for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized element checker
  const checkElement = useCallback(() => {
    const element = document.querySelector(selector);
    if (element) {
      callbackRef.current(element);
      return true;
    }
    return false;
  }, [selector]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check immediately if requested
    if (immediate && checkElement() && once) {
      return; // Exit early if element found and once is true
    }

    // Set up mutation observer
    const observer = new MutationObserver(() => {
      if (checkElement() && once) {
        observer.disconnect();
      }
    });

    // Start observing
    observer.observe(document.body, observerOptions);

    // Set timeout if specified
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        observer.disconnect();
        onTimeout?.();
      }, timeout);
    }

    // Cleanup
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    selector,
    once,
    timeout,
    observerOptions,
    onTimeout,
    immediate,
    checkElement,
  ]);
};

export default useDOMObserver;
