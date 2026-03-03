"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content?: string | null;
  className?: string;
}

/** Wrap <table> safely (avoid double wrapping) */
function wrapTables(html: string): string {
  if (!html?.trim()) return html;

  return html.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    if (match.includes("table-wrapper")) return match;
    return `<div class="table-wrapper overflow-x-auto w-full my-6">${match}</div>`;
  });
}

/** Enhance images (lazy load + responsive) */
function enhanceImages(html: string): string {
  return html.replace(
    /<img(.*?)>/gi,
    `<img loading="lazy" decoding="async" class="max-w-full h-auto rounded-lg my-4"$1>`,
  );
}

/** Optional: Add IDs to headings (for future anchor links / TOC) */
function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>(.*?)<\/\1>/gi, (_, tag, text) => {
    const id = text
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const processedHtml = useMemo(() => {
    if (!content?.trim()) return "";

    // 🔐 Proper Sanitization (Production Safe)
    let clean = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
    });

    clean = wrapTables(clean);
    clean = enhanceImages(clean);
    clean = addHeadingIds(clean);

    return clean;
  }, [content]);

  /* 🔥 Improved Link Handling (Event Delegation) */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor || !anchor.href) return;

      try {
        const url = new URL(anchor.href);
        const isInternal =
          typeof window !== "undefined" &&
          url.origin === window.location.origin;

        if (isInternal) {
          e.preventDefault();
          router.push(url.pathname + url.search);
        } else {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }
      } catch {
        // ignore invalid URL
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [router]);

  if (!content?.trim()) {
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
        "lexical-content content-reading prose max-w-none",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
