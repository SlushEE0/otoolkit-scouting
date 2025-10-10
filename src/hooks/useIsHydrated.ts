import { useEffect, useRef } from "react";

export function useIsHydrated() {
  const isHydrated = useRef(false);

  useEffect(() => {
    isHydrated.current = true;
  }, []);

  return isHydrated;
}
