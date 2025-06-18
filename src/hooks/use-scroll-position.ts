import { useCallback, useEffect, useState } from "react";

/**
 * Hook to track window scroll position
 * @returns {number} Current vertical scroll position in pixels
 */
const useScrollPosition = (): number => {
  const [scrollY, setScrollY] = useState<number>(0);

  const getScrollPosition = useCallback(
    (): number => window.scrollY || document.documentElement.scrollTop,
    []
  );

  useEffect(() => {
    const handleScroll = (): void => {
      setScrollY(getScrollPosition());
    };

    // Use requestAnimationFrame for smoother scrolling
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial position

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [getScrollPosition]);

  return scrollY;
};

export default useScrollPosition;
