"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export interface NavigationLoadingContextValue {
  isNavigating: boolean;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setIsNavigating(false);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        const isSameOrigin = typeof window !== "undefined" && url.origin === window.location.origin;
        const isHashOnly = url.pathname === window.location.pathname && url.hash;
        if (isSameOrigin && url.pathname !== window.location.pathname && !isHashOnly) {
          setIsNavigating(true);
        }
      } catch {
        // ignore
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): NavigationLoadingContextValue | null {
  return useContext(NavigationLoadingContext);
}
