import { useCallback, useEffect, useRef } from "react";

type NodeSelector = string;
type ClickCallback<T extends HTMLElement = HTMLElement> = (
  element: T,
  event: MouseEvent
) => void;

type NodeClickOptions = {
  /** Whether to enable click detection (default: true) */
  enabled?: boolean;
  /** Whether to stop event propagation (default: false) */
  stopPropagation?: boolean;
  /** Whether to prevent default behavior (default: false) */
  preventDefault?: boolean;
  /** Whether to handle touch events (default: true) */
  handleTouch?: boolean;
};

/**
 * Hook to handle clicks on elements matching a selector (class or ID)
 * @template T HTML element type
 * @param {NodeSelector} selector CSS selector to match elements
 * @param {NodeClickOptions} options Configuration options
 * @returns {(callback: ClickCallback<T>) => void} Function to set click handler
 *
 * @example
 * // Basic usage with class
 * const handleClickInside = useClickInside(".clickable");
 *
 * useEffect(() => {
 *   handleClickInside((element, event) => {
 *     console.log("Clicked element:", element);
 *   });
 * }, [handleClickInside]);
 *
 * // With ID and options
 * const handleButtonClick = useClickInside("#submit-button", {
 *   preventDefault: true,
 *   stopPropagation: true
 * });
 *
 * // With specific element type
 * const handleImageClick = useClickInside<HTMLImageElement>(".gallery-image");
 * handleImageClick((img, event) => {
 *   console.log("Image src:", img.src);
 * });
 */
const useClickInside = <T extends HTMLElement = HTMLElement>(
  selector: NodeSelector,
  {
    enabled = true,
    stopPropagation = false,
    preventDefault = false,
    handleTouch = true,
  }: NodeClickOptions = {}
): ((callback: ClickCallback<T>) => void) => {
  // Store the current callback in a ref
  const callbackRef = useRef<ClickCallback<T> | null>(null);

  // Handle click events
  const clickHandler = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!enabled || !callbackRef.current) return;

      // Get the clicked element
      const target = event.target as HTMLElement;
      const matchingElement = target.closest(selector) as T;

      if (matchingElement) {
        if (stopPropagation) {
          event.stopPropagation();
        }
        if (preventDefault) {
          event.preventDefault();
        }

        // Call the callback with the matching element and event
        callbackRef.current(matchingElement, event as MouseEvent);
      }
    },
    [selector, enabled, stopPropagation, preventDefault]
  );

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("click", clickHandler);

    if (handleTouch) {
      document.addEventListener("touchend", clickHandler);
    }

    return () => {
      document.removeEventListener("click", clickHandler);
      if (handleTouch) {
        document.removeEventListener("touchend", clickHandler);
      }
    };
  }, [enabled, handleTouch, clickHandler]);

  // Return function to set the callback
  return useCallback((callback: ClickCallback<T>) => {
    callbackRef.current = callback;
  }, []);
};

export default useClickInside;
