/**
 * Server-side HTML processing for exam/content body.
 * Use in Server Components so the main content is in the first paint (better LCP, no CLS from empty→full).
 */

import DOMPurify from "isomorphic-dompurify";

function wrapTables(html: string): string {
  if (!html?.trim()) return html;
  return html.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    if (match.includes("table-wrapper")) return match;
    return `<div class="table-wrapper overflow-x-auto w-full my-6">${match}</div>`;
  });
}

function enhanceImages(html: string): string {
  let first = true;
  return html.replace(/<img(\s[^>]*?)>/gi, (_, rest: string) => {
    const hasWidth = /width=["']?(\d+)/i.test(rest);
    const hasHeight = /height=["']?(\d+)/i.test(rest);
    const widthMatch = rest.match(/width=["']?(\d+)/i);
    const heightMatch = rest.match(/height=["']?(\d+)/i);
    const w = widthMatch ? widthMatch[1] : "";
    const h = heightMatch ? heightMatch[1] : "";
    const dataAttrs =
      (w ? ` data-width="${w}"` : "") + (h ? ` data-height="${h}"` : "");
    const priorityAttr = first ? ' data-priority="true"' : "";
    const reserveClass =
      !hasWidth && !hasHeight && !/aspect-ratio|style=["'][^"']*aspect/i.test(rest)
        ? " lexical-img-reserve"
        : "";
    first = false;
    return `<img loading="lazy" decoding="async" class="max-w-full h-auto rounded-lg my-4${reserveClass}"${dataAttrs}${priorityAttr}${rest}>`;
  });
}

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>(.*?)<\/\1>/gi, (_, tag: string, text: string) => {
    const id = text
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

/**
 * Sanitize and process HTML for safe display. Run on the server so first paint includes content (LCP, CLS).
 */
export function processContentForDisplay(html: string | null | undefined): string {
  if (!html?.trim()) return "";
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const wrapped = wrapTables(clean);
  const withImages = enhanceImages(wrapped);
  return addHeadingIds(withImages);
}
