import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Exam } from '@/payload-types'
import { ExamPageClient } from '@/app/(frontend)/exam/ExamPageClient'

export default async function ExamsPage() {
  const headersList = await headers()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  await payload.auth({ headers: headersList })

  const { docs: exams } = await payload.find({
    collection: 'exams',
    where: { isActive: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  return <ExamPageClient exams={exams as Exam[]} />
}
