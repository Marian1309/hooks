import { useEffect, useState } from "react";

/**
 * Hook to track if a component is mounted
 * @returns {boolean} True if the component is mounted, false otherwise
 */
const useIsMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  return isMounted;
};

export default useIsMounted;
