import { useEffect, useRef } from "react";

type ChangedProps<T> = {
  [K in keyof T]?: {
    from: T[K];
    to: T[K];
  };
};

/**
 * Hook to debug why a component re-rendered by tracking prop changes
 * @param {string} componentName Name of the component being debugged
 * @param {T} props Props object to track
 *
 * @example
 * // Basic usage
 * const MyComponent = (props) => {
 *   useWhyDidUpdate("MyComponent", props);
 *   return <div>{props.value}</div>;
 * };
 *
 * // With specific props
 * interface UserProps {
 *   name: string;
 *   age: number;
 *   data?: Record<string, unknown>;
 * }
 *
 * const UserProfile = (props: UserProps) => {
 *   useWhyDidUpdate("UserProfile", props);
 *   return <div>{props.name}</div>;
 * };
 *
 * // With enabled flag for production
 * const DebugComponent = (props) => {
 *   useWhyDidUpdate("DebugComponent", props, {
 *     enabled: process.env.NODE_ENV === "development"
 *   });
 *   return <div>{props.children}</div>;
 * };
 */
const useWhyDidUpdate = <T extends object>(
  componentName: string,
  props: T,
  options: { enabled?: boolean } = { enabled: true }
): void => {
  // Store previous props in a ref
  const previousProps = useRef<T>(props);

  useEffect(() => {
    if (!options.enabled) return;

    if (previousProps.current) {
      // Get all keys from current and previous props
      const allKeys = Object.keys({
        ...previousProps.current,
        ...props,
      }) as Array<keyof T>;
      const changedProps: ChangedProps<T> = {};

      allKeys.forEach((key) => {
        // Skip if undefined in both
        if (
          !previousProps.current.hasOwnProperty(key) &&
          !props.hasOwnProperty(key)
        ) {
          return;
        }

        // Check if the prop changed
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      // If there are changed props, log them
      if (Object.keys(changedProps).length) {
        const changes = Object.entries(changedProps)
          .map(([key, change]) => {
            const from = formatValue((change as { from: unknown }).from);
            const to = formatValue((change as { to: unknown }).to);
            return `\n  ${String(key)}:\n    - From: ${from}\n    - To: ${to}`;
          })
          .join("");

        console.group(`[why-did-update] ${componentName}`);
        console.log("Changed props:", changes);
        console.groupEnd();
      }
    }

    // Update previous props
    previousProps.current = props;
  }, [componentName, props, options.enabled]);
};

/**
 * Format a value for logging
 */
const formatValue = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  if (typeof value === "function") {
    return `Function(${value.name || "anonymous"})`;
  }

  if (typeof value === "object") {
    try {
      // Try to stringify with circular reference handling
      const seen = new WeakSet();
      const formatted = JSON.stringify(
        value,
        (key, val) => {
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) return "[Circular]";
            seen.add(val);
          }
          return val;
        },
        2
      );
      return formatted.length > 100
        ? `${formatted.slice(0, 100)}...`
        : formatted;
    } catch (error) {
      return Object.prototype.toString.call(value);
    }
  }

  return String(value);
};

export default useWhyDidUpdate;
