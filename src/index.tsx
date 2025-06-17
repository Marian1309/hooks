"use client";

import { useEffect, useState } from "react";

export const useZoom = () => {
  const [zoom, setZoom] = useState(+window.devicePixelRatio.toFixed(2));

  useEffect(() => {
    const handleZoomChange = () => {
      setZoom(+window.devicePixelRatio.toFixed(2));
    };

    window.addEventListener("resize", handleZoomChange);

    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
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
  }, []);

  return zoom;
};

export const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollY;
};

export const useMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

type FocusDetectionOptions = {
  onFocusLoss?: () => void;
  enabled?: boolean;
};

export const useFocusDetection = ({
  onFocusLoss,
  enabled = true,
}: FocusDetectionOptions = {}) => {
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsWindowFocused(!isHidden);

      if (isHidden && onFocusLoss) {
        onFocusLoss();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, onFocusLoss]);

  return isWindowFocused;
};

export const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? "mobile" : "desktop";
};

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useLocalStorage = <T,>(key: string) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn("Error reading localStorage key", key, error);
      return null;
    }
  });

  // Sync local state when localStorage changes (optional)
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : null);
        } catch {
          setStoredValue(null);
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  const set = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn("Error setting localStorage key", key, error);
    }
  };

  const remove = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.warn("Error removing localStorage key", key, error);
    }
  };

  return { value: storedValue, set, delete: remove };
};
