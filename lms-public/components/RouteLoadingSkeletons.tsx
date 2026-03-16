"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared shell for all route loading UIs: mimics Header + ExamCategoriesBar + spacer
 * so layout does not jump when the real page loads.
 */
function RouteLoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="route-loading-bar" aria-hidden />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <Skeleton className="h-8 w-32 sm:w-40 rounded-md" />
            <div className="hidden lg:flex items-center gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-16 rounded" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </header>
      <div className="bg-slate-900 dark:bg-black border-b border-slate-800 fixed top-12 sm:top-14 left-0 right-0 z-40">
        <div className="container mx-auto px-2 sm:px-3">
          <div className="flex items-center gap-2 sm:gap-3 h-6 sm:h-7 min-[480px]:h-7">
            <Skeleton className="h-4 w-4 rounded bg-slate-700 shrink-0" />
            <div className="flex gap-3 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className="h-3 w-12 sm:w-14 rounded bg-slate-700/80"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[80px] sm:h-[92px]" aria-hidden />
      {children}
    </div>
  );
}

/**
 * Skeleton for simple pages: home, exam list.
 */
export function PageLoadingSkeleton({
  showSectionTitle = true,
  cardCount = 8,
  className,
}: {
  showSectionTitle?: boolean;
  cardCount?: number;
  className?: string;
}) {
  return (
    <RouteLoadingShell>
      <div
        className={cn(
          "w-full max-w-7xl mx-auto px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-16",
          className,
        )}
      >
        {showSectionTitle && (
          <div className="mb-8 sm:mb-10 md:mb-12 text-center">
            <Skeleton className="h-3 w-24 mx-auto mb-3 rounded-full" />
            <Skeleton className="h-8 sm:h-10 w-64 sm:w-80 mx-auto rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full mx-auto mt-3 rounded" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: cardCount }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </RouteLoadingShell>
  );
}

function CardSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl min-w-0 bg-card border border-border animate-pulse">
      <Skeleton className="h-24 min-[480px]:h-28 sm:h-32 md:h-36 w-full shrink-0 rounded-none" />
      <div className="flex-1 p-3 sm:p-4 space-y-2">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-5 w-2/3 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
        <div className="flex justify-between items-center pt-3 mt-auto border-t border-border">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for hierarchy pages: exam/[slug], subject, unit, chapter, topic, subtopic, definition.
 */
export function HierarchyLoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <RouteLoadingShell>
      <div className="flex flex-1 relative">
        <aside className="hidden md:block w-80 shrink-0 border-r border-border bg-background/95 py-4">
          <div className="px-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
            <div className="mb-3 sm:mb-4 flex items-center gap-1">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <Skeleton className="h-5 w-32 rounded" />
            </div>
            <Skeleton className="h-8 sm:h-9 md:h-10 w-3/4 max-w-md mb-2 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xl mb-6 rounded" />
            <div className="space-y-3 mt-6 sm:mt-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "h-4 rounded",
                    i === 3 && "w-5/6",
                    i === 5 && "w-4/5",
                  )}
                />
              ))}
            </div>
            <div className="mt-8 sm:mt-10 flex items-center justify-between">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <aside className="hidden lg:block w-16 shrink-0 border-l border-border" />
      </div>
    </RouteLoadingShell>
  );
}

/**
 * Main content area only. Use inside HierarchyShell when navigating, or as loading.tsx for hierarchy routes.
 */
export function MainContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="mb-3 sm:mb-4 flex items-center gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <Skeleton className="h-8 sm:h-9 md:h-10 w-3/4 max-w-md mb-2 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-xl mb-6 rounded" />
        <div className="space-y-3 mt-6 sm:mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4 rounded",
                i === 3 && "w-5/6",
                i === 5 && "w-4/5",
              )}
            />
          ))}
        </div>
        <div className="mt-8 sm:mt-10 flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Quiz page: breadcrumbs, section title, quiz card (header + question + options grid + prev/next).
 * Main content only (used inside HierarchyShell for /quiz routes).
 */
export function QuizPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="mb-3 sm:mb-4 flex items-center gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border/60 bg-muted/30 px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Skeleton className="h-5 w-40 sm:w-52 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-2 w-2 rounded-full" />
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Skeleton className="h-4 w-28 mb-2 rounded" />
            <Skeleton className="h-5 w-full max-w-xl mb-6 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Flashcards page: breadcrumbs, section title, flashcard card (flip area + prev/next).
 * Main content only (used inside HierarchyShell for /flashcards routes).
 */
export function FlashcardPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="mb-3 sm:mb-4 flex items-center gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 sm:p-6">
            <Skeleton className="h-4 w-24 mb-3 rounded" />
            <Skeleton className="h-[180px] sm:h-[200px] w-full rounded-xl mb-2" />
            <Skeleton className="h-3 w-24 mx-auto rounded" />
            <div className="flex flex-wrap justify-between gap-3 mt-6 pt-4 border-t border-border">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Syllabus page: breadcrumbs, header, tree-like skeleton, Expand/Collapse buttons.
 * Main content only (used inside HierarchyShell).
 */
