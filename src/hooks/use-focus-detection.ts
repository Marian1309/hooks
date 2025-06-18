import { useCallback, useEffect, useState } from "react";

type FocusDetectionOptions = {
  /** Callback triggered when window loses focus */
  onFocusLoss?: () => void;
  /** Callback triggered when DevTools is opened */
  onDevToolsOpen?: () => void;
  /** Whether the detection is enabled */
  enabled?: boolean;
};

type FocusDetectionResult = {
  /** Whether the window is currently focused */
  isWindowFocused: boolean;
  /** Whether the DevTools panel is open */
  isDevToolsOpen: boolean;
};

const DEVTOOLS_SIZE_THRESHOLD = 160;

/**
 * Hook to detect window focus state and DevTools open state
 * @param options Configuration options for focus detection
 * @returns Object containing focus and DevTools state
 */
const useFocusDetection = ({
  onFocusLoss,
  onDevToolsOpen,
  enabled = true,
}: FocusDetectionOptions): FocusDetectionResult => {
  const [isWindowFocused, setIsWindowFocused] = useState<boolean>(true);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(false);

  const handleVisibilityChange = useCallback(() => {
    const isHidden = document.hidden;
    setIsWindowFocused(!isHidden);

    if (isHidden && onFocusLoss) {
      onFocusLoss();
    }
  }, [onFocusLoss]);

  const detectDevTools = useCallback(() => {
    const widthThreshold =
      window.outerWidth - window.innerWidth > DEVTOOLS_SIZE_THRESHOLD;
    const heightThreshold =
      window.outerHeight - window.innerHeight > DEVTOOLS_SIZE_THRESHOLD;
    const isOpen = widthThreshold || heightThreshold;

    if (isOpen && !isDevToolsOpen && onDevToolsOpen) {
      onDevToolsOpen();
    }

    setIsDevToolsOpen(isOpen);
  }, [isDevToolsOpen, onDevToolsOpen]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });
    window.addEventListener("resize", detectDevTools, { passive: true });

    // Initial checks
    handleVisibilityChange();
    detectDevTools();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", detectDevTools);
    };
  }, [enabled, handleVisibilityChange, detectDevTools]);

  return {
    isWindowFocused,
    isDevToolsOpen,
  };
};

export default useFocusDetection;
