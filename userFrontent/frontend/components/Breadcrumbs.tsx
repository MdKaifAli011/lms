'use client'

import Link from 'next/link'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  // Check if first item is Exam (could be href starting with /exam or label contains "Exam")
  const isFirstItemExam = items[0]?.label?.toLowerCase().includes('exam') || 
                          items[0]?.href?.toLowerCase().includes('/exam') ||
                          items[0]?.href === '/'

  // On mobile, show only last 3 breadcrumbs with ellipsis if needed
  // If first item is Exam and we're showing it as badge, exclude it from visible items when not showing ellipsis
  const itemsToShow = isFirstItemExam ? items.slice(1) : items
  const shouldShowEllipsis = itemsToShow.length > 3
  const visibleItems = shouldShowEllipsis
    ? itemsToShow.slice(itemsToShow.length - 3)
    : itemsToShow

  return (
    <nav
      className={cn(
        'mb-2 sm:mb-2.5 md:mb-3',
        'flex items-center gap-0.5',
        'text-[10px] sm:text-xs md:text-xs',
        'overflow-x-auto overflow-y-visible',
        'scrollbar-hide',
        'w-full',
        className
      )}
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <ol className="flex items-center gap-0.5 min-w-0 flex-1">
        {/* Exam icon badge for first item if it's the exam */}
        {isFirstItemExam && (
          <li className="flex items-center min-w-0">
            <Link
              href={items[0].href}
              className={cn(
                'inline-flex items-center gap-1 sm:gap-1.5',
                'px-1.5 sm:px-2 md:px-2.5',
                'py-0.5 sm:py-1',
                'rounded-md sm:rounded-lg',
                'bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20',
                'border border-blue-300/40 dark:border-blue-600/40',
                'text-blue-700 dark:text-blue-300',
                'hover:from-blue-500/15 hover:via-indigo-500/15 hover:to-purple-500/15 dark:hover:from-blue-500/25 dark:hover:via-indigo-500/25 dark:hover:to-purple-500/25',
                'hover:border-blue-400/60 dark:hover:border-blue-500/60',
                'hover:scale-[1.02] active:scale-[0.98]',
                'transition-all duration-200 ease-out',
                'shadow-sm hover:shadow-md',
                'backdrop-blur-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                'group relative overflow-hidden'
              )}
              aria-label="Exam"
              title={items[0].label || 'Exam'}
            >
              <GraduationCap 
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" 
                strokeWidth={2.5} 
              />
              <span className="font-semibold text-[10px] sm:text-xs md:text-xs truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">
                {items[0].label || 'Exam'}
              </span>
              <span 
                className={cn(
                  'absolute inset-0 rounded-md sm:rounded-lg',
                  'bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0',
                  'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-200',
                  'pointer-events-none'
                )}
                aria-hidden="true"
              />
            </Link>
          </li>
        )}

        {/* Ellipsis indicator for truncated items */}
        {shouldShowEllipsis && (
          <>
            <li className="flex items-center px-0.5 sm:px-1" aria-hidden="true">
              <span className="text-gray-400 dark:text-gray-500 font-medium select-none text-[10px] sm:text-xs">
                ...
              </span>
            </li>
            <li className="flex items-center" aria-hidden="true">
              <ChevronRight 
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mx-0.5 text-gray-300 dark:text-gray-600 shrink-0" 
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </li>
          </>
        )}

        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1
          // Show separator if: not first item, or there's ellipsis, or there's Exam badge before
          const shouldShowSeparator = index > 0 || shouldShowEllipsis || (index === 0 && isFirstItemExam)

          return (
            <li key={`${item.href}-${index}`} className="flex items-center min-w-0">
              {shouldShowSeparator && (
                <ChevronRight 
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mx-0.5 text-gray-300 dark:text-gray-600 shrink-0 transition-colors duration-200" 
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className={cn(
                    'inline-flex items-center',
                    'max-w-[100px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[220px]',
                    'px-1.5 sm:px-2 md:px-2.5',
                    'py-0.5 sm:py-1',
                    'rounded-md',
                    'truncate',
                    'font-semibold',
                    'text-[10px] sm:text-xs md:text-xs',
                    'text-gray-900 dark:text-white',
                    'bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-800/60 dark:to-gray-700/60',
                    'border border-gray-200/60 dark:border-gray-700/60',
                    'shadow-sm',
                    'backdrop-blur-sm',
                    'select-none'
                  )}
                  title={item.label}
                  aria-current="page"
                >
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'inline-flex items-center',
                    'max-w-[80px] sm:max-w-[110px] md:max-w-[140px] lg:max-w-[170px]',
                    'px-1.5 sm:px-2 md:px-2',
                    'py-0.5 sm:py-1',
                    'rounded-md',
                    'truncate',
                    'font-medium',
                    'text-[10px] sm:text-xs md:text-xs',
                    'text-gray-600 dark:text-gray-400',
                    'bg-transparent',
                    'hover:text-blue-600 dark:hover:text-blue-400',
                    'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                    'hover:border-blue-200/50 dark:hover:border-blue-700/50',
                    'border border-transparent',
                    'transition-all duration-200 ease-out',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:rounded-md',
                    'group relative'
                  )}
                  title={item.label}
                >
                  <span className="truncate relative z-10">{item.label}</span>
                  <span 
                    className={cn(
                      'absolute inset-0 rounded-md',
                      'bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0',
                      'opacity-0 group-hover:opacity-100',
                      'transition-opacity duration-200',
                      'pointer-events-none'
                    )}
                    aria-hidden="true"
                  />
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
