'use client'

import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'

import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ================= TYPES ================= */

export type DefinitionListItem = {
  id?: string
  slug?: string
  title?: string
  content?: any
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
}

type TopicLike = {
  title: string
}

type SubtopicLike = {
  title: string
  content?: unknown
}

interface SubtopicPageClientProps {
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

  subtopic: SubtopicLike
  subtopicSlug: string
  definitions: DefinitionListItem[]
  breadcrumbs: Breadcrumb[]
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

/* ================= COMPONENT ================= */

export function SubtopicPageClient({
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

  subtopic,
  subtopicSlug,
  definitions,
  breadcrumbs,
  prev,
  next,
}: SubtopicPageClientProps) {
  const safeDefinitions = Array.isArray(definitions) ? definitions : []

  const baseUrl = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}`

  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={examSlug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={breadcrumbs}
      title={subtopic.title}
      description=""
      content={subtopic.content}
      prev={prev}
      next={next}
    >
      <section className="mt-6">
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="h-[3px] w-6 rounded bg-yellow-500" />
              Definitions
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Key terms you should remember for this subtopic
            </p>
          </div>

          <Badge
            variant="secondary"
            className="h-6 px-2.5 text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            <FileText className="mr-1 h-3.5 w-3.5" />
            {safeDefinitions.length}
          </Badge>
        </div>

        {/* ================= EMPTY ================= */}
        {safeDefinitions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center text-xs text-gray-500 dark:text-gray-400">
              No definitions available yet.
              <br />
              They’ll appear here once content is added.
            </CardContent>
          </Card>
        ) : (
          /* ================= GRID ================= */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safeDefinitions.map((definition) => {
              const slug = definition?.slug || definition?.id
              if (!slug) return null

              return (
                <Link
                  key={slug}
                  href={`${baseUrl}/${slug}`}
                  className="group relative block rounded-lg p-[1px]"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/40 via-amber-400/40 to-orange-400/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Border */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Card */}
                  <div className="relative rounded-lg border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 dark:text-gray-200 dark:group-hover:text-yellow-400">
                        {definition?.title}
                      </h3>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:group-hover:bg-yellow-800">
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
