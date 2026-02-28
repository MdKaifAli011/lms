import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { ExamPageClient } from '@/app/(frontend)/components/ExamPageClient'
import { buildSubjectHierarchy } from '@/app/(frontend)/lib/buildHierarchy'
import { getUniversalNav } from '@/app/(frontend)/lib/navigationService'

import { generateEntityMetadata } from '@/app/(frontend)/lib/seo-helpers'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const examResult = await payload.find({
    collection: 'exams',
    where: {
      and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
    },
    limit: 1,
    depth: 0,
  })

  const exam = examResult.docs[0]
  if (!exam) return {}

  return generateEntityMetadata({
    title: exam.title,
    level: 'exam',
    seo: exam.seo
  })
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Authenticate (optional, for public access)
  await payload.auth({ headers: headersList })

  // Fetch exam by slug
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

  // Fetch all active exams for the categories bar
  const { docs: exams } = await payload.find({
    collection: 'exams',
    where: { isActive: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 0,
  })

  // Build hierarchy for sidebar
  const subjectsWithHierarchy = await buildSubjectHierarchy(payload, exam.id)

  // Calculate Navigation
  const nav = await getUniversalNav(payload, { examSlug: slug })

  return (
    <ExamPageClient
      exam={exam}
      examSlug={slug}
      exams={exams}
      subjects={subjectsWithHierarchy}
      prev={nav.prev}
      next={nav.next}
    />
  )
}
