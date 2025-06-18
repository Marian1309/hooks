# `@pidchashyi/hooks`

> 🔥 A collection of lightweight, reusable React hooks for common UI and state management tasks — including zoom detection, scroll tracking, focus detection, device type detection, debouncing, and localStorage syncing.

Simplify your React projects with these robust hooks designed to handle browser events and state updates efficiently and safely.

---

## 📦 Installation

```bash
npm install @pidchashyi/hooks
# or
yarn add @pidchashyi/hooks
# or
pnpm install @pidchashyi/hooks
# or
bun install @pidchashyi/hooks
```

---

## 📁 Package Structure

The hooks are organized into different categories for better organization and tree-shaking:

```
@pidchashyi/hooks/
├── / (root)          # Core utility hooks
├── /dom              # DOM-related hooks
└── /advanced         # Advanced functionality hooks
```

## 🎯 Import Paths

Import hooks from their respective paths:

```typescript
// Core hooks
import { useArray, useDebounce } from "@pidchashyi/hooks";

// DOM-related hooks
import { useClickOutside, useWindowSize } from "@pidchashyi/hooks/dom";

// Advanced hooks
import { useFetch, useAdvancedSearch } from "@pidchashyi/hooks/advanced";
```

---

## ⚙️ Core Hooks

These hooks are available from the root import path `@pidchashyi/hooks`:

### `useArray<T>`

Manage array state with utility methods for common operations.

```tsx
const { array, push, remove, filter, update, clear, insertAt, pop, updateAll } =
  useArray<T>(initialArray);
```

### `useDebounce<T>`

Delay value updates until after a specified timeout.

```tsx
const debouncedValue = useDebounce(value, delay);
```

### `useDebouncedCallback`

Create a debounced version of any callback function.

```tsx
const debouncedFn = useDebouncedCallback(callback, delay, {
  leading: false,
  trailing: true,
  maxWait: undefined,
  resetTimer: false,
});
```

### `useIsMounted`

Track component mount state.

```tsx
const isMounted = useIsMounted();
```

### `useLocalStorage<T>`

Manage state with localStorage synchronization.

```tsx
const { value, set, remove, exists } = useLocalStorage<T>(key, {
  initialValue,
  serialize: true,
  onError: (error) => console.error(error),
});
```

### `usePreviousValue<T>`

Track value from previous render.

```tsx
const previousValue = usePreviousValue(currentValue);
```

### `useToggle<T>`

Toggle between two values with type safety.

```tsx
const [value, { toggle, setFirst, setSecond, setValue }] = useToggle(
  first,
  second
);
```

---

## 🌐 DOM Hooks

Import these hooks from `@pidchashyi/hooks/dom`:

### `useClickInside<T>`

Detect clicks on elements matching a selector with touch support.

```tsx
const handleClickInside = useClickInside(".clickable", {
  enabled: true,
  stopPropagation: false,
  preventDefault: false,
  handleTouch: true,
});
```

### `useClickOutside`

Handle clicks outside specified elements with advanced detection options.

```tsx
useClickOutside(elementRef, handleOutsideClick, {
  events: ["mousedown"],
  enabled: true,
  shouldHandle: (event) => true,
  stopPropagation: false,
  preventDefault: false,
});
```

### `useCopyToClipboard`

Copy text to clipboard with status tracking and fallback support.

```tsx
const { copy, value, isSuccess, error } = useCopyToClipboard({
  resetAfter: 2000,
  onSuccess: (text) => console.log(`Copied: ${text}`),
  onError: (error) => console.error(error),
});
```

### `useDeviceType`

Detect and track device type based on viewport width.

```tsx
const deviceType = useDeviceType();
```

### `useDOMObserver`

Observe DOM for elements and execute callbacks when found.

```tsx
useDOMObserver(
  "#element",
  (element) => {
    console.log("Element found:", element);
  },
  {
    once: true,
    timeout: 5000,
    observerOptions: { childList: true, subtree: true },
    immediate: true,
  }
);
```

### `useElementSize`

Track element dimensions and position changes.

```tsx
const [ref, size] = useElementSize({
  enabled: true,
  debounceTime: 0,
  trackPosition: true,
  onSizeChange: (size) => console.log(size),
});
```

### `useEventListener`

Type-safe event listener management with proper cleanup.

```tsx
useEventListener(
  "scroll",
  (e) => {
    console.log(window.scrollY);
  },
  {
    capture: false,
    passive: true,
    once: false,
    target: window,
  }
);
```

