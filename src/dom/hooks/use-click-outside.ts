import { useEffect, useCallback, RefObject } from "react";

type EventType = "mousedown" | "mouseup" | "touchstart" | "touchend";

type UseClickOutsideOptions = {
  /** Events to listen for (default: ["mousedown"]) */
  events?: EventType[];
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Custom condition to determine if click should be handled */
  shouldHandle?: (event: MouseEvent | TouchEvent) => boolean;
  /** Whether to prevent event propagation */
  stopPropagation?: boolean;
  /** Whether to prevent default event behavior */
  preventDefault?: boolean;
};

/**
 * Hook to detect clicks outside of a specified element
 * @param {RefObject<HTMLElement | null>} ref Reference to the element to detect clicks outside of
 * @param {(event: MouseEvent | TouchEvent) => void} handler Callback when click outside is detected
 * @param {UseClickOutsideOptions} options Configuration options
 *
 * @example
 * // Basic usage
 * const modalRef = useRef(null);
 * useClickOutside(modalRef, () => {
 *   closeModal();
 * });
 *
 * // With custom events
 * const dropdownRef = useRef(null);
 * useClickOutside(dropdownRef, closeDropdown, {
 *   events: ["mousedown", "touchstart"]
 * });
 *
 * // With custom handling
 * const menuRef = useRef(null);
 * useClickOutside(menuRef, closeMenu, {
 *   shouldHandle: (event) => {
 *     const target = event.target as HTMLElement;
 *     return !target.closest(".menu-trigger");
 *   }
 * });
 *
 * // Multiple refs
 * const [ref1, ref2] = [useRef(null), useRef(null)];
 * useClickOutside([ref1, ref2], () => {
 *   closeAllMenus();
 * });
 */
const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | Array<RefObject<T>>,
  handler: (event: MouseEvent | TouchEvent) => void,
  {
    events = ["mousedown"],
    enabled = true,
    shouldHandle = () => true,
    stopPropagation = false,
    preventDefault = false,
  }: UseClickOutsideOptions = {}
): void => {
  // Convert single ref to array for consistent handling
  const refs = Array.isArray(ref) ? ref : [ref];

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!enabled) return;

      // Get the actual event target accounting for Shadow DOM
      const path = event.composedPath?.() || [];
      const target = (path[0] || event.target) as Node;

      // Check if click target is not within any of the refs
      const isOutside = refs.every((ref) => {
        const element = ref.current;
        return element && !element.contains(target);
      });

      if (isOutside && shouldHandle(event)) {
        if (stopPropagation) {
          event.stopPropagation();
        }
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [refs, handler, enabled, shouldHandle, stopPropagation, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleClickOutside as EventListener, {
        // Use capture phase to handle clicks before they reach other handlers
        capture: true,
      });
    });

    return () => {
      // Clean up event listeners
      events.forEach((event) => {
        document.removeEventListener(
          event,
          handleClickOutside as EventListener,
          {
            capture: true,
          }
        );
      });
    };
  }, [events, enabled, handleClickOutside]);
};

export default useClickOutside;
