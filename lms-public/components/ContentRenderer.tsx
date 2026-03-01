"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Renders HTML from API contentBody. Use for exam/subject/unit/chapter/topic/subtopic/definition content.
 * Internal <a> links are intercepted for client-side navigation (SPA behavior).
 */
interface ContentRendererProps {
  content?: string | null;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !content) return;

    const anchors = el.querySelectorAll<HTMLAnchorElement>("a[href]");
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        const isSameOrigin =
          typeof window !== "undefined" && url.origin === window.location.origin;
        const path = url.pathname + url.search;
        if (isSameOrigin && path !== window.location.pathname) {
          e.preventDefault();
          router.push(path);
        }
      } catch {
        // ignore invalid URLs
      }
    };

    anchors.forEach((a) => a.addEventListener("click", handleClick));
    return () => anchors.forEach((a) => a.removeEventListener("click", handleClick));
  }, [content, router]);

  if (content == null || content === "") {
    return (
      <p className={cn("text-muted-foreground text-sm", className)}>
        No content available.
      </p>
    );
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        "prose-headings:font-display prose-headings:font-semibold",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-lg",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
