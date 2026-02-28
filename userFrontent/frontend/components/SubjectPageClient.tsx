'use client'

import Link from 'next/link'
import { ChevronRight, Layers } from 'lucide-react'

import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ================= TYPES ================= */

export type UnitListItem = {
  id?: string
  slug?: string
  title?: string
}

type Breadcrumb = {
  label: string
  href: string
}

type ExamLike = {
  title: string
  content?: unknown
}

type SubjectLike = {
  title: string
  content?: unknown
}

interface SubjectPageClientProps {
  exam: ExamLike
  examSlug: string
  exams: any[]
  subjects: any[]
  subject: SubjectLike
  subjectSlug: string
  units: UnitListItem[]
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

/* ================= COMPONENT ================= */

export function SubjectPageClient({
  exam,
  examSlug,
  exams,
  subjects,
  subject,
  subjectSlug,
  units,
  prev,
  next,
}: SubjectPageClientProps) {
  const safeUnits = Array.isArray(units) ? units : []

  const breadcrumbs: Breadcrumb[] = [
    { label: exam.title, href: `/exam/${examSlug}` },
    { label: subject.title, href: `/exam/${examSlug}/${subjectSlug}` },
  ]

  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={examSlug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={breadcrumbs}
      title={subject.title}
      description=""
      content={subject.content}
      prev={prev}
      next={next}
    >
      <section className="mt-6">
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="h-[3px] w-6 rounded bg-green-500" />
              Units
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Continue learning unit by unit
            </p>
          </div>

          <Badge
            variant="secondary"
            className="h-6 px-2.5 text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          >
            <Layers className="mr-1 h-3.5 w-3.5" />
            {safeUnits.length}
          </Badge>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {safeUnits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center text-xs text-gray-500 dark:text-gray-400">
              No units available yet.
              <br />
              They’ll appear here once content is added.
            </CardContent>
          </Card>
        ) : (
          /* ================= GRID ================= */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safeUnits.map((unit) => {
              const slug = unit?.slug || unit?.id
              if (!slug) return null

              return (
                <Link
                  key={slug}
                  href={`/exam/${examSlug}/${subjectSlug}/${slug}`}
                  className="group relative block rounded-lg p-[1px]"
                >
                  {/* Soft glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/40 via-emerald-400/40 to-lime-400/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Card */}
                  <div className="relative rounded-lg border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <h3 className="text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-green-600 dark:text-gray-200 dark:group-hover:text-green-400">
                        {unit?.title}
                      </h3>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors duration-200 group-hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:group-hover:bg-green-800">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </HierarchyPageLayout>
  )
}
