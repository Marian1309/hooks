import { useCallback, useState, useRef, useEffect } from "react";

import type { RefObject } from "react";
import useEventListener from "./use-event-listener";

type HoverOptions = {
  /** Whether to disable the hover detection */
  disabled?: boolean;
  /** Delay in ms before triggering hover state (default: 0) */
  enterDelay?: number;
  /** Delay in ms before removing hover state (default: 0) */
  leaveDelay?: number;
  /** Whether to handle touch events (default: true) */
  handleTouch?: boolean;
  /** Callback when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
};

/**
 * Hook to detect hover state of an element with touch support
 * @template T HTML element type
 * @param {RefObject<T>} elementRef Reference to the element to track
 * @param {HoverOptions} options Configuration options
 * @returns {boolean} Current hover state
 *
 * @example
 * // Basic usage
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const isHovered = useHover(buttonRef);
 *
 * // With options
 * const isHovered = useHover(elementRef, {
 *   enterDelay: 100,
 *   leaveDelay: 300,
 *   onHoverChange: (hovering) => console.log("Hover:", hovering)
 * });
 */
const useHovered = <T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
  {
    disabled = false,
    enterDelay = 0,
    leaveDelay = 0,
    handleTouch = true,
    onHoverChange,
  }: HoverOptions = {}
): boolean => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Store timeouts in refs to cancel them if needed
  const enterTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Clear any existing timeouts
  const clearTimeouts = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }
  }, []);

  // Handle hover start
  const handleMouseEnter = useCallback(() => {
    clearTimeouts();

    if (disabled) return;

    if (enterDelay > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }, enterDelay);
    } else {
      setIsHovered(true);
      onHoverChange?.(true);
    }
  }, [disabled, enterDelay, clearTimeouts, onHoverChange]);

  // Handle hover end
  const handleMouseLeave = useCallback(() => {
    clearTimeouts();

    if (disabled) return;

    if (leaveDelay > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        onHoverChange?.(false);
      }, leaveDelay);
    } else {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  }, [disabled, leaveDelay, clearTimeouts, onHoverChange]);

  // Handle touch events if enabled
  const handleTouchStart = useCallback(() => {
    clearTimeouts();
    if (!disabled) {
      setIsHovered(true);
      onHoverChange?.(true);
    }
  }, [disabled, clearTimeouts, onHoverChange]);

  const handleTouchEnd = useCallback(() => {
    clearTimeouts();
    if (!disabled) {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  }, [disabled, clearTimeouts, onHoverChange]);

  // Mouse events
  useEventListener("mouseenter", handleMouseEnter, {
    target: elementRef.current,
  });
  useEventListener("mouseleave", handleMouseLeave, {
    target: elementRef.current,
  });

  // Touch events
  if (handleTouch) {
    useEventListener("touchstart", handleTouchStart, {
      target: elementRef.current,
      passive: true,
    });
    useEventListener("touchend", handleTouchEnd, {
      target: elementRef.current,
      passive: true,
    });
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return isHovered;
};

export default useHovered;
