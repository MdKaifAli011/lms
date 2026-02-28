'use client'

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CarouselSectionProps {
  title: string
  children: React.ReactNode
  showNavigation?: boolean
}

export function CarouselSection({ 
  title, 
  children, 
  showNavigation = true 
}: CarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {showNavigation && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-700"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-700"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
      >
        {children}
      </div>
    </section>
  )
}
