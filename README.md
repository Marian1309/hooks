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

## ⚙️ API Overview

### `useZoom`

Detects the current browser zoom level by tracking `window.devicePixelRatio`. Automatically updates on resize and display resolution changes.

### `useScrollPosition`

Tracks vertical scroll position (`scrollY`) with passive scroll event listener for performant updates.

### `useMounted`

Returns a boolean indicating if the component has been mounted (useful for SSR and client-only logic).

### `useFocusDetection`

Detects when the browser tab or window loses or gains focus using the Page Visibility API. Optional callback on focus loss.

### `useDeviceType`

Determines if the current device viewport is mobile (`<768px`) or desktop, with live updates on window resize.

### `useDebounce<T>(value: T, delay?: number)`

Debounces a changing value by the given delay (default 500ms), returning the debounced value to limit rapid state updates.

### `useLocalStorage<T>(key: string)`

Manages a stateful value synchronized with `localStorage`. Provides getter, setter, and remover with JSON serialization and safe error handling. Syncs across tabs via the `storage` event.

---

## 🔧 Usage Examples

### Detect Zoom Level

```tsx
import { useZoom } from "@pidchashyi/hooks";

const ZoomComponent = () => {
  const zoom = useZoom();

  return <div>Current zoom level: {zoom}</div>;
};
```

### Track Scroll Position

```tsx
import { useScrollPosition } from "@pidchashyi/hooks";

const ScrollComponent = () => {
  const scrollY = useScrollPosition();

  return <div>Scroll position: {scrollY}px</div>;
};
```

### Debounce Input Value

```tsx
import { useDebounce } from "@pidchashyi/hooks";
import { useState } from "react";

const Search = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Use debouncedQuery for API calls or heavy operations

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};
```

### Persist State with localStorage

```tsx
import { useLocalStorage } from "@pidchashyi/hooks";

const ThemeToggle = () => {
  const { value: theme, set: setTheme } = useLocalStorage<string>("app-theme");

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme (Current: {theme ?? "light"})
    </button>
  );
};
```

---

## 🛠️ Hook Options & Details

### `useFocusDetection`

```ts
useFocusDetection({ onFocusLoss?: () => void, enabled?: boolean });
```

- `onFocusLoss`: callback triggered when tab/window loses focus.
- `enabled`: disable the hook by passing `false`.

---

## 👤 Author

Created by [Pidchashyi](https://github.com/Marian1309/hooks).

---

## 📄 License

MIT © [LICENSE](https://github.com/Marian1309/hooks/blob/main/LICENSE)

---
