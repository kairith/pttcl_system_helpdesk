// app/components/common/Header/hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

const useClickOutside = (refs: RefObject<HTMLElement | null>[], callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );
      if (clickedOutside) callback();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs, callback]);
};

export default useClickOutside;