export function SyllabusPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="mb-3 sm:mb-4 flex items-center gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <header className="mb-6 sm:mb-8">
          <Skeleton className="h-8 sm:h-9 md:h-10 w-64 sm:w-80 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl rounded" />
        </header>
        <div className="mt-6 sm:mt-8 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton
                  className={cn(
                    "h-5 rounded",
                    i === 0 && "w-28",
                    i === 1 && "w-24",
                    i === 2 && "w-32",
                  )}
                />
                <Skeleton className="h-3 w-20 rounded shrink-0 ml-auto" />
              </div>
              {i < 2 && (
                <div className="pl-6 space-y-1">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded shrink-0" />
                      <Skeleton className={cn("h-4 rounded", "w-36")} />
                      <Skeleton className="h-3 w-16 rounded shrink-0 ml-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-10 flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Mock Tests hub: main content area only (no shell).
 * Section header, search bar, featured card block, filter pills, grid of mock test cards.
 */
export function MockTestsHubSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14",
        className,
      )}
    >
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div className="space-y-3">
          <Skeleton className="h-1 w-10 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 sm:h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
        <Skeleton className="h-10 w-full md:w-80 rounded-xl" />
      </div>
      <div className="mb-10 sm:mb-12 rounded-xl overflow-hidden border border-border">
        <Skeleton className="h-48 sm:h-56 w-full rounded-none" />
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-14 rounded" />
              <Skeleton className="h-8 w-14 rounded" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div className="flex gap-1">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 sm:mt-12 flex justify-center">
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Mock Tests setup page ([testSlug]): main content area only (no shell).
 */
export function MockTestsSetupSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-6 sm:py-8",
        className,
      )}
    >
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl rounded" />
        </div>
        <Skeleton className="h-16 w-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      <div className="mt-6 mb-12 rounded-2xl border border-border p-5 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-3 max-w-2xl w-full">
            <Skeleton className="h-5 w-5 rounded shrink-0" />
            <Skeleton className="h-12 flex-1 rounded" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal loading: shell + centered spinner.
 */
export function MinimalRouteLoading({ className }: { className?: string }) {
  return (
    <RouteLoadingShell>
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[50vh] gap-4",
          className,
        )}
      >
        <div
          className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </RouteLoadingShell>
  );
}

/**
 * Below-the-fold skeleton for exam page: syllabus link, subject grid placeholder, quiz placeholder, nav.
 * Used inside Suspense for progressive loading.
 */
export function BelowFoldSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
      </div>
      <div className="min-h-[280px] rounded-2xl border border-dashed border-border/60 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Practice hub (/practice): matches layout for stable CLS and fast FCP.
 * Hero: analytics card (2/3) + weekly growth (1/3), then tabs. Content: recommended grid, mock rows, previous year.
 */
export function PracticePageSkeleton() {
  return (
    <RouteLoadingShell>
      <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-8 sm:pt-10 md:pt-12 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/80 p-5 sm:p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-5 sm:mb-6">
              <div className="space-y-1">
                <Skeleton className="h-7 w-48 sm:w-56 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 sm:h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-5 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-6 w-14 rounded" />
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2 h-24 sm:h-28 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="flex-1 rounded-t min-w-0" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
        <section className="rounded-2xl border border-border bg-white/80 dark:bg-card/60 py-3 px-4 mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24 sm:w-28 rounded-full" />
            ))}
          </div>
        </section>
      </div>
      <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 space-y-14 sm:space-y-16 pb-16 sm:pb-20 md:pb-24">
        <section className="pt-8 min-h-[320px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-1 rounded-full shrink-0" />
              <Skeleton className="h-8 w-64 sm:w-72 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-full min-h-[240px] rounded-2xl border border-border bg-card/60 p-4 sm:p-5 md:p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-5 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-full max-w-[85%] rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-[80%] max-w-full rounded" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-4" />
              </div>
            ))}
          </div>
        </section>
        <section className="min-h-[220px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-1 rounded-full shrink-0" />
              <Skeleton className="h-8 w-56 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 sm:h-28 rounded-2xl border border-border bg-card/60 p-4 sm:p-5 md:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <Skeleton className="h-5 w-48 sm:w-56 rounded" />
                    <Skeleton className="h-4 w-36 rounded" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </section>
        <section className="min-h-[180px]">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-8 w-1 rounded-full shrink-0" />
            <Skeleton className="h-8 w-52 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </section>
      </div>
    </RouteLoadingShell>
  );
}

/**
 * Practice sub-routes (level-wise, full-length, previous-year): shell with back link, tabs, title, then content grid.
 * Use in practice/level-wise/loading.tsx, practice/full-length/loading.tsx, practice/previous-year-paper/loading.tsx.
 */
export function PracticeShellSkeleton() {
  return (
    <RouteLoadingShell>
      <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-10 sm:pt-12 md:pt-14 pb-10 sm:pb-12 md:pb-14">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-4 w-32 mb-3 rounded" />
          <div className="rounded-2xl border border-border bg-white/80 dark:bg-card/60 py-3 px-4 mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24 sm:w-28 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-9 sm:h-10 w-3/4 max-w-md rounded-lg mb-2" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-full min-h-[240px] rounded-2xl border border-border bg-card/60 p-4 sm:p-5 md:p-6 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-full max-w-[85%] rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-10 w-full rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    </RouteLoadingShell>
  );
}
