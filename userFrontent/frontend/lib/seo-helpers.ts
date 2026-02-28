import type { Metadata } from 'next'

interface SEOProps {
  title: string
  examTitle?: string
  subjectTitle?: string
  unitTitle?: string
  chapterTitle?: string
  topicTitle?: string
  subtopicTitle?: string
  level: 'exam' | 'subject' | 'unit' | 'chapter' | 'topic' | 'subtopic' | 'definition'
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    keywords?: string | null
    noIndex?: boolean | null
    noFollow?: boolean | null
  }
}

export function generateEntityMetadata({
  title,
  examTitle,
  subjectTitle,
  unitTitle,
  chapterTitle,
  topicTitle,
  subtopicTitle,
  level,
  seo
}: SEOProps): Metadata {
  const siteName = 'LmsDoors'

  /* ---------------- TITLE ---------------- */
  let metaTitle = seo?.metaTitle ?? ''

  if (!metaTitle) {
    let specificLabel = title

    // ✅ ONLY exam page gets "Exam Overview"
    if (level === 'exam') {
      specificLabel = `${title} Exam Overview`
    }

    if (level === 'definition') {
      specificLabel = `Definition of ${title}`
    }

    const parts: string[] = [specificLabel]

    if (level === 'definition' && subtopicTitle) parts.push(subtopicTitle)
    if (['subtopic', 'definition'].includes(level) && topicTitle) parts.push(topicTitle)
    if (['topic', 'subtopic', 'definition'].includes(level) && chapterTitle) parts.push(chapterTitle)
    if (['chapter', 'topic', 'subtopic', 'definition'].includes(level) && unitTitle) parts.push(unitTitle)
    if (['unit', 'chapter', 'topic', 'subtopic', 'definition'].includes(level) && subjectTitle) parts.push(subjectTitle)
    if (examTitle && level !== 'exam') parts.push(examTitle)

    metaTitle = `${parts.join(' – ')} | ${siteName}`

    // Length safety
    if (metaTitle.length > 65 && examTitle && level !== 'exam') {
      metaTitle = `${specificLabel} – ${examTitle} | ${siteName}`
    }

    if (metaTitle.length > 65) {
      metaTitle = `${specificLabel} | ${siteName}`
    }
  }

  /* ---------------- DESCRIPTION ---------------- */
  let metaDescription = seo?.metaDescription ?? ''

  if (!metaDescription) {
    switch (level) {
      case 'exam':
        metaDescription = `Prepare for ${title} with ${siteName}. Get exam overview, syllabus, subjects, preparation strategy, and important resources.`
        break
      case 'subject':
        metaDescription = `Study ${title} for ${examTitle} with ${siteName}. Access chapters, units, topics, and concept-wise notes.`
        break
      case 'unit':
        metaDescription = `Learn ${title} from ${subjectTitle} for ${examTitle} on ${siteName}. Explore chapters and exam-focused explanations.`
        break
      case 'chapter':
        metaDescription = `${title} from ${unitTitle} of ${subjectTitle} for ${examTitle}, explained clearly on ${siteName}.`
        break
      case 'topic':
        metaDescription = `Understand ${title} from ${chapterTitle} in ${subjectTitle} for ${examTitle} with easy explanations on ${siteName}.`
        break
      case 'subtopic':
        metaDescription = `Learn ${title} under ${topicTitle} from ${chapterTitle} for ${examTitle} with ${siteName}.`
        break
      case 'definition':
        metaDescription = `Definition of ${title} explained clearly for ${examTitle}. Simple and exam-focused content by ${siteName}.`
        break
    }
  }

  if (metaDescription.length > 160) {
    metaDescription = metaDescription.slice(0, 157) + '...'
  }

  /* ---------------- KEYWORDS ---------------- */
  let keywords = seo?.keywords ?? ''

  if (!keywords) {
    keywords = [
      title,
      examTitle,
      subjectTitle,
      unitTitle,
      chapterTitle
    ].filter(Boolean).join(', ')
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || undefined,
    robots: {
      index: seo?.noIndex ? false : true,
      follow: seo?.noFollow ? false : true,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      siteName
    }
  }
}
