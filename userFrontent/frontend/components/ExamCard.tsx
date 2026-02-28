'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SyllabusModal } from '@/components/SyllabusModal'

interface ExamCardProps {
  exam: {
    id: string
    title: string
    slug?: string
    image?: { url?: string | null } | string | null
    order?: number | null
    seo?: { metaDescription?: string | null } | null
  }
  /** Optional badge on image (e.g. "Medical Mastery", "Engineering Elite") */
  tagline?: string | null
  /** Optional stat line (e.g. "98% Success Rate") */
  statText?: string | null
  /** Optional stat label (e.g. "Verified Result") */
  statLabel?: string | null
  showProgress?: boolean
  progress?: number
  mentor?: string
  classTime?: string
  courseType?: 'live' | 'self-paced'
}

const placeholderGradients = [
  'from-blue-500 to-indigo-600',
  'from-blue-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
]

export function ExamCard({
  exam,
  tagline = null,
  statText = null,
  statLabel = null,
  showProgress = false,
  progress = 0,
  mentor: _mentor = 'Expert Team',
  classTime,
  courseType = 'self-paced',
}: ExamCardProps) {
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false)
  const examImage =
    exam.image && typeof exam.image === 'object' ? exam.image.url || null : null
  const description =
    (exam.seo && typeof exam.seo === 'object' && exam.seo.metaDescription) ||
    `Comprehensive preparation track for ${exam.title}. Expert-designed content and practice.`
  const placeholderGradient =
    placeholderGradients[(exam.order ?? 0) % placeholderGradients.length]
  const firstLetter = exam.title.charAt(0).toUpperCase()
  const examHref = `/exam/${exam.slug || exam.id}`

  return (
    <>
      <article
        className={[
          'group h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl min-w-0',
          'bg-white/90 dark:bg-white/[0.04]',
          'border border-slate-200/80 dark:border-white/[0.08]',
          'backdrop-blur-xl',
          'shadow-md shadow-slate-200/20 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]',
          'hover:border-primary/30 dark:hover:border-primary/30',
          'hover:shadow-lg dark:hover:shadow-[0_12px_32px_-8px_hsl(var(--primary)_/_0.12)]',
          'transition-all duration-300',
        ].join(' ')}
      >
        {/* Image block with overlay and optional badge */}
        <div className="relative h-24 min-[480px]:h-28 sm:h-32 md:h-36 overflow-hidden shrink-0">
          {examImage ? (
            <Image
              src={examImage}
              alt={exam.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 260px"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${placeholderGradient} flex items-center justify-center`}
            >
              <span className="text-3xl min-[480px]:text-4xl sm:text-4xl font-black text-white/90 drop-shadow">
                {firstLetter}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 dark:from-[#080a0d] via-transparent to-transparent" />
          {(tagline || courseType === 'live') && (
            <div className="absolute top-2.5 left-2.5 min-[480px]:top-3 min-[480px]:left-3">
              <span className="bg-primary/90 text-white text-[9px] min-[480px]:text-[10px] font-black px-2 min-[480px]:px-2.5 py-1 min-[480px]:py-1.5 rounded-full uppercase tracking-tighter">
                {tagline || (courseType === 'live' ? 'Live' : 'Track')}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col min-w-0 p-2.5 min-[480px]:p-3 sm:p-3 md:p-4">
          <div className="flex justify-between items-start gap-1.5 min-[480px]:gap-2 mb-1.5 min-[480px]:mb-2">
            <h3 className="text-sm min-[480px]:text-base sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 min-w-0">
              {exam.title}
            </h3>
            {(statText || statLabel) && (
              <div className="text-right shrink-0">
                {statText && (
                  <div className="text-[10px] min-[480px]:text-xs text-primary font-bold">{statText}</div>
                )}
                {statLabel && (
                  <div className="text-[9px] min-[480px]:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                    {statLabel}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-[11px] min-[480px]:text-xs sm:text-xs mb-2 min-[480px]:mb-3 sm:mb-3 line-clamp-2 leading-relaxed flex-1 min-w-0">
            {description}
          </p>

          {/* Progress (optional) */}
          {showProgress && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-slate-500 dark:text-slate-400">Progress</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          )}

          {classTime && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              <span className="font-medium">Class:</span> {classTime}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-1.5 min-[480px]:gap-2 border-t border-slate-200 dark:border-white/5 pt-2.5 min-[480px]:pt-3 sm:pt-3 mt-auto flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setIsSyllabusOpen(true)
              }}
              className="text-[9px] min-[480px]:text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest border-b border-dotted border-slate-400 dark:border-slate-500 hover:border-primary shrink-0"
            >
              Syllabus
            </button>
            <Link
              href={examHref}
              className="inline-flex items-center justify-center gap-1 bg-primary text-primary-foreground px-2.5 min-[480px]:px-3 sm:px-3 py-1.5 min-[480px]:py-2 rounded-md min-[480px]:rounded-lg font-bold text-[11px] min-[480px]:text-xs shadow-[0_0_10px_-4px_hsl(var(--primary)_/_0.5)] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              View
              <ArrowRight className="h-3 w-3 min-[480px]:h-3.5 min-[480px]:w-3.5" />
            </Link>
          </div>
        </div>
      </article>

      <SyllabusModal
        exam={exam}
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
      />
    </>
  )
}
