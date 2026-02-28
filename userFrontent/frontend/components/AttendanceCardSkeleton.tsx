'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

export function AttendanceCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden animate-pulse">
      {/* Colored Top Border Skeleton */}
      <div className="h-1 bg-gray-300 dark:bg-gray-700" />

      <div className="p-3 flex-1 flex flex-col">
        {/* Course Name Skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4" />

        {/* Attendance Percentage Skeleton */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
          </div>

          {/* Progress Bar Skeleton */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-1">
            <div className="absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-700 rounded-full w-2/3" />
          </div>

          {/* Progress Labels Skeleton */}
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-8" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-10" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          <div className="text-center">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-8 mx-auto mb-0.5" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-10 mx-auto mb-0.5" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-10 mx-auto mb-0.5" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto" />
          </div>
        </div>
      </div>
    </Card>
  )
}
