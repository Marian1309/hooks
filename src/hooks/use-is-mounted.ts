import { useEffect, useRef } from "react";

/**
 * Hook to track if a component is mounted
 * @returns {boolean} True if the component is mounted, false otherwise
 */
const useIsMounted = (): boolean => {
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted.current;
};

export default useIsMounted;
