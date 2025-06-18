import { useCallback, useEffect, useState } from "react";

type SelectionRect = {
  /** Left position relative to viewport */
  left: number;
  /** Top position relative to viewport */
  top: number;
  /** Width of selection */
  width: number;
  /** Height of selection */
  height: number;
};

type SelectionInfo = {
  /** Selected text content */
  text: string;
  /** HTML content of selection */
  html: string;
  /** Whether there is an active selection */
  isCollapsed: boolean;
  /** Selection rectangle coordinates */
  rect: SelectionRect | null;
  /** The element containing the selection */
  containingElement: Element | null;
};

type TextSelectionOptions = {
  /** Whether to enable selection tracking (default: true) */
  enabled?: boolean;
  /** Element to track selections within (default: document.body) */
  target?: HTMLElement | null;
  /** Callback when selection changes */
  onSelectionChange?: (info: SelectionInfo) => void;
};

/**
 * Hook to track text selection within a target element
 * @param {TextSelectionOptions} options Configuration options
 * @returns {SelectionInfo} Current selection information
 *
 * @example
 * // Basic usage
 * const { text, isCollapsed } = useTextSelection();
 *
 * // With target element
 * const containerRef = useRef<HTMLDivElement>(null);
 * const selection = useTextSelection({
 *   target: containerRef.current
 * });
 *
 * // With callback
 * useTextSelection({
 *   onSelectionChange: (info) => {
 *     console.log("Selected text:", info.text);
 *   }
 * });
 */
const useTextSelection = ({
  enabled = true,
  target = null,
  onSelectionChange,
}: TextSelectionOptions = {}): SelectionInfo => {
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo>({
    text: "",
    html: "",
    isCollapsed: true,
    rect: null,
    containingElement: null,
  });

  const getSelectionInfo = useCallback((): SelectionInfo => {
    const selection = window.getSelection();

    if (!selection || !enabled) {
      return {
        text: "",
        html: "",
        isCollapsed: true,
        rect: null,
        containingElement: null,
      };
    }

    // Get selection details
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) {
      return {
        text: "",
        html: "",
        isCollapsed: true,
        rect: null,
        containingElement: null,
      };
    }

    // Check if selection is within target element
    if (target && !target.contains(range.commonAncestorContainer)) {
      return {
        text: "",
        html: "",
        isCollapsed: true,
        rect: null,
        containingElement: null,
      };
    }

    // Get selection rectangle
    const rect = range.getBoundingClientRect();
    const selectionRect: SelectionRect = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };

    // Create temporary element to safely get HTML content
    const div = document.createElement("div");
    div.appendChild(range.cloneContents());

    return {
      text: selection.toString(),
      html: div.innerHTML,
      isCollapsed: selection.isCollapsed,
      rect: selectionRect,
      containingElement: range.commonAncestorContainer as Element,
    };
  }, [enabled, target]);

  const handleSelectionChange = useCallback(() => {
    const info = getSelectionInfo();
    setSelectionInfo(info);
    onSelectionChange?.(info);
  }, [getSelectionInfo, onSelectionChange]);

  useEffect(() => {
    if (!enabled) {
      setSelectionInfo({
        text: "",
        html: "",
        isCollapsed: true,
        rect: null,
        containingElement: null,
      });
      return;
    }

    document.addEventListener("selectionchange", handleSelectionChange);

    // Initial selection check
    handleSelectionChange();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [enabled, handleSelectionChange]);

  return selectionInfo;
};

export default useTextSelection;
