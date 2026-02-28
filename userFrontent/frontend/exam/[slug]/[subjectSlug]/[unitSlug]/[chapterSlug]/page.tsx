import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { buildSubjectHierarchy } from '@/app/(frontend)/lib/buildHierarchy'
import {
  ChapterPageClient,
  type TopicListItem,
} from '@/app/(frontend)/components/ChapterPageClient'
import { getUniversalNav } from '@/app/(frontend)/lib/navigationService'

import { generateEntityMetadata } from '@/app/(frontend)/lib/seo-helpers'

type Props = {
  params: Promise<{
    slug: string
    subjectSlug: string
    unitSlug: string
    chapterSlug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const examResult = await payload.find({
    collection: 'exams',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const exam = examResult.docs[0]
  if (!exam) return {}

  const subjectResult = await payload.find({
    collection: 'subjects',
    where: {
      and: [{ slug: { equals: subjectSlug } }, { exam: { equals: exam.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const subject = subjectResult.docs[0]
  if (!subject) return {}

  const unitResult = await payload.find({
    collection: 'units',
    where: {
      and: [{ slug: { equals: unitSlug } }, { subject: { equals: subject.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const unit = unitResult.docs[0]
  if (!unit) return {}

  const chapterResult = await payload.find({
    collection: 'chapters',
    where: {
      and: [{ slug: { equals: chapterSlug } }, { unit: { equals: unit.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const chapter = chapterResult.docs[0]
  if (!chapter) return {}

  return generateEntityMetadata({
    title: chapter.title,
    unitTitle: unit.title,
    subjectTitle: subject.title,
    examTitle: exam.title,
    level: 'chapter',
    seo: chapter.seo
  })
}

export default async function ChapterPage({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug } = await params
  const headersList = await headers()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  await payload.auth({ headers: headersList })

  // Fetch exam
  const examResult = await payload.find({
    collection: 'exams',
    where: {
      and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
    },
    limit: 1,
    depth: 0,
  })

  const exam = examResult.docs[0]
  if (!exam) {
    notFound()
  }

  // Fetch subject
  const subjectResult = await payload.find({
    collection: 'subjects',
    where: {
      and: [
        { slug: { equals: subjectSlug } },
        { exam: { equals: exam.id } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const subject = subjectResult.docs[0]
  if (!subject) {
    notFound()
  }

  // Fetch unit
  const unitResult = await payload.find({
    collection: 'units',
    where: {
      and: [
        { slug: { equals: unitSlug } },
        { subject: { equals: subject.id } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const unit = unitResult.docs[0]
  if (!unit) {
    notFound()
  }

  // Fetch chapter
  const chapterResult = await payload.find({
    collection: 'chapters',
    where: {
      and: [
        { slug: { equals: chapterSlug } },
        { unit: { equals: unit.id } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
    depth: 5,
  })

  const chapter = chapterResult.docs[0]
  if (!chapter) {
    notFound()
  }

  // Fetch all active exams for the categories bar
  const { docs: exams } = await payload.find({
    collection: 'exams',
    where: { isActive: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 0,
  })

  // Build hierarchy for sidebar
  const subjects = await buildSubjectHierarchy(payload, exam.id)

  const activeSubjectInHierarchy = subjects.find(
    (s: { slug?: string; id?: string }) => (s?.slug || s?.id) === subjectSlug,
  )

  const activeUnitInHierarchy = Array.isArray(activeSubjectInHierarchy?.units)
    ? (
      activeSubjectInHierarchy.units as Array<{ slug?: string; id?: string; chapters?: unknown }>
    ).find((u) => (u?.slug || u?.id) === unitSlug)
    : undefined

  const activeChapterInHierarchy = Array.isArray(activeUnitInHierarchy?.chapters)
    ? (
      activeUnitInHierarchy.chapters as Array<{ slug?: string; id?: string; topics?: unknown }>
    ).find((c) => (c?.slug || c?.id) === chapterSlug)
    : undefined

  const topics: TopicListItem[] = Array.isArray(activeChapterInHierarchy?.topics)
    ? (activeChapterInHierarchy.topics as TopicListItem[])
    : []

  const nav = await getUniversalNav(payload, { examSlug: slug, subjectSlug, unitSlug, chapterSlug })

  return (
    <ChapterPageClient
      exam={exam}
      examSlug={slug}
      exams={exams}
      subjects={subjects}
      subject={subject}
      subjectSlug={subjectSlug}
      unit={unit}
      unitSlug={unitSlug}
      chapter={chapter}
      chapterSlug={chapterSlug}
      topics={topics}
      prev={nav.prev}
      next={nav.next}
    />
  )
}
