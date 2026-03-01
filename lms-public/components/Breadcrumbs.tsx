"use client";

import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items?.length) return null;

  const isFirstItemExam =
    items[0]?.label?.toLowerCase().includes("exam") ||
    items[0]?.href?.toLowerCase().includes("/exam") ||
    items[0]?.href === "/";
  const itemsToShow = isFirstItemExam ? items.slice(1) : items;
  const shouldShowEllipsis = itemsToShow.length > 3;
  const visibleItems = shouldShowEllipsis ? itemsToShow.slice(itemsToShow.length - 3) : itemsToShow;

  return (
    <nav
      className={cn(
        "mb-2 sm:mb-2.5 md:mb-3 flex items-center gap-0.5 text-[10px] sm:text-xs overflow-x-auto overflow-y-visible scrollbar-hide w-full",
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center gap-0.5 min-w-0 flex-1">
        {isFirstItemExam && items[0] && (
          <li className="flex items-center min-w-0">
            <Link
              href={items[0].href}
              className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg",
                "bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20",
                "border border-blue-300/40 dark:border-blue-600/40 text-blue-700 dark:text-blue-300",
                "hover:opacity-90 transition-all font-semibold text-[10px] sm:text-xs"
              )}
            >
              <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{items[0].label}</span>
            </Link>
          </li>
        )}
        {shouldShowEllipsis && (
          <>
            <li className="flex items-center px-0.5 sm:px-1">
              <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs">...</span>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
            </li>
          </>
        )}
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const shouldShowSeparator = index > 0 || shouldShowEllipsis || (index === 0 && isFirstItemExam);
          return (
            <li key={`${item.href}-${index}`} className="flex items-center min-w-0">
              {shouldShowSeparator && (
                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
              )}
              {isLast ? (
                <span
                  className="inline-flex items-center max-w-[140px] sm:max-w-[180px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md truncate font-semibold text-[10px] sm:text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                  title={item.label}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center max-w-[110px] sm:max-w-[140px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md truncate font-medium text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200/50 transition-all"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
