'use client'

import Link from 'next/link'
import { ChevronRight, Layers } from 'lucide-react'

import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ================= TYPES ================= */

export type TopicListItem = {
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
}

type SubjectLike = {
  title: string
}

type UnitLike = {
  title: string
}

type ChapterLike = {
  title: string
  content?: unknown
}

interface ChapterPageClientProps {
  exam: ExamLike
  examSlug: string
  exams: any[]
  subjects: any[]
  subject: SubjectLike
  subjectSlug: string
  unit: UnitLike
  unitSlug: string
  chapter: ChapterLike
  chapterSlug: string
  topics: TopicListItem[]
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

/* ================= COMPONENT ================= */

export function ChapterPageClient({
  exam,
  examSlug,
  exams,
  subjects,
  subject,
  subjectSlug,
  unit,
  unitSlug,
  chapter,
  chapterSlug,
  topics,
  prev,
  next,
}: ChapterPageClientProps) {
  const safeTopics = Array.isArray(topics) ? topics : []

  const breadcrumbs: Breadcrumb[] = [
    { label: exam.title, href: `/exam/${examSlug}` },
    { label: subject.title, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unit.title, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    {
      label: chapter.title,
      href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}`,
    },
  ]

  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={examSlug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={breadcrumbs}
      title={chapter.title}
      description=""
      content={chapter.content}
      prev={prev}
      next={next}
    >
      <section className="mt-6">
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="h-[3px] w-6 rounded bg-orange-500" />
              Topics
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Pick a topic to explore subtopics
            </p>
          </div>

          <Badge
            variant="secondary"
            className="h-6 px-2.5 text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          >
            <Layers className="mr-1 h-3.5 w-3.5" />
            {safeTopics.length}
          </Badge>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {safeTopics.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center text-xs text-gray-500 dark:text-gray-400">
              No topics available yet.
              <br />
              They’ll appear here once content is added.
            </CardContent>
          </Card>
        ) : (
          /* ================= GRID ================= */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safeTopics.map((topic) => {
              const slug = topic?.slug || topic?.id
              if (!slug) return null

              return (
                <Link
                  key={slug}
                  href={`/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${slug}`}
                  className="group relative block rounded-lg p-[1px]"
                >
                  {/* Soft glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400/40 via-amber-400/40 to-yellow-400/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Card */}
                  <div className="relative rounded-lg border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <h3 className="text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-orange-600 dark:text-gray-200 dark:group-hover:text-orange-400">
                        {topic?.title}
                      </h3>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors duration-200 group-hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:group-hover:bg-orange-800">
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
