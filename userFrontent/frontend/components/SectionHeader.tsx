'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SectionHeaderProps {
  title: string
  onPrev?: () => void
  onNext?: () => void
  showNavigation?: boolean
}

export function SectionHeader({ 
  title, 
  onPrev, 
  onNext, 
  showNavigation = true 
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="More information"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {showNavigation && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-700"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-700"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
