import { useCallback, useEffect, useState } from "react";

type DeviceType = "mobile" | "laptop" | "desktop";

const BREAKPOINTS = {
  MOBILE: 768, // < 768px
  LAPTOP: 1024, // 768px - 1024px
  DESKTOP: 1024, // > 1024px
} as const;

/**
 * Hook to detect device type based on screen width
 * @returns {"mobile" | "laptop" | "desktop"} Current device type
 */
const useDeviceType = (): DeviceType => {
  const getDeviceType = useCallback((): DeviceType => {
    const width = window.innerWidth;

    if (width < BREAKPOINTS.MOBILE) {
      return "mobile";
    }
    if (width <= BREAKPOINTS.LAPTOP) {
      return "laptop";
    }
    return "desktop";
  }, []);

  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());

  const handleResize = useCallback(() => {
    setDeviceType(getDeviceType());
  }, [getDeviceType]);

  useEffect(() => {
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return deviceType;
};

export default useDeviceType;
