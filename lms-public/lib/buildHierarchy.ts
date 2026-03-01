/**
 * Builds subject → unit → chapter → topic hierarchy using the REST API.
 * Filters by status === "Active". Uses orderNumber for ordering.
 */

import {
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
} from "./api";

type SubjectRow = { id: string; name: string; slug: string; status?: string; orderNumber?: number };
type UnitRow = { id: string; name: string; slug: string; subjectId: string; status?: string; orderNumber?: number };
type ChapterRow = { id: string; name: string; slug: string; unitId: string; status?: string; orderNumber?: number };
type TopicRow = { id: string; name: string; slug: string; chapterId: string; status?: string; orderNumber?: number };

export interface HierarchyUnit {
  id: string;
  name: string;
  slug: string;
  chapters: HierarchyChapter[];
}

export interface HierarchyChapter {
  id: string;
  name: string;
  slug: string;
  topics: HierarchyTopic[];
}

export interface HierarchyTopic {
  id: string;
  name: string;
  slug: string;
}

export interface HierarchySubject {
  id: string;
  name: string;
  slug: string;
  units: HierarchyUnit[];
}

const isActive = (s: { status?: string }) => s.status === "Active";

function byOrder<T extends { orderNumber?: number }>(a: T, b: T) {
  const oa = a.orderNumber ?? 0;
  const ob = b.orderNumber ?? 0;
  return oa - ob;
}

export async function buildSubjectHierarchy(examId: string): Promise<HierarchySubject[]> {
  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as SubjectRow[]).filter(isActive).sort(byOrder);

  const unitsPerSubject = await Promise.all(
    subjects.map((s) => getUnits({ subjectId: s.id, contextapi: true }))
  );

  const allUnits = unitsPerSubject.flat() as UnitRow[];
  const unitsActive = allUnits.filter(isActive).sort(byOrder);

  const chaptersPerUnit = await Promise.all(
    unitsActive.map((u) => getChapters({ unitId: u.id, contextapi: true }))
  );
  const allChapters = chaptersPerUnit.flat() as ChapterRow[];
  const chaptersActive = allChapters.filter(isActive).sort(byOrder);

  const topicsPerChapter = await Promise.all(
    chaptersActive.map((c) => getTopics({ chapterId: c.id, contextapi: true }))
  );
  const allTopics = topicsPerChapter.flat() as TopicRow[];
  const topicsActive = allTopics.filter(isActive).sort(byOrder);

  return subjects.map((subject) => {
    const subjectUnits = unitsActive.filter((u) => u.subjectId === subject.id);
    const unitsWithChapters = subjectUnits.map((unit) => {
      const unitChapters = chaptersActive.filter((c) => c.unitId === unit.id);
      const chaptersWithTopics = unitChapters.map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        slug: chapter.slug,
        topics: topicsActive
          .filter((t) => t.chapterId === chapter.id)
          .map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      }));
      return {
        id: unit.id,
        name: unit.name,
        slug: unit.slug,
        chapters: chaptersWithTopics,
      };
    });
    return {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      units: unitsWithChapters,
    };
  });
}
