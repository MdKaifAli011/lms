/**
 * Builds the hierarchical structure for subjects with their nested units, chapters, and topics
 * FIXED: Explicit limit added (limit: 30) to prevent Payload default truncation
 */
export async function buildSubjectHierarchy(
  payload: any,
  examId: string,
) {
  // ===================== SUBJECTS =====================
  const { docs: subjects } = await payload.find({
    collection: 'subjects',
    where: {
      and: [{ exam: { equals: examId } }, { isActive: { equals: true } }],
    },
    sort: 'order',
    depth: 0,
    limit: 30, // ✅ FIX
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      isActive: true,
      exam: true,
    },
  })

  // ===================== UNITS =====================
  const { docs: allUnits } = await payload.find({
    collection: 'units',
    where: {
      and: [{ exam: { equals: examId } }, { isActive: { equals: true } }],
    },
    sort: 'order',
    depth: 0,
    limit: 30, // ✅ FIX
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      isActive: true,
      exam: true,
      subject: true,
    },
  })

  // ===================== CHAPTERS =====================
  const { docs: allChapters } = await payload.find({
    collection: 'chapters',
    where: {
      and: [{ exam: { equals: examId } }, { isActive: { equals: true } }],
    },
    sort: 'order',
    depth: 0,
    limit: 30, // ✅ FIX
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      isActive: true,
      exam: true,
      subject: true,
      unit: true,
    },
  })

  // ===================== TOPICS =====================
  const { docs: allTopics } = await payload.find({
    collection: 'topics',
    where: {
      and: [{ exam: { equals: examId } }, { isActive: { equals: true } }],
    },
    sort: 'order',
    depth: 0,
    limit: 30, // ✅ FIX
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      isActive: true,
      exam: true,
      subject: true,
      unit: true,
      chapter: true,
    },
  })

  // ===================== BUILD HIERARCHY =====================
  const subjectsWithHierarchy = subjects.map((subject: any) => {
    // Attach units to subject
    const units = allUnits.filter((unit: any) => {
      const unitSubjectId =
        typeof unit.subject === 'string'
          ? unit.subject
          : unit.subject?.id
      return String(unitSubjectId) === String(subject.id)
    })

    const unitsWithChapters = units.map((unit: any) => {
      // Attach chapters to unit
      const chapters = allChapters.filter((chapter: any) => {
        const chapterUnitId =
          typeof chapter.unit === 'string'
            ? chapter.unit
            : chapter.unit?.id
        return String(chapterUnitId) === String(unit.id)
      })

      const chaptersWithTopics = chapters.map((chapter: any) => {
        // Attach topics to chapter
        const topics = allTopics.filter((topic: any) => {
          const topicChapterId =
            typeof topic.chapter === 'string'
              ? topic.chapter
              : topic.chapter?.id
          return String(topicChapterId) === String(chapter.id)
        })

        return {
          ...chapter,
          topics,
        }
      })

      return {
        ...unit,
        chapters: chaptersWithTopics,
      }
    })

    return {
      ...subject,
      units: unitsWithChapters,
    }
  })

  return subjectsWithHierarchy
}
