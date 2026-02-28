'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface PendingActionCardProps {
  courseName: string
  actionType: string
  description: string
  count?: number
  actionText?: string
  impactMessage?: string
  href?: string
  order?: number
}

// Gradient colors for top border (matching ExamCard)
const gradientColors = [
  'from-blue-500 to-purple-500',
  'from-orange-500 to-yellow-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
]

export function PendingActionCard({
  courseName,
  actionType,
  description,
  count,
  actionText = 'Complete it now!',
  impactMessage = 'It will impact your placement',
  href = '#',
  order = 0,
}: PendingActionCardProps) {
  const gradientIndex = order % gradientColors.length
  const gradient = gradientColors[gradientIndex]

  const cardContent = (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50 h-full flex flex-col overflow-hidden relative">
      {/* Colored Top Border (matching ExamCard) */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      <div className="p-2 sm:p-3 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Course Name */}
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-2 leading-tight">
              {courseName}
            </h3>

            {/* Action Type */}
            <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 mb-2">
              {actionType}
            </p>

            {/* Description with Clock Icon */}
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <p className="text-[10px] sm:text-[11px] text-gray-700 dark:text-gray-300 leading-tight">
                {description}
              </p>
            </div>

            {/* Action Text */}
            <p className="text-[10px] sm:text-[11px] font-semibold text-red-600 dark:text-red-500 mb-0.5">
              {actionText}
            </p>

            {/* Impact Message */}
            <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              {impactMessage}
            </p>
          </div>

          {/* Alert Icon and Count */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
            {count !== undefined && (
              <p className="text-xs sm:text-xs font-bold text-red-600 dark:text-red-500">
                {count}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Arrow */}
        <div className="flex justify-end mt-2">
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </Card>
  )

  return href !== '#' ? (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  )
}
