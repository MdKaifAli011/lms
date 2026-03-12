"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import parse, { type DOMNode, Element } from "html-react-parser";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content?: string | null;
  /** When set (e.g. from server), render immediately — no async DOMPurify, no layout shift. */
  preProcessedHtml?: string | null;
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

const DEFAULT_IMAGE_WIDTH = 800;
const DEFAULT_IMAGE_HEIGHT = 600;

function replaceImgWithNextImage(domNode: DOMNode): React.ReactElement | null | undefined {
  if (!(domNode instanceof Element) || domNode.name !== "img") return undefined;
  const attrs = domNode.attribs;
  const src = attrs?.src;
  if (!src || typeof src !== "string") return undefined;

  const width = attrs["data-width"] ? parseInt(attrs["data-width"], 10) : DEFAULT_IMAGE_WIDTH;
  const height = attrs["data-height"] ? parseInt(attrs["data-height"], 10) : DEFAULT_IMAGE_HEIGHT;
  const priority = attrs["data-priority"] === "true";
  const alt = (attrs.alt ?? "").trim() || "Content image";

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="max-w-full h-auto rounded-lg my-4"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      sizes="(max-width: 768px) 100vw, 800px"
      unoptimized={src.startsWith("data:")}
    />
  );
}

export function ContentRenderer({ content, preProcessedHtml, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [processedHtml, setProcessedHtml] = useState(preProcessedHtml ?? "");
  const hasContent = Boolean((preProcessedHtml ?? content)?.trim());

  useEffect(() => {
    if (preProcessedHtml != null && preProcessedHtml !== "") {
      setProcessedHtml(preProcessedHtml);
      return;
    }
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
  }, [content, preProcessedHtml]);

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

  if (!(preProcessedHtml ?? content)?.trim()) {
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
      style={hasContent && !processedHtml && !preProcessedHtml ? { minHeight: "12rem" } : undefined}
    >
      {parse(processedHtml, { replace: replaceImgWithNextImage })}
    </div>
  );
}
