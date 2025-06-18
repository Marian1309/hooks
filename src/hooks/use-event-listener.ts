import { useEffect, useRef } from "react";

type Target = Window | Document | HTMLElement | null;

type Options = {
  /** Whether the event should be captured */
  capture?: boolean;
  /** Whether the listener should be passive */
  passive?: boolean;
  /** Whether the listener should only trigger once */
  once?: boolean;
  /** Target element to attach the listener to */
  target?: Target | (() => Target);
};

/**
 * Hook to handle event listeners with proper cleanup and TypeScript support
 * @template K Type of event key (e.g., "click", "scroll")
 * @template E Type of event (e.g., MouseEvent, KeyboardEvent)
 * @param {K} eventName The name of the event to listen to
 * @param {(event: E) => void} handler The event handler function
 * @param {Options} options Configuration options
 *
 * @example
 * // Basic window event
 * useEventListener("scroll", (e) => {
 *   console.log(window.scrollY);
 * });
 *
 * // Element event with ref
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * useEventListener("click", (e) => {
 *   e.preventDefault();
 * }, { target: buttonRef.current });
 *
 * // With options
 * useEventListener("touchstart", handleTouch, {
 *   passive: true,
 *   target: () => document.getElementById("touch-area")
 * });
 */
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: Options & { target?: undefined }
): void;

function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options: Options & { target: Document }
): void;

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options: Options & { target: HTMLElement | (() => HTMLElement | null) }
): void;

function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  {
    capture = false,
    passive = false,
    once = false,
    target = window,
  }: Options = {}
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = typeof target === "function" ? target() : target;

    if (!targetElement?.addEventListener) {
      return;
    }

    const eventListener: typeof handler = (event) =>
      savedHandler.current(event);
    const options = { capture, passive, once };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, target, capture, passive, once]);
}

export default useEventListener;
