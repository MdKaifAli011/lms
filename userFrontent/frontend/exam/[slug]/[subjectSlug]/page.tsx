import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { buildSubjectHierarchy } from '@/app/(frontend)/lib/buildHierarchy'
import { SubjectPageClient, type UnitListItem } from '@/app/(frontend)/components/SubjectPageClient'
import { getUniversalNav } from '@/app/(frontend)/lib/navigationService'

import { generateEntityMetadata } from '@/app/(frontend)/lib/seo-helpers'

type Props = {
  params: Promise<{
    slug: string
    subjectSlug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug, subjectSlug } = await params
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

  return generateEntityMetadata({
    title: subject.title,
    examTitle: exam.title,
    level: 'subject',
    seo: subject.seo
  })
}

export default async function SubjectPage({ params }: Props) {
  const { slug, subjectSlug } = await params
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
    depth: 5,
  })

  const subject = subjectResult.docs[0]
  if (!subject) {
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

  const units: UnitListItem[] = Array.isArray(activeSubjectInHierarchy?.units)
    ? (activeSubjectInHierarchy.units as UnitListItem[])
    : []

  const nav = await getUniversalNav(payload, { examSlug: slug, subjectSlug })

  return (
    <SubjectPageClient
      exam={exam}
      examSlug={slug}
      exams={exams}
      subjects={subjects}
      subject={subject}
      subjectSlug={subjectSlug}
      units={units}
      prev={nav.prev}
      next={nav.next}
    />
  )
}
