'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

export function PendingActionCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden animate-pulse relative">
      {/* Colored Top Border Skeleton */}
      <div className="h-1 bg-gray-300 dark:bg-gray-700" />

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Course Name Skeleton */}
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-0.5 w-3/4" />

            {/* Action Type Skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2 w-1/2" />

            {/* Description Skeleton */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="h-3.5 w-3.5 bg-gray-300 dark:bg-gray-700 rounded flex-shrink-0" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            </div>

            {/* Action Text Skeleton */}
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-0.5 w-2/3" />

            {/* Impact Message Skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          </div>

          {/* Alert Icon and Count Skeleton */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="h-7 w-7 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-6" />
          </div>
        </div>

        {/* Navigation Arrow Skeleton */}
        <div className="flex justify-end mt-2">
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </Card>
  )
}
