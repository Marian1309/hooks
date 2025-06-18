"use client";

import { useCallback, useEffect, useState } from "react";

type WindowSize = {
  /** Window inner height in pixels */
  innerHeight: number;
  /** Window inner width in pixels */
  innerWidth: number;
  /** Window outer height in pixels */
  outerHeight: number;
  /** Window outer width in pixels */
  outerWidth: number;
};

/**
 * Default window size for SSR environments
 */
const DEFAULT_WINDOW_SIZE: WindowSize = {
  innerHeight: 0,
  innerWidth: 0,
  outerHeight: 0,
  outerWidth: 0,
};

/**
 * Hook to track window dimensions with SSR support
 * @returns {WindowSize} Current window dimensions
 * @example
 * const { innerWidth, innerHeight } = useWindowSize();
 *
 * // Responsive layout
 * const isMobile = innerWidth < 768;
 * const content = isMobile ? <MobileView /> : <DesktopView />;
 */
const useWindowSize = (): WindowSize => {
  // Get window size with SSR check
  const getSize = useCallback((): WindowSize => {
    if (typeof window === "undefined") {
      return DEFAULT_WINDOW_SIZE;
    }

    return {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      outerHeight: window.outerHeight,
      outerWidth: window.outerWidth,
    };
  }, []);

  const [windowSize, setWindowSize] = useState<WindowSize>(getSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Use requestAnimationFrame for smoother updates
    let frameId: number | null = null;
    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        setWindowSize(getSize());
      });
    };

    // Add event listener with passive flag for better performance
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial size check
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [getSize]);

  return windowSize;
};

export default useWindowSize;