### `useFocusDetection`

Detect window focus state and DevTools open state.

```tsx
const { isWindowFocused, isDevToolsOpen } = useFocusDetection({
  onFocusLoss: () => console.log("Window lost focus"),
  onDevToolsOpen: () => console.log("DevTools opened"),
  enabled: true,
});
```

### `useFocusWithin`

Track focus state within a container element.

```tsx
const isFocused = useFocusWithin("#container", {
  enabled: true,
  onFocusWithin: (event) => console.log("Focus entered"),
  onBlurWithin: (event) => console.log("Focus left"),
  ignoreInternalFocus: false,
});
```

### `useHovered`

Track element hover state with touch support.

```tsx
const isHovered = useHovered(elementRef, {
  disabled: false,
  enterDelay: 0,
  leaveDelay: 0,
  handleTouch: true,
  onHoverChange: (isHovered) => console.log("Hover:", isHovered),
});
```

### `useInViewport`

Detect if an element is in the viewport.

```tsx
const isVisible = useInViewport("#element", {
  root: null,
  rootMargin: "0px",
  threshold: 0,
  disconnectOnEntry: false,
});
```

### `useKeyPress`

Detect keyboard key presses with modifier support.

```tsx
const isPressed = useKeyPress(["Enter", "Space"], {
  event: "keydown",
  target: document,
  preventDefault: false,
  stopPropagation: false,
  enabled: true,
  modifiers: { ctrl: true, alt: false },
});
```

### `useLongPress`

Detect long press interactions with touch support.

```tsx
const { handlers, isPressed } = useLongPress(callback, {
  delay: 500,
  disabled: false,
  preventDefault: true,
  detectMoves: true,
  moveThreshold: 10,
});
```

### `usePageLeave`

Handle page leave/unload events with confirmation.

```tsx
usePageLeave(
  () => {
    console.log("User is leaving");
  },
  {
    enabled: true,
    message: "Are you sure?",
    showDialog: true,
    handleHashChange: false,
    handlePopState: true,
  }
);
```

### `useScrollPosition`

Track window scroll position with smooth updates.

```tsx
const scrollY = useScrollPosition();
```

### `useTextSelection`

Track text selection within elements.

```tsx
const { text, html, isCollapsed, rect, containingElement } = useTextSelection({
  enabled: true,
  target: element,
  onSelectionChange: (info) => console.log(info),
});
```

### `useWindowSize`

Track window dimensions with SSR support.

```tsx
const { innerWidth, innerHeight, outerWidth, outerHeight } = useWindowSize();
```

### `useZoom`

Track browser zoom level changes.

```tsx
const zoomLevel = useZoom();
```

---

## 🚀 Advanced Hooks

Import these hooks from `@pidchashyi/hooks/advanced`:

### `useFetch<T, E>`

Data fetching with type-safe error handling and caching.

```tsx
const { data, status, error, isLoading, refetch, cancel } = useFetch<T, E>(
  url,
  {
    initialData,
    autoFetch: true,
    cacheDuration: 0,
    headers,
    transform: (data) => data,
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  }
);
```

### `useAdvancedSearch<T>`

Advanced search functionality with filtering, sorting, and pagination.

```tsx
const {
  results,
  isLoading,
  error,
  filters,
  sort,
  pagination,
  setFilters,
  setSort,
  setPage,
  setPageSize,
  refresh,
} = useAdvancedSearch<T>({
  data: items,
  initialFilters: { status: "active" },
  initialSort: { field: "createdAt", direction: "desc" },
  initialPage: 1,
  pageSize: 10,
  searchFields: ["title", "description"],
  debounceMs: 300,
  onSearch: async (params) => {
    /* handle search */
  },
});
```

### `useOptimisticUpdate<T>`

Perform optimistic updates with automatic rollback on failure.

```tsx
const { mutate, isLoading, error } = useOptimisticUpdate<T>({
  onUpdate: async (data) => {
    /* perform update */
  },
  onError: (error, rollback) => {
    console.error(error);
    rollback();
  },
  optimisticUpdate: (currentData, newData) => ({
    ...currentData,
    ...newData,
  }),
});

// Usage
mutate({ id: 1, status: "completed" });
```

---

## 👤 Author

Created by [Pidchashyi](https://github.com/Marian1309/hooks).

---

## 📄 License

MIT © [LICENSE](https://github.com/Marian1309/hooks/blob/main/LICENSE)
