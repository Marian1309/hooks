import { useEffect, useState, useCallback } from "react";

type UseInViewportOptions = {
  /** Root element to use as viewport (default: browser viewport) */
  root?: Element | null;
  /** Margin around the root element */
  rootMargin?: string;
  /** Percentage of element that needs to be visible (0-1) */
  threshold?: number | number[];
  /** Whether to disconnect observer when element is first seen (default: false) */
  disconnectOnEntry?: boolean;
};

/**
 * Hook to detect if an element is in the viewport
 * @param {string} target CSS selector for the target element (id or class)
 * @param {UseInViewportOptions} options Configuration options
 * @returns {boolean} Whether the element is in viewport
 *
 * @example
 * // Using with ID
 * const isHeaderVisible = useInViewport("#header");
 *
 * // Using with class
 * const isHeroVisible = useInViewport(".hero-section");
 *
 * // With custom options
 * const isVisible = useInViewport("#my-element", {
 *   threshold: 0.5,
 *   rootMargin: "50px",
 *   disconnectOnEntry: true
 * });
 */
const useInViewport = (
  target: string,
  {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    disconnectOnEntry = false,
  }: UseInViewportOptions = {}
): boolean => {
  const [isInViewport, setIsInViewport] = useState<boolean>(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsInViewport(entry.isIntersecting);
    },
    []
  );

  useEffect(() => {
    const targetElement = document.querySelector(target);

    if (!targetElement) {
      console.warn(`Element with selector "${target}" not found`);
      return;
    }

    let observer: IntersectionObserver;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === "undefined") {
      // Fallback to getBoundingClientRect if needed
      const checkVisibility = () => {
        const rect = targetElement.getBoundingClientRect();
        setIsInViewport(
          rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
              (window.innerWidth || document.documentElement.clientWidth)
        );
      };

      checkVisibility();
      window.addEventListener("scroll", checkVisibility);
      window.addEventListener("resize", checkVisibility);

      return () => {
        window.removeEventListener("scroll", checkVisibility);
        window.removeEventListener("resize", checkVisibility);
      };
    }

    try {
      observer = new IntersectionObserver(
        (entries) => {
          handleIntersection(entries);

          // Disconnect if element has entered and disconnectOnEntry is true
          if (entries[0].isIntersecting && disconnectOnEntry) {
            observer.disconnect();
          }
        },
        { root, rootMargin, threshold }
      );

      observer.observe(targetElement);
    } catch (error) {
      console.error("Error creating IntersectionObserver:", error);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [
    target,
    root,
    rootMargin,
    threshold,
    disconnectOnEntry,
    handleIntersection,
  ]);

  return isInViewport;
};

export default useInViewport;
