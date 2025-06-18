import { useEffect, useCallback, useState, useRef } from "react";

type KeyEvent = "keydown" | "keyup" | "keypress";

// All possible key values
type ModifierKey =
  | "Alt"
  | "AltGraph"
  | "Control"
  | "Shift"
  | "Meta"
  | "CapsLock"
  | "NumLock"
  | "ScrollLock";

type NavigationKey =
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "End"
  | "Home"
  | "PageDown"
  | "PageUp";

type FunctionKey =
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12";

type NumericKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type AlphabeticKey =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type WhitespaceKey = "Enter" | "Tab" | "Space";

type EditingKey =
  | "Backspace"
  | "Clear"
  | "Copy"
  | "CrSel"
  | "Cut"
  | "Delete"
  | "EraseEof"
  | "Insert"
  | "Paste"
  | "Undo"
  | "Redo";

type UIKey =
  | "Accept"
  | "Again"
  | "Attn"
  | "Cancel"
  | "ContextMenu"
  | "Escape"
  | "Execute"
  | "Find"
  | "Finish"
  | "Help"
  | "Pause"
  | "Play"
  | "Props"
  | "Select"
  | "ZoomIn"
  | "ZoomOut";

type SpecialKey =
  | "AudioVolumeDown"
  | "AudioVolumeMute"
  | "AudioVolumeUp"
  | "BrowserBack"
  | "BrowserFavorites"
  | "BrowserForward"
  | "BrowserHome"
  | "BrowserRefresh"
  | "BrowserSearch"
  | "BrowserStop"
  | "PrintScreen";

// Combine all key types
type KeyboardKey =
  | ModifierKey
  | NavigationKey
  | FunctionKey
  | NumericKey
  | AlphabeticKey
  | WhitespaceKey
  | EditingKey
  | UIKey
  | SpecialKey;

type KeyPressOptions = {
  /** Event to listen for (default: "keydown") */
  event?: KeyEvent;
  /** Target element to attach listener to (default: window) */
  target?: HTMLElement | null;
  /** Whether to prevent default behavior when key is pressed */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
  /** Whether hook should be enabled */
  enabled?: boolean;
  /** Callback when key is pressed */
  onKeyPress?: (event: KeyboardEvent) => void;
  /** Modifier keys that must be pressed (ctrl, alt, shift, meta) */
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
};

/**
 * Hook to detect keyboard key presses with type-safe key values
 * @param {KeyboardKey | KeyboardKey[]} targetKey Key(s) to detect
 * @param {KeyPressOptions} options Configuration options
 * @returns {boolean} Whether the key is currently pressed
 *
 * @example
 * // Basic usage with type safety
 * const isEnterPressed = useKeyPress("Enter");
 *
 * // Multiple keys with type checking
 * const isArrowPressed = useKeyPress(["ArrowUp", "ArrowDown"]);
 *
 * // With modifiers
 * const isSavePressed = useKeyPress("s", {
 *   modifiers: { ctrl: true }
 * });
 *
 * // Function keys
 * const isHelpPressed = useKeyPress("F1");
 *
 * // Navigation
 * const isHomePressed = useKeyPress("Home");
 *
 * // UI keys
 * const isEscapePressed = useKeyPress("Escape");
 */
const useKeyPress = (
  targetKey: KeyboardKey | KeyboardKey[],
  {
    event = "keydown",
    target = null,
    preventDefault = false,
    stopPropagation = false,
    enabled = true,
    onKeyPress,
    modifiers = {},
  }: KeyPressOptions = {}
): boolean => {
  const [isKeyPressed, setIsKeyPressed] = useState<boolean>(false);
  const targetKeys = Array.isArray(targetKey) ? targetKey : [targetKey];

  // Use ref for latest callback to avoid unnecessary re-renders
  const callbackRef = useRef(onKeyPress);
  useEffect(() => {
    callbackRef.current = onKeyPress;
  }, [onKeyPress]);

  // Check if modifiers match the event
  const checkModifiers = useCallback(
    (event: KeyboardEvent): boolean => {
      const { ctrl, alt, shift, meta } = modifiers;

      if (ctrl !== undefined && event.ctrlKey !== ctrl) return false;
      if (alt !== undefined && event.altKey !== alt) return false;
      if (shift !== undefined && event.shiftKey !== shift) return false;
      if (meta !== undefined && event.metaKey !== meta) return false;

      return true;
    },
    [modifiers]
  );

  const handleKey = useCallback(
    (event: KeyboardEvent, isPressed: boolean) => {
      if (!enabled) return;

      const key = event.key as KeyboardKey;
      if (!targetKeys.includes(key)) return;
      if (!checkModifiers(event)) return;

      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();

      setIsKeyPressed(isPressed);

      if (isPressed && callbackRef.current) {
        callbackRef.current(event);
      }
    },
    [enabled, targetKeys, preventDefault, stopPropagation, checkModifiers]
  );

  useEffect(() => {
    if (!enabled) {
      setIsKeyPressed(false);
      return;
    }

    const targetElement = target || window;

    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);

    if (event === "keydown" || event === "keypress") {
      targetElement.addEventListener(event, handleKeyDown as EventListener);
    }
    targetElement.addEventListener("keyup", handleKeyUp as EventListener);

    return () => {
      if (event === "keydown" || event === "keypress") {
        targetElement.removeEventListener(
          event,
          handleKeyDown as EventListener
        );
      }
      targetElement.removeEventListener("keyup", handleKeyUp as EventListener);
    };
  }, [event, target, enabled, handleKey]);

  return isKeyPressed;
};

export default useKeyPress;
