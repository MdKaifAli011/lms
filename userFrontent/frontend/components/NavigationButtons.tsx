'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface NavigationButtonsProps {
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

export function NavigationButtons({ prev, next }: NavigationButtonsProps) {
  if (!prev && !next) return null

  return (
    <div className="mt-10 flex items-center justify-between">
      {/* Previous */}
      {prev ? (
        <Link
          href={prev.href}
          className="inline-flex items-center gap-2 text-sm font-medium
            text-gray-500 transition-colors
            hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={16} />
          <span>
            <span className="font-normal hidden sm:inline">Previous:</span>{' '}
            <span className="font-semibold hidden sm:inline">{prev.label}</span>
            <span className="sm:hidden">Previous</span>
          </span>
        </Link>
      ) : (
        <div />
      )}

      {/* Next */}
      {next ? (
        <Link
          href={next.href}
          className="
            group inline-flex items-center gap-3 rounded-full px-6 py-3
            text-sm font-semibold text-white
            transition-all duration-200

            /* Light mode */
            bg-gray-900 hover:bg-blue-500

            /* Dark mode */
            dark:bg-blue-500 dark:hover:bg-blue-600
          "
        >
          <span className="hidden sm:inline">Next: {next.label}</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}