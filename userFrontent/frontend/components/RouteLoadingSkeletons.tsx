'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Shared shell for all route loading UIs: mimics Header + ExamCategoriesBar + spacer
 * so layout doesn’t jump when the real page loads.
 */
function RouteLoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Thin top progress bar for route loading */}
      <div className="route-loading-bar" aria-hidden />

      {/* Header skeleton – same height as real header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
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

      {/* Exam categories bar skeleton – always dark like real bar */}
      <div className="bg-gray-900 dark:bg-black border-b border-gray-800 fixed top-12 sm:top-14 left-0 right-0 z-40">
        <div className="container mx-auto px-2 sm:px-3">
          <div className="flex items-center gap-2 sm:gap-3 h-6 sm:h-7 min-[480px]:h-7">
            <Skeleton className="h-4 w-4 rounded bg-gray-700 shrink-0" />
            <div className="flex gap-3 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-3 w-12 sm:w-14 rounded bg-gray-700/80" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header + bar (matches home: 80px) */}
      <div className="h-[80px]" aria-hidden />

      {children}
    </div>
  )
}

/**
 * Skeleton for “simple” pages: home, exam list, practice, materials, about, mock-tests.
 * Shell + content area with optional section title and card grid.
 */
export function PageLoadingSkeleton({
  showSectionTitle = true,
  cardCount = 8,
  className,
}: {
  showSectionTitle?: boolean
  cardCount?: number
  className?: string
}) {
  return (
    <RouteLoadingShell>
      <div
        className={cn(
          'w-full max-w-7xl mx-auto px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-16',
          className
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
  )
}

/** Single card skeleton matching ExamCard proportions */
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
  )
}

/**
 * Skeleton for hierarchy pages: exam/[slug], subject, unit, chapter, topic, subtopic, definition.
 * Shell + sidebar strip + main (breadcrumbs, title, lines, nav).
 */
export function HierarchyLoadingSkeleton({ className }: { className?: string }) {
  return (
    <RouteLoadingShell>
      {/* Spacer for hierarchy uses 72px/84px; we already used 80px in shell, close enough for skeleton */}
      <div className="flex flex-1 relative">
        {/* Left sidebar skeleton */}
        <aside className="hidden md:block w-80 flex-shrink-0 border-r border-border bg-background/95 py-4">
          <div className="px-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
            {/* Breadcrumbs */}
            <div className="mb-3 sm:mb-4 flex items-center gap-1">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <Skeleton className="h-5 w-32 rounded" />
            </div>

            {/* Title */}
            <Skeleton className="h-8 sm:h-9 md:h-10 w-3/4 max-w-md mb-2 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xl mb-6 rounded" />

            {/* Content lines */}
            <div className="space-y-3 mt-6 sm:mt-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  className={cn('h-4 rounded', i === 3 && 'w-5/6', i === 5 && 'w-4/5')}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className="mt-8 sm:mt-10 flex items-center justify-between">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right sidebar placeholder (study tools) – narrow strip */}
        <aside className="hidden lg:block w-16 flex-shrink-0 border-l border-border" />
      </div>
    </RouteLoadingShell>
  )
}

/**
 * Skeleton for the main content area only (no header, no sidebars).
 * Use inside HierarchyPageLayout when navigating so only the center block shows loading.
 */
export function MainContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-7xl mx-auto', className)}>
      {/* Thin loading bar at top of main content */}
      <div className="route-loading-bar-inline" aria-hidden />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        {/* Breadcrumbs */}
        <div className="mb-3 sm:mb-4 flex items-center gap-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        {/* Title */}
        <Skeleton className="h-8 sm:h-9 md:h-10 w-3/4 max-w-md mb-2 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-xl mb-6 rounded" />
        {/* Content lines */}
        <div className="space-y-3 mt-6 sm:mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className={cn('h-4 rounded', i === 3 && 'w-5/6', i === 5 && 'w-4/5')}
            />
          ))}
        </div>
        {/* Nav buttons */}
        <div className="mt-8 sm:mt-10 flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Mock Tests hub: main content area only (no shell).
 * Section header, search bar, featured card block, filter pills, grid of mock test cards.
 */
export function MockTestsHubSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14', className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div className="space-y-3">
          <Skeleton className="h-1 w-10 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 sm:h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
        <Skeleton className="h-10 w-full md:w-80 rounded-xl" />
      </div>
      {/* Featured card block */}
      <div className="mb-10 sm:mb-12 rounded-xl overflow-hidden border border-border">
        <Skeleton className="h-48 sm:h-56 w-full rounded-none" />
      </div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      {/* Grid of mock test cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
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
  )
}

/**
 * Mock Tests setup page ([testSlug]): main content area only (no shell).
 * Header line, stats grid, two-column (regulations + system check), footer actions.
 */
export function MockTestsSetupSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-6 sm:py-8', className)}>
      <div className="route-loading-bar-inline" aria-hidden />
      {/* Header */}
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
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      {/* Footer actions */}
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
  )
}

/**
 * Minimal loading fallback: shell + single centered spinner/shimmer.
 * Use for very fast routes if you want a lighter UI.
 */
export function MinimalRouteLoading({ className }: { className?: string }) {
  return (
    <RouteLoadingShell>
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[50vh] gap-4',
          className
        )}
      >
        <div
          className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </RouteLoadingShell>
  )
}
