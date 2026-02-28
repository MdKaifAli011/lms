'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface AttendanceCardProps {
  courseName: string
  attendancePercentage: number
  total: number
  present: number
  absent: number
  order?: number
  href?: string
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

export function AttendanceCard({
  courseName,
  attendancePercentage,
  total,
  present,
  absent,
  order = 0,
  href = '#',
}: AttendanceCardProps) {
  const gradientIndex = order % gradientColors.length
  const gradient = gradientColors[gradientIndex]
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-500'
    if (percentage >= 50) return 'text-orange-600 dark:text-orange-500'
    return 'text-red-600 dark:text-red-500'
  }

  const cardContent = (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50 h-full flex flex-col overflow-hidden">
      {/* Colored Top Border (matching ExamCard) */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      <div className="p-2 sm:p-3 flex-1 flex flex-col">
        {/* Course Name */}
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {courseName}
        </h3>

        {/* Attendance Percentage */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs sm:text-sm font-bold ${getPercentageColor(attendancePercentage)}`}>
              {attendancePercentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div
              className="absolute top-0 left-0 h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>

          {/* Progress Labels */}
          <div className="flex justify-between text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-auto">
          <div className="text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">Total</p>
            <p className="text-xs sm:text-xs font-semibold text-gray-900 dark:text-white">{total}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">Present</p>
            <p className="text-xs sm:text-xs font-semibold text-blue-600 dark:text-blue-400">{present}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">Absent</p>
            <p className="text-xs sm:text-xs font-semibold text-red-600 dark:text-red-400">{absent}</p>
          </div>
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
