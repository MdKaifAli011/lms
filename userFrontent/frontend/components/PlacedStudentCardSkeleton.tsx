'use client'

import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ExternalLink, Linkedin, Building2, Calendar, Award, TrendingUp } from 'lucide-react'

export function PlacedStudentCardSkeleton() {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50 h-full flex flex-col overflow-hidden relative">
      {/* Animated Gradient Top Border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Profile Section */}
        <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          {/* Profile Avatar with Skeleton */}
          <div className="relative">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              </AvatarFallback>
            </Avatar>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name Skeleton */}
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 rounded-md" />
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
            </div>
            
            {/* Role Skeleton */}
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-28 rounded-md mb-2" />
            
            {/* Achievement Badges */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <Separator className="mb-3 sm:mb-4" />

        {/* Placement Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Date/Batch Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 rounded" />
            </div>
            <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
          </div>

          {/* Company Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 rounded" />
            </div>
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
          </div>

          {/* Salary Package Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-8 sm:h-6 sm:w-10 rounded" />
            </div>
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded" />
          </div>

          {/* Skills/Tags Section */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Skeleton className="h-6 w-12 sm:w-16 rounded-full" />
            <Skeleton className="h-6 w-14 sm:w-20 rounded-full" />
            <Skeleton className="h-6 w-10 sm:w-14 rounded-full" />
            <Skeleton className="h-6 w-16 sm:w-20 rounded-full" />
          </div>
        </div>
      </CardContent>

      {/* Footer with Action Buttons */}
      <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2 sm:gap-3">
        {/* LinkedIn Button Skeleton */}
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
          <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        {/* View Profile Button Skeleton */}
        <div className="flex-1 h-8 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            <Skeleton className="h-3 w-16 sm:w-20 rounded bg-white/20" />
          </div>
        </div>
      </CardFooter>

      {/* Floating Achievement Badge */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
          <Award className="h-3 w-3" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </Card>
  )
}
