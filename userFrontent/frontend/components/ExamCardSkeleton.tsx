'use client'

import React from 'react'

export function ExamCardSkeleton() {
  return (
    <article className="h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl min-w-0 bg-white/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] animate-pulse">
      <div className="h-24 min-[480px]:h-28 sm:h-32 md:h-36 bg-slate-200 dark:bg-white/10 shrink-0" />

      <div className="flex flex-1 flex-col min-w-0 p-2.5 min-[480px]:p-3 sm:p-3 md:p-4">
        <div className="flex justify-between items-start gap-1.5 min-[480px]:gap-2 mb-1.5 min-[480px]:mb-2">
          <div className="h-4 min-[480px]:h-5 sm:h-5 md:h-6 bg-slate-200 dark:bg-white/15 rounded w-2/3" />
          <div className="text-right shrink-0">
            <div className="h-2.5 bg-slate-200 dark:bg-white/15 rounded w-10 mb-0.5" />
            <div className="h-2 bg-slate-200/80 dark:bg-white/10 rounded w-8" />
          </div>
        </div>

        <div className="space-y-1 mb-2 min-[480px]:mb-3 sm:mb-3">
          <div className="h-3 min-[480px]:h-3.5 bg-slate-200 dark:bg-white/15 rounded w-full" />
          <div className="h-3 min-[480px]:h-3.5 bg-slate-200 dark:bg-white/15 rounded w-4/5" />
        </div>

        <div className="flex items-center justify-between gap-1.5 min-[480px]:gap-2 border-t border-slate-200 dark:border-white/5 pt-2.5 min-[480px]:pt-3 sm:pt-3 mt-auto">
          <div className="h-3 bg-slate-200 dark:bg-white/15 rounded w-14" />
          <div className="h-8 min-[480px]:h-9 w-16 min-[480px]:w-20 bg-slate-200 dark:bg-white/15 rounded-md min-[480px]:rounded-lg" />
        </div>
      </div>
    </article>
  )
}
