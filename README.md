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

## ⚙️ Hooks API Reference

### `useArray<T>`

Manage array state with utility methods for common operations.

```tsx
const { array, push, remove, filter, update, clear, insertAt, pop, updateAll } =
  useArray<T>(initialArray);
```

- **Features**:
  - Add/remove items
  - Update items at specific indices
  - Filter array contents
  - Clear the entire array
  - Insert at specific positions
  - Pop last item
  - Batch update all items

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

- **Options**:
  - Enable/disable detection
  - Control event propagation
  - Handle touch events
  - Custom callback handling

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

- **Features**:
  - Multiple element support
  - Custom event types
  - Conditional handling
  - Event control options

### `useCopyToClipboard`

Copy text to clipboard with status tracking and fallback support.

```tsx
const { copy, value, isSuccess, error } = useCopyToClipboard({
  resetAfter: 2000,
  onSuccess: (text) => console.log(`Copied: ${text}`),
  onError: (error) => console.error(error),
});
```

- **Features**:
  - Success/error tracking
  - Automatic status reset
  - Custom callbacks
  - Fallback for older browsers

### `useDebounce<T>`

Delay value updates until after a specified timeout.

```tsx
const debouncedValue = useDebounce(value, delay);
```

- **Features**:
  - Customizable delay
  - Type-safe
  - Automatic cleanup
  - Immediate mode support

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

- **Features**:
  - Leading/trailing edge execution
  - Maximum wait time
  - Timer control
  - Cancellable

### `useDeviceType`

Detect and track device type based on viewport width.

```tsx
const deviceType = useDeviceType();
```

- **Returns**: `"mobile" | "laptop" | "desktop"`
- **Features**:
  - Responsive breakpoints
  - Real-time updates
  - Window resize handling

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

- **Features**:
  - Timeout support
  - MutationObserver configuration
  - One-time or continuous observation

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

- **Features**:
  - ResizeObserver integration
  - Position tracking
  - Debounced updates
  - Change callbacks

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

- **Features**:
  - TypeScript event typing
  - Multiple target support
  - Event options configuration

### `useFocusDetection`

Detect window focus state and DevTools open state.

```tsx
const { isWindowFocused, isDevToolsOpen } = useFocusDetection({
  onFocusLoss: () => console.log("Window lost focus"),
  onDevToolsOpen: () => console.log("DevTools opened"),
  enabled: true,
});
```

- **Features**:
  - Window focus tracking
  - DevTools detection
  - Custom callbacks

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

- **Features**:
  - Container focus tracking
  - Focus event callbacks
  - Internal focus handling

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

- **Features**:
  - Delay configuration
  - Touch event support
  - State change callbacks

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

- **Features**:
  - IntersectionObserver integration
  - Custom viewport
  - Threshold control
  - One-time detection option

### `useIsMounted`

Track component mount state.

```tsx
const isMounted = useIsMounted();
```

- **Features**:
  - Safe state updates
  - Cleanup handling
  - Mount status tracking

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

- **Features**:
  - Multiple key support
  - Modifier key detection
  - Event customization
  - Target element specification

### `useLocalStorage<T>`

Manage state with localStorage synchronization.

```tsx
const { value, set, remove, exists } = useLocalStorage<T>(key, {
  initialValue,
  serialize: true,
  onError: (error) => console.error(error),
});
```

- **Features**:
  - Type-safe storage
  - Cross-tab synchronization
  - Custom serialization
  - Error handling

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

- **Features**:
  - Customizable delay
  - Movement detection
  - Touch support
  - Event handling

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

- **Features**:
  - Custom messages
  - Navigation handling
  - Hash change detection
  - PopState management

### `usePreviousValue<T>`

Track value from previous render.

```tsx
const previousValue = usePreviousValue(currentValue);
```

- **Features**:
  - Type-safe tracking
  - Render comparison
  - Change detection

### `useScrollPosition`

Track window scroll position with smooth updates.

```tsx
const scrollY = useScrollPosition();
```

- **Features**:
  - Smooth tracking
  - Performance optimization
  - Passive event listening

### `useTextSelection`

Track text selection within elements.

```tsx
const { text, html, isCollapsed, rect, containingElement } = useTextSelection({
  enabled: true,
  target: element,
  onSelectionChange: (info) => console.log(info),
});
```

- **Features**:
  - Selection content
  - Position tracking
  - HTML content
  - Change callbacks

### `useToggle<T>`

Toggle between two values with type safety.

```tsx
const [value, { toggle, setFirst, setSecond, setValue }] = useToggle(
  first,
  second
);
```

- **Features**:
  - Custom values
  - Type safety
  - Multiple actions
  - State control

### `useWhyDidUpdate`

Debug component re-renders by tracking prop changes.

```tsx
useWhyDidUpdate("ComponentName", props, {
  enabled: process.env.NODE_ENV === "development",
});
```

- **Features**:
  - Prop change tracking
  - Formatted output
  - Development mode
  - Circular reference handling

### `useWindowSize`

Track window dimensions with SSR support.

```tsx
const { innerWidth, innerHeight, outerWidth, outerHeight } = useWindowSize();
```

- **Features**:
  - SSR compatibility
  - Smooth updates
  - Complete dimensions
  - Performance optimization

### `useZoom`

Track browser zoom level changes.

```tsx
const zoomLevel = useZoom();
```

- **Features**:
  - Precise tracking
  - Cross-browser support
  - Real-time updates
  - Device pixel ratio handling

---

# Advanced Hooks API Referance

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

- **Features**:
  - Cache management
  - Auto-fetching
  - Response transformation
  - Error handling
  - Request cancellation

### `useAdvancedSearch<T>`

Advanced search functionality with filtering, sorting, pagination, and debouncing.

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

- **Features**:
  - Multi-field text search
  - Complex filtering
  - Multi-column sorting
  - Pagination controls
  - Debounced updates
  - Type-safe params
  - Custom search logic

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

- **Features**:
  - Instant UI updates
  - Automatic rollback
  - Error handling
  - Type-safe mutations
  - Custom update logic
  - Progress tracking
  - Retry capabilities

---

## 👤 Author

Created by [Pidchashyi](https://github.com/Marian1309/hooks).

---

## 📄 License

MIT © [LICENSE](https://github.com/Marian1309/hooks/blob/main/LICENSE)
