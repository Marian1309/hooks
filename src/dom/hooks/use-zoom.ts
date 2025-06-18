import { useCallback, useEffect, useState } from "react";

/**
 * Hook to track browser zoom level using devicePixelRatio
 * @returns {number} Current zoom level with 2 decimal precision
 */
const useZoom = (): number => {
  const [zoom, setZoom] = useState<number>(
    () => +window.devicePixelRatio.toFixed(2)
  );

  const getZoomLevel = useCallback(
    (): number => +window.devicePixelRatio.toFixed(2),
    []
  );

  useEffect(() => {
    const handleZoomChange = () => {
      setZoom(getZoomLevel());
    };

    // Handle window resize events
    window.addEventListener("resize", handleZoomChange, { passive: true });

    // Handle devicePixelRatio changes using matchMedia
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );

    // Use modern API with fallback for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleZoomChange);
    } else {
      mediaQuery.addListener(handleZoomChange);
    }

    return () => {
      window.removeEventListener("resize", handleZoomChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleZoomChange);
      } else {
        mediaQuery.removeListener(handleZoomChange);
      }
    };
  }, [getZoomLevel]);

  return zoom;
};

export default useZoom;
