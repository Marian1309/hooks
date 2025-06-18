import { useCallback, useEffect } from "react";
import { tryCatch } from "@pidchashyi/try-catch";

type PageLeaveOptions = {
  /** Whether to enable the page leave detection */
  enabled?: boolean;
  /** Custom message to show in the browser dialog */
  message?: string;
  /** Whether to show a confirmation dialog */
  showDialog?: boolean;
  /** Whether to handle hash changes as page leave events */
  handleHashChange?: boolean;
  /** Whether to handle popstate events */
  handlePopState?: boolean;
};

/**
 * Hook to handle page leave/unload events
 * @param {() => void | Promise<void>} callback Function to call when user leaves page
 * @param {PageLeaveOptions} options Configuration options
 *
 * @example
 * // Basic usage
 * usePageLeave(() => {
 *   console.log('User is leaving the page');
 * });
 *
 * // With options
 * usePageLeave(
 *   async () => {
 *     await saveData();
 *   },
 *   {
 *     enabled: true,
 *     message: 'You have unsaved changes. Are you sure you want to leave?',
 *     showDialog: true
 *   }
 * );
 */
const usePageLeave = (
  callback: () => void | Promise<void>,
  {
    enabled = true,
    message = "Are you sure you want to leave this page?",
    showDialog = true,
    handleHashChange = false,
    handlePopState = true,
  }: PageLeaveOptions = {}
) => {
  // Handler for beforeunload event
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!enabled) return;

      tryCatch(Promise.resolve(callback()), {
        onError: (error) => {
          console.error("Error in page leave callback:", error);
        },
      });

      if (showDialog) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    },
    [callback, enabled, message, showDialog]
  );

  // Handler for popstate event (browser back/forward)
  const handlePopStateEvent = useCallback(
    async (event: PopStateEvent) => {
      if (!enabled || !handlePopState) return;

      const result = await tryCatch(Promise.resolve(callback()), {
        onError: (error) => {
          console.error("Error in popstate callback:", error);
        },
      });

      if (result.status === "success" && showDialog) {
        if (!window.confirm(message)) {
          event.preventDefault();
          // Push a new state to prevent navigation
          window.history.pushState(null, "", window.location.href);
        }
      }
    },
    [callback, enabled, handlePopState, message, showDialog]
  );

  // Handler for hashchange event
  const handleHashChangeEvent = useCallback(
    async (event: HashChangeEvent) => {
      if (!enabled || !handleHashChange) return;

      const result = await tryCatch(Promise.resolve(callback()), {
        onError: (error) => {
          console.error("Error in hashchange callback:", error);
        },
      });

      if (result.status === "success" && showDialog) {
        if (!window.confirm(message)) {
          event.preventDefault();
          // Restore the old URL
          window.location.hash = window.location.hash;
        }
      }
    },
    [callback, enabled, handleHashChange, message, showDialog]
  );

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopStateEvent);
    window.addEventListener("hashchange", handleHashChangeEvent);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopStateEvent);
      window.removeEventListener("hashchange", handleHashChangeEvent);
    };
  }, [enabled, handleBeforeUnload, handlePopStateEvent, handleHashChangeEvent]);
};

export default usePageLeave;
