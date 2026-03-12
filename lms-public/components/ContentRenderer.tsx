"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

/** Enhance images (lazy load + responsive + reserve space to reduce CLS) */
function enhanceImages(html: string): string {
  return html.replace(
    /<img(\s[^>]*?)>/gi,
    (_, rest) => {
      const hasWidth = /width=["']/i.test(rest);
      const hasHeight = /height=["']/i.test(rest);
      const hasAspect = /aspect-ratio|style=["'][^"']*aspect/i.test(rest);
      const reserveClass = !hasWidth && !hasHeight && !hasAspect
        ? " lexical-img-reserve"
        : "";
      return `<img loading="lazy" decoding="async" class="max-w-full h-auto rounded-lg my-4${reserveClass}"${rest}>`;
    }
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
  const [processedHtml, setProcessedHtml] = useState("");
  const hasContent = Boolean(content?.trim());

  useEffect(() => {
    if (!content?.trim()) {
      setProcessedHtml("");
      return;
    }
    void import("dompurify").then(({ default: DOMPurify }) => {
      let clean = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
      clean = wrapTables(clean);
      clean = enhanceImages(clean);
      clean = addHeadingIds(clean);
      setProcessedHtml(clean);
    });
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
      style={hasContent && !processedHtml ? { minHeight: "12rem" } : undefined}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
