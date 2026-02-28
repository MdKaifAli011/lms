import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
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
    subtopicSlug: string
    definitionSlug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug, topicSlug, subtopicSlug, definitionSlug } = await params
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

  const subtopicResult = await payload.find({
    collection: 'subtopics',
    where: {
      and: [{ slug: { equals: subtopicSlug } }, { topic: { equals: topic.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const subtopic = subtopicResult.docs[0]
  if (!subtopic) return {}

  const definitionResult = await payload.find({
    collection: 'definitions',
    where: {
      and: [{ slug: { equals: definitionSlug } }, { subtopic: { equals: subtopic.id } }],
    },
    limit: 1,
    depth: 0,
  })
  const definition = definitionResult.docs[0]
  if (!definition) return {}

  return generateEntityMetadata({
    title: definition.title,
    subtopicTitle: subtopic.title,
    topicTitle: topic.title,
    chapterTitle: chapter.title,
    unitTitle: unit.title,
    subjectTitle: subject.title,
    examTitle: exam.title,
    level: 'definition',
    seo: definition.seo
  })
}

export default async function DefinitionPage({ params }: Props) {
  const { slug, subjectSlug, unitSlug, chapterSlug, topicSlug, subtopicSlug, definitionSlug } =
    await params
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
    depth: 0,
  })

  const topic = topicResult.docs[0]
  if (!topic) {
    notFound()
  }

  // Fetch subtopic
  const subtopicResult = await payload.find({
    collection: 'subtopics',
    where: {
      and: [
        { slug: { equals: subtopicSlug } },
        { topic: { equals: topic.id } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const subtopic = subtopicResult.docs[0]
  if (!subtopic) {
    notFound()
  }

  // Fetch definitions for navigation
  const { docs: allDefinitions } = await payload.find({
    collection: 'definitions',
    where: {
      and: [
        { subtopic: { equals: subtopic.id } },
        { isActive: { equals: true } },
      ],
    },
    sort: 'order',
    limit: 100,
    depth: 0,
  })

  const definitionIdx = allDefinitions.findIndex(d => (d.slug || d.id) === definitionSlug)
  const definition = allDefinitions[definitionIdx]

  if (!definition) {
    notFound()
  }

  const nav = await getUniversalNav(payload, { examSlug: slug, subjectSlug, unitSlug, chapterSlug, topicSlug, subtopicSlug, definitionSlug })

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
    {
      label: subtopic.title,
      href: `/exam/${slug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}`,
    },
    {
      label: definition.title,
      href: `/exam/${slug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/${definitionSlug}`,
    },
  ]

  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={slug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={breadcrumbs}
      title={definition.title}
      description="Explore comprehensive study materials, practice questions and video lectures for this definition."
      content={definition.content}
      prev={nav.prev}
      next={nav.next}
    />
  )
}
