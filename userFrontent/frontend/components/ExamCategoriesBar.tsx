'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ExamCategoriesBarProps {
  exams?: Array<{
    id: string
    slug?: string
    title: string
  }>
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

const DEFAULT_EXAMS = [
  { title: 'NEET', slug: 'neet' },
  { title: 'JEE', slug: 'jee' },
  { title: 'SAT', slug: 'sat' },
  { title: 'AP', slug: 'ap' },
  { title: 'IB', slug: 'ib' },
  { title: 'CUET', slug: 'cuet' },
  { title: 'IGCSE', slug: 'igcse' },
  { title: 'MCAT', slug: 'mcat' },
  { title: 'LSAT', slug: 'lsat' },
]

export function ExamCategoriesBar({
  exams,
  sidebarOpen = true,
  onToggleSidebar,
}: ExamCategoriesBarProps) {
  const pathname = usePathname()
  const [scrollPosition, setScrollPosition] = React.useState(0)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const displayExams =
    exams && exams.length > 0
      ? exams.map((exam) => ({
          title: exam.title.toUpperCase(),
          slug: exam.slug || exam.id,
        }))
      : DEFAULT_EXAMS

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('exam-categories-scroll')
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  React.useEffect(() => {
    if (!isClient) return
    const container = document.getElementById('exam-categories-scroll')
    if (container) {
      const handleScroll = () => setScrollPosition(container.scrollLeft)
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [isClient])

  const estimatedItemWidth = 72
  const canScrollLeft = isClient && scrollPosition > 0
  const canScrollRight = isClient && window.innerWidth > 0 && scrollPosition < Math.max(0, displayExams.length * estimatedItemWidth - window.innerWidth + 80)

  return (
    <div className="bg-gray-900 dark:bg-black border-b border-gray-800 fixed top-12 sm:top-14 left-0 right-0 z-40">
      <div className="container mx-auto px-2 sm:px-3">
        <div className="flex items-center gap-1.5 sm:gap-2 h-6 sm:h-7 min-[480px]:h-7">
          {/* Hamburger Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-white hover:text-gray-300 transition-colors flex-shrink-0 rounded"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          )}

          {/* Scroll Buttons - Desktop Only */}
          <div className="hidden md:flex items-center gap-0.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`flex items-center justify-center w-5 h-5 rounded transition-colors
                ${canScrollLeft 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`flex items-center justify-center w-5 h-5 rounded transition-colors
                ${canScrollRight 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Exam Categories */}
          <div 
            id="exam-categories-scroll"
            className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide flex-1 scroll-smooth min-h-0"
          >
            {displayExams.map((exam) => {
              const isActive =
                pathname === `/exam/${exam.slug}` || pathname.startsWith(`/exam/${exam.slug}/`)

              return (
                <Link
                  key={exam.slug}
                  href={`/exam/${exam.slug}`}
                  className={`
                    relative whitespace-nowrap text-[10px] sm:text-xs font-semibold tracking-wide uppercase
                    transition-colors flex-shrink-0
                    ${isActive ? 'text-blue-500' : 'text-white hover:text-blue-500'}
                  `}
                >
                  <span className="py-0.5 sm:py-1 inline-block">{exam.title}</span>

                  {/* Underline */}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 h-[1.5px] sm:h-[2px] w-full bg-blue-500" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="md:hidden flex items-center shrink-0">
            <div className="w-6 h-0.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ 
                  width: `${Math.min((scrollPosition / Math.max(displayExams.length * estimatedItemWidth, 1)) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
