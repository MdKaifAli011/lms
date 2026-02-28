'use client'

import Link from 'next/link'
import { ChevronRight, Layers } from 'lucide-react'

import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ================= TYPES ================= */

export type SubtopicListItem = {
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

type TopicLike = {
  title: string
  content?: unknown
}

type SubjectLike = {
  title: string
}

type UnitLike = {
  title: string
}

type ChapterLike = {
  title: string
}

interface TopicPageClientProps {
  exam: ExamLike
  examSlug: string
  exams: any[]
  subjects: any[]

  // 👇 THESE ARE REQUIRED because page.tsx sends them
  subject: SubjectLike
  subjectSlug: string
  unit: UnitLike
  unitSlug: string
  chapter: ChapterLike
  chapterSlug: string

  topic: TopicLike
  topicSlug: string
  subtopics: SubtopicListItem[]
  breadcrumbs: Breadcrumb[]
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

/* ================= COMPONENT ================= */

export function TopicPageClient({
  exam,
  examSlug,
  exams,
  subjects,

  // accepted but not used directly (needed for typing)
  subject,
  subjectSlug,
  unit,
  unitSlug,
  chapter,
  chapterSlug,

  topic,
  topicSlug,
  subtopics,
  breadcrumbs,
  prev,
  next,
}: TopicPageClientProps) {
  const safeSubtopics = Array.isArray(subtopics) ? subtopics : []

  const baseUrl = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}`

  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={examSlug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={breadcrumbs}
      title={topic.title}
      description=""
      content={topic.content}
      prev={prev}
      next={next}
    >
      <section className="mt-6">
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="h-[3px] w-6 rounded bg-blue-500" />
              Subtopics
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Read concepts and definitions step by step
            </p>
          </div>

          <Badge
            variant="secondary"
            className="h-6 px-2.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <Layers className="mr-1 h-3.5 w-3.5" />
            {safeSubtopics.length}
          </Badge>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {safeSubtopics.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center text-xs text-gray-500 dark:text-gray-400">
              No subtopics available yet.
              <br />
              They’ll appear here once content is added.
            </CardContent>
          </Card>
        ) : (
          /* ================= GRID ================= */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safeSubtopics.map((subtopic) => {
              const slug = subtopic?.slug || subtopic?.id
              if (!slug) return null

              return (
                <Link
                  key={slug}
                  href={`${baseUrl}/${slug}`}
                  className="group relative block rounded-lg p-[1px]"
                >
                  {/* Soft glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/40 via-indigo-400/40 to-blue-500/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Card */}
                  <div className="relative rounded-lg border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <h3 className="text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                        {subtopic?.title}
                      </h3>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors duration-200 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-800">
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
