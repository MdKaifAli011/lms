"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

const DEFAULT_ROOT_MARGIN = "200px";
const DEFAULT_THRESHOLD = 0.01;

/**
 * Renders children only when the placeholder is near or in the viewport.
 * Use for below-the-fold sections to avoid loading heavy content until the user scrolls.
 * Reduces initial JS and server work.
 */
export function LazyBelowFold({
  children,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
  fallback = null,
}: {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
  fallback?: ReactNode;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  if (inView) return <>{children}</>;
  return (
    <div ref={ref} aria-hidden="true">
      {fallback}
    </div>
  );
}
