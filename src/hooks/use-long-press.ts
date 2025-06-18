import { useCallback, useEffect, useRef } from "react";
import { tryCatch } from "@pidchashyi/try-catch";

type LongPressOptions = {
  /** Delay in ms before triggering long press (default: 500) */
  delay?: number;
  /** Whether to disable the long press detection */
  disabled?: boolean;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
  /** Whether to detect movement and cancel if moved */
  detectMoves?: boolean;
  /** Maximum movement allowed before canceling (in pixels) */
  moveThreshold?: number;
  /** Callback when long press starts */
  onStart?: (event: TouchEvent | MouseEvent) => void;
  /** Callback when long press is canceled */
  onCancel?: (event: TouchEvent | MouseEvent) => void;
  /** Callback when long press ends */
  onEnd?: (event: TouchEvent | MouseEvent) => void;
  /** Callback when movement is detected */
  onMove?: (
    event: TouchEvent | MouseEvent,
    movement: { x: number; y: number }
  ) => void;
};

type LongPressResult = {
  /** Props to spread on the target element */
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchCancel: (e: React.TouchEvent) => void;
  };
  /** Whether long press is currently active */
  isPressed: boolean;
};

/**
 * Hook to detect long press interactions with touch and mouse support
 * @param {(event: TouchEvent | MouseEvent) => void} callback Function to call on long press
 * @param {LongPressOptions} options Configuration options
 * @returns {LongPressResult} Object containing event handlers and press state
 *
 * @example
 * // Basic usage
 * const { handlers, isPressed } = useLongPress(() => {
 *   console.log('Long press detected!');
 * });
 *
 * return <button {...handlers}>{isPressed ? 'Holding...' : 'Press and hold'}</button>;
 *
 * // With options
 * const { handlers } = useLongPress(onLongPress, {
 *   delay: 1000,
 *   detectMoves: true,
 *   moveThreshold: 10,
 *   onStart: () => setIsActive(true),
 *   onEnd: () => setIsActive(false)
 * });
 */
const useLongPress = (
  callback: (event: TouchEvent | MouseEvent) => void,
  {
    delay = 500,
    disabled = false,
    preventDefault = true,
    stopPropagation = false,
    detectMoves = true,
    moveThreshold = 10,
    onStart,
    onCancel,
    onEnd,
    onMove,
  }: LongPressOptions = {}
): LongPressResult => {
  // Track timer and press state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const startPositionRef = useRef({ x: 0, y: 0 });

  // Track whether component is mounted
  const isMountedRef = useRef(true);

  // Clear any existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start long press timer
  const startTimer = useCallback(
    async (event: TouchEvent | MouseEvent) => {
      if (disabled) return;

      // Clear any existing timer
      clearTimer();

      // Get initial position
      const position =
        "touches" in event
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : {
              x: (event as MouseEvent).clientX,
              y: (event as MouseEvent).clientY,
            };

      startPositionRef.current = position;
      isActiveRef.current = true;

      // Notify start
      onStart?.(event);

      // Start timer
      timerRef.current = setTimeout(async () => {
        if (!isMountedRef.current || !isActiveRef.current) return;

        const result = await tryCatch(Promise.resolve(callback(event)), {
          onError: (error) => {
            console.error("Error in long press callback:", error);
          },
        });

        if (result.status === "success") {
          isActiveRef.current = false;
        }
      }, delay);
    },
    [callback, delay, disabled, clearTimer, onStart]
  );

  // Handle press end
  const endTimer = useCallback(
    (event: TouchEvent | MouseEvent, shouldCancel = false) => {
      clearTimer();

      if (isActiveRef.current) {
        isActiveRef.current = false;
        if (shouldCancel) {
          onCancel?.(event);
        } else {
          onEnd?.(event);
        }
      }
    },
    [clearTimer, onCancel, onEnd]
  );

  // Check if movement exceeds threshold
  const checkMovement = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!detectMoves || !isActiveRef.current) return;

      const currentPosition =
        "touches" in event
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : {
              x: (event as MouseEvent).clientX,
              y: (event as MouseEvent).clientY,
            };

      const movement = {
        x: Math.abs(currentPosition.x - startPositionRef.current.x),
        y: Math.abs(currentPosition.y - startPositionRef.current.y),
      };

      onMove?.(event, movement);

      if (movement.x > moveThreshold || movement.y > moveThreshold) {
        endTimer(event, true);
      }
    },
    [detectMoves, moveThreshold, endTimer, onMove]
  );

  // Event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      startTimer(e.nativeEvent);
    },
    [preventDefault, stopPropagation, startTimer]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      endTimer(e.nativeEvent);
    },
    [preventDefault, stopPropagation, endTimer]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      endTimer(e.nativeEvent, true);
    },
    [preventDefault, stopPropagation, endTimer]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      startTimer(e.nativeEvent);
    },
    [preventDefault, stopPropagation, startTimer]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      endTimer(e.nativeEvent);
    },
    [preventDefault, stopPropagation, endTimer]
  );

  const handleTouchCancel = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      endTimer(e.nativeEvent, true);
    },
    [preventDefault, stopPropagation, endTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  return {
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    isPressed: isActiveRef.current,
  };
};

export default useLongPress;
