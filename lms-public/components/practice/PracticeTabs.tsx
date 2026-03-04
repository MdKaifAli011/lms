"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Tests", href: "/practice" },
  { id: "level-wise", label: "Practice Tests", href: "/practice/level-wise" },
  { id: "full-length", label: "Full-Length Mocks", href: "/mock-tests" },
  { id: "previous-year-paper", label: "Previous Year Papers", href: "/practice/previous-year-paper" },
] as const;

export function PracticeTabs() {
  const pathname = usePathname() ?? "";

  const activeId = (() => {
    if (pathname === "/practice" || pathname === "/practice/") return "all";
    if (pathname.startsWith("/practice/level-wise")) return "level-wise";
    if (pathname.startsWith("/mock-tests")) return "full-length";
    if (pathname.startsWith("/practice/previous-year-paper")) return "previous-year-paper";
    return "all";
  })();

  return (
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-white dark:bg-card border border-gray-200 dark:border-border text-foreground hover:bg-gray-50 dark:hover:bg-muted/50 hover:border-gray-300 dark:hover:border-border"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
