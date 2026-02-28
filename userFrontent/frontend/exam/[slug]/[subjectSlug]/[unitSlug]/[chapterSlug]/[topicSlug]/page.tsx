import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { TopicPageClient } from '@/app/(frontend)/components/TopicPageClient'
import { buildSubjectHierarchy } from '@/app/(frontend)/lib/buildHierarchy'
import { getUniversalNav } from '@/app/(frontend)/lib/navigationService'

import { generateEntityMetadata } from '@/app/(frontend)/lib/seo-helpers'

type Props = {
  params: Promise<{
    slug: string
    subjectSlug: string
    unitSlug: string
    chapterSlug: string
    topicSlug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug, topicSlug } = await params
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

  const topicResult = await payload.find({
    collection: 'topics',
    where: {
      and: [{ slug: { equals: topicSlug } }, { chapter: { equals: chapter.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const topic = topicResult.docs[0]
  if (!topic) return {}

  return generateEntityMetadata({
    title: topic.title,
    topicTitle: topic.title,
    chapterTitle: chapter.title,
    unitTitle: unit.title,
    subjectTitle: subject.title,
    examTitle: exam.title,
    level: 'topic',
    seo: topic.seo
  })
}

export default async function TopicPage({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug, topicSlug } = await params
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
    depth: 0,
  })

  const chapter = chapterResult.docs[0]
  if (!chapter) {
    notFound()
  }

  // Fetch topic
  const topicResult = await payload.find({
    collection: 'topics',
    where: {
      and: [
        { slug: { equals: topicSlug } },
        { chapter: { equals: chapter.id } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
    depth: 5,
  })

  const topic = topicResult.docs[0]
  if (!topic) {
    notFound()
  }

  // Fetch subtopics
  const { docs: subtopics } = await payload.find({
    collection: 'subtopics',
    where: {
      and: [{ topic: { equals: topic.id } }, { isActive: { equals: true } }],
    },
    sort: 'order',
    depth: 0,
  })

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

  const breadcrumbs = [
    { label: exam.title, href: `/exam/${slug}` },
    { label: subject.title, href: `/exam/${slug}/${subjectSlug}` },
    { label: unit.title, href: `/exam/${slug}/${subjectSlug}/${unitSlug}` },
    {
      label: chapter.title,
      href: `/exam/${slug}/${subjectSlug}/${unitSlug}/${chapterSlug}`,
    },
    {
      label: topic.title,
      href: `/exam/${slug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}`,
    },
  ]

  const nav = await getUniversalNav(payload, { examSlug: slug, subjectSlug, unitSlug, chapterSlug, topicSlug })

  return (
    <TopicPageClient
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
      topic={topic}
      topicSlug={topicSlug}
      subtopics={subtopics}
      breadcrumbs={breadcrumbs}
      prev={nav.prev}
      next={nav.next}
    />
  )
}
