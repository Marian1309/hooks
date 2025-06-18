import { useCallback, useEffect, useState } from "react";

type CopyToClipboardState = {
  /** The last copied text */
  value: string | null;
  /** Whether the copy operation was successful */
  isSuccess: boolean;
  /** Any error that occurred during copying */
  error: Error | null;
};

type CopyToClipboardOptions = {
  /** Duration in ms to reset success/error state (default: 2000) */
  resetAfter?: number;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Success callback */
  onSuccess?: (value: string) => void;
};

/**
 * Hook to copy text to clipboard with status tracking
 * @param options Configuration options
 * @returns Object containing copy function and state
 * @example
 * // Basic usage
 * const { copy, value, isSuccess } = useCopyToClipboard();
 *
 * // Copy with feedback
 * <button
 *   onClick={() => copy("Hello")}
 *   disabled={isSuccess}
 * >
 *   {isSuccess ? "Copied!" : "Copy"}
 * </button>
 *
 * // With options
 * const { copy } = useCopyToClipboard({
 *   resetAfter: 3000,
 *   onSuccess: (text) => toast.success(`Copied: ${text}`),
 *   onError: (error) => toast.error(error.message)
 * });
 */
const useCopyToClipboard = (options: CopyToClipboardOptions = {}) => {
  const { resetAfter = 2000, onError, onSuccess } = options;

  const [state, setState] = useState<CopyToClipboardState>({
    value: null,
    isSuccess: false,
    error: null,
  });

  // Reset state after specified duration
  useEffect(() => {
    if (state.isSuccess && resetAfter > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isSuccess: false,
          error: null,
        }));
      }, resetAfter);

      return () => clearTimeout(timer);
    }

    return;
  }, [state.isSuccess, resetAfter]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        // Check for clipboard support
        if (!navigator?.clipboard) {
          throw new Error("Clipboard API not supported");
        }

        // Try legacy approach if writeText is not available
        if (!navigator.clipboard.writeText) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();

          try {
            document.execCommand("copy");
            document.body.removeChild(textArea);
          } catch (err) {
            document.body.removeChild(textArea);
            throw new Error("Legacy clipboard copy failed");
          }
        } else {
          await navigator.clipboard.writeText(text);
        }

        setState({
          value: text,
          isSuccess: true,
          error: null,
        });

        onSuccess?.(text);
        return true;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Copy failed");

        setState({
          value: null,
          isSuccess: false,
          error: errorObj,
        });

        onError?.(errorObj);
        return false;
      }
    },
    [onSuccess, onError]
  );

  return {
    copy,
    ...state,
  };
};

export default useCopyToClipboard;
