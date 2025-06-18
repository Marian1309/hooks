import { useCallback, useEffect, useRef, useState } from "react";
import { tryCatch } from "@pidchashyi/try-catch";

type Size = {
  width: number;
  height: number;
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type ElementSizeOptions = {
  /** Whether to observe size changes */
  enabled?: boolean;
  /** Debounce time in ms for size updates */
  debounceTime?: number;
  /** Whether to track position */
  trackPosition?: boolean;
  /** Callback when size changes */
  onSizeChange?: (size: Size) => void;
};

/**
 * Hook to track element size and position changes
 * @param {ElementSizeOptions} options Configuration options
 * @returns {[React.RefObject<Element>, Size]} Element ref and current size
 *
 * @example
 * // Basic usage
 * const [ref, size] = useElementSize();
 * return <div ref={ref}>Width: {size.width}px</div>;
 *
 * // With options
 * const [ref, size] = useElementSize({
 *   debounceTime: 100,
 *   trackPosition: true,
 *   onSizeChange: (size) => console.log('Size changed:', size)
 * });
 */
const useElementSize = ({
  enabled = true,
  debounceTime = 0,
  trackPosition = true,
  onSizeChange,
}: ElementSizeOptions = {}) => {
  // Refs
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // State
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  // Update size with debouncing
  const updateSize = useCallback(
    (element: Element) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const update = () => {
        if (!isMountedRef.current) return;

        tryCatch(
          Promise.resolve().then(() => {
            const { width, height } = element.getBoundingClientRect();
            const newSize: Size = {
              width,
              height,
              x: 0,
              y: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            };

            if (trackPosition) {
              const rect = element.getBoundingClientRect();
              newSize.x = rect.x;
              newSize.y = rect.y;
              newSize.top = rect.top;
              newSize.left = rect.left;
              newSize.right = rect.right;
              newSize.bottom = rect.bottom;
            }

            setSize(newSize);
            onSizeChange?.(newSize);
          }),
          {
            onError: (error) => {
              console.error("Error updating element size:", error);
            },
          }
        );
      };

      if (debounceTime > 0) {
        debounceTimerRef.current = setTimeout(update, debounceTime);
      } else {
        update();
      }
    },
    [debounceTime, trackPosition, onSizeChange]
  );

  // Setup ResizeObserver
  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new ResizeObserver((entries) => {
      if (entries[0]) {
        updateSize(entries[0].target);
      }
    });

    observerRef.current.observe(element);

    // Initial size measurement
    updateSize(element);

    return () => {
      isMountedRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, updateSize]);

  return [elementRef, size] as const;
};

export default useElementSize;
