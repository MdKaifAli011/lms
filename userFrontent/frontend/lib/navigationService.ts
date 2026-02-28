import { BasePayload } from 'payload'

type NavItem = { label: string; href: string } | null

interface NavContext {
  examSlug: string
  subjectSlug?: string
  unitSlug?: string
  chapterSlug?: string
  topicSlug?: string
  subtopicSlug?: string
  definitionSlug?: string
}

/**
 * Traversal Order:
 * Exam -> Subjects -> Units -> Chapters -> Topics -> Subtopics -> Definitions
 */

export async function getUniversalNav(
  payload: any,
  ctx: NavContext
): Promise<{ prev: NavItem; next: NavItem }> {
  const { examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug, subtopicSlug, definitionSlug } = ctx

  // 1. Fetch current path IDs for context
  const exam = await payload.find({ collection: 'exams', where: { slug: { equals: examSlug } }, limit: 1, depth: 0 }).then((r: any) => r.docs[0])
  if (!exam) return { prev: null, next: null }

  const subject = subjectSlug ? await payload.find({ collection: 'subjects', where: { and: [{ exam: { equals: exam.id } }, { slug: { equals: subjectSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null
  const unit = (subject && unitSlug) ? await payload.find({ collection: 'units', where: { and: [{ subject: { equals: subject.id } }, { slug: { equals: unitSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null
  const chapter = (unit && chapterSlug) ? await payload.find({ collection: 'chapters', where: { and: [{ unit: { equals: unit.id } }, { slug: { equals: chapterSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null
  const topic = (chapter && topicSlug) ? await payload.find({ collection: 'topics', where: { and: [{ chapter: { equals: chapter.id } }, { slug: { equals: topicSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null
  const subtopic = (topic && subtopicSlug) ? await payload.find({ collection: 'subtopics', where: { and: [{ topic: { equals: topic.id } }, { slug: { equals: subtopicSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null
  const definition = (subtopic && definitionSlug) ? await payload.find({ collection: 'definitions', where: { and: [{ subtopic: { equals: subtopic.id } }, { slug: { equals: definitionSlug } }] }, limit: 1, depth: 0 }).then((r: any) => r.docs[0]) : null

  // Helper: Get First Child
  const getFirstChild = async (node: any, level: string): Promise<any> => {
    const map: any = {
      exam: { col: 'subjects', field: 'exam' },
      subject: { col: 'units', field: 'subject' },
      unit: { col: 'chapters', field: 'unit' },
      chapter: { col: 'topics', field: 'chapter' },
      topic: { col: 'subtopics', field: 'topic' },
      subtopic: { col: 'definitions', field: 'subtopic' }
    }
    const config = map[level]
    if (!config) return null
    const res = await payload.find({
      collection: config.col,
      where: { and: [{ [config.field]: { equals: node.id } }, { isActive: { equals: true } }] },
      sort: 'order',
      limit: 1,
      depth: 0
    })
    return res.docs[0]
  }

  // Helper: Get Sibling (Next/Prev)
  const getSibling = async (node: any, level: string, dir: 'next' | 'prev'): Promise<any> => {
    const map: any = {
      subject: { col: 'subjects', parentField: 'exam', parentId: exam.id },
      unit: { col: 'units', parentField: 'subject', parentId: subject?.id },
      chapter: { col: 'chapters', parentField: 'unit', parentId: unit?.id },
      topic: { col: 'topics', parentField: 'chapter', parentId: chapter?.id },
      subtopic: { col: 'subtopics', parentField: 'topic', parentId: topic?.id },
      definition: { col: 'definitions', parentField: 'subtopic', parentId: subtopic?.id }
    }
    const config = map[level]
    if (!config) return null
    const res = await payload.find({
      collection: config.col,
      where: {
        and: [
          { [config.parentField]: { equals: config.parentId } },
          { isActive: { equals: true } },
          dir === 'next' ? { order: { greater_than: node.order } } : { order: { less_than: node.order } }
        ]
      },
      sort: dir === 'next' ? 'order' : '-order',
      limit: 1,
      depth: 0
    })
    return res.docs[0]
  }

  // Helper: Get Last Leaf of a node (Recursive)
  const getLastLeaf = async (node: any, level: string): Promise<{ node: any; level: string }> => {
    const childrenMap: any = {
      exam: 'subject',
      subject: 'unit',
      unit: 'chapter',
      chapter: 'topic',
      topic: 'subtopic',
      subtopic: 'definition'
    }
    const childLevel = childrenMap[level]
    if (!childLevel) return { node, level }

    const colMap: any = { subject: 'subjects', unit: 'units', chapter: 'chapters', topic: 'topics', subtopic: 'subtopics', definition: 'definitions' }
    const fieldMap: any = { subject: 'exam', unit: 'subject', chapter: 'unit', topic: 'chapter', subtopic: 'topic', definition: 'subtopic' }

    const res = await payload.find({
      collection: colMap[childLevel],
      where: { and: [{ [fieldMap[childLevel]]: { equals: node.id } }, { isActive: { equals: true } }] },
      sort: '-order',
      limit: 1,
      depth: 0
    })
    
    if (res.docs[0]) return getLastLeaf(res.docs[0], childLevel)
    return { node, level }
  }

  // Helper: Build Link
  const buildLink = (node: any, level: string): NavItem => {
    if (!node) return null
    let path = `/exam/${examSlug}`
    const slug = node.slug || node.id
    if (level === 'subject') path += `/${slug}`
    if (level === 'unit') path += `/${subjectSlug || (typeof node.subject === 'string' ? '' : node.subject.slug)}/${slug}`
    if (level === 'chapter') path += `/${subjectSlug}/${unitSlug}/${slug}`
    if (level === 'topic') path += `/${subjectSlug}/${unitSlug}/${chapterSlug}/${slug}`
    if (level === 'subtopic') path += `/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${slug}`
    if (level === 'definition') path += `/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/${slug}`
    
    // Note: To be perfectly accurate, we need the full parent slugs for units in buildLink if not in ctx.
    // For now, assuming context exists or node has slugs.
    return { label: node.title, href: path }
  }

  // Helper: Get Next Node in Tree
  const getNext = async (curr: any, level: string): Promise<NavItem> => {
    // 1. If has child -> first child
    const child = await getFirstChild(curr, level)
    if (child) {
      const childLevels: any = { exam: 'subject', subject: 'unit', unit: 'chapter', chapter: 'topic', topic: 'subtopic', subtopic: 'definition' }
      return buildLink(child, childLevels[level])
    }

    // 2. No child? Try next sibling
    let node = curr
    let nodeLevel = level
    while (nodeLevel !== 'exam') {
      const sibling = await getSibling(node, nodeLevel, 'next')
      if (sibling) return buildLink(sibling, nodeLevel)
      
      // No sibling? Go to parent and try its sibling
      // This is complex because we need the parent node
      const parentMap: any = {
        subject: { col: 'exams', id: exam.id, level: 'exam' },
        unit: { col: 'subjects', id: subject?.id, level: 'subject' },
        chapter: { col: 'units', id: unit?.id, level: 'unit' },
        topic: { col: 'chapters', id: chapter?.id, level: 'chapter' },
        subtopic: { col: 'topics', id: topic?.id, level: 'topic' },
        definition: { col: 'subtopics', id: subtopic?.id, level: 'subtopic' }
      }
      const parentInfo = parentMap[nodeLevel]
      if (!parentInfo || parentInfo.level === 'exam') break
      node = await payload.findByID({ collection: parentInfo.col, id: parentInfo.id, depth: 0 })
      nodeLevel = parentInfo.level
    }
    return null
  }

  // Helper: Get Prev Node in Tree
  const getPrev = async (curr: any, level: string): Promise<NavItem> => {
    // 1. Try prev sibling
    const sibling = await getSibling(curr, level, 'prev')
    if (sibling) {
      // Prev node is the LAST LEAF of the previous sibling
      const lastLeaf = await getLastLeaf(sibling, level)
      return buildLink(lastLeaf.node, lastLeaf.level)
    }

    // 2. No prev sibling? Then parent is previous
    const parentMap: any = {
      subject: { node: exam, level: 'exam' },
      unit: { node: subject, level: 'subject' },
      chapter: { node: unit, level: 'unit' },
      topic: { node: chapter, level: 'chapter' },
      subtopic: { node: topic, level: 'topic' },
      definition: { node: subtopic, level: 'subtopic' }
    }
    const parent = parentMap[level]
    if (parent) return buildLink(parent.node, parent.level)

    return null
  }

  let current: any = exam, currentLevel = 'exam'
  if (definition) { current = definition; currentLevel = 'definition' }
  else if (subtopic) { current = subtopic; currentLevel = 'subtopic' }
  else if (topic) { current = topic; currentLevel = 'topic' }
  else if (chapter) { current = chapter; currentLevel = 'chapter' }
  else if (unit) { current = unit; currentLevel = 'unit' }
  else if (subject) { current = subject; currentLevel = 'subject' }

  const next = await getNext(current, currentLevel)
  const prev = await getPrev(current, currentLevel)

  return { prev, next }
}
