/**
 * Builds subject → unit → chapter → topic hierarchy using the REST API.
 * Filters by status === "Active". Uses orderNumber for ordering.
 * buildFullSyllabusHierarchy extends to subtopics and definitions (7 levels).
 */

import {
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
  getSubtopics,
  getDefinitions,
} from "./api";

type SubjectRow = { id: string; name: string; slug: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };
type UnitRow = { id: string; name: string; slug: string; subjectId: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };
type ChapterRow = { id: string; name: string; slug: string; unitId: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };
type TopicRow = { id: string; name: string; slug: string; chapterId: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };
type SubtopicRow = { id: string; name: string; slug: string; topicId: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };
type DefinitionRow = { id: string; name: string; slug: string; subtopicId: string; status?: string; orderNumber?: number; weightage?: number; marks?: number };

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

// ——— Full syllabus (7 levels: subject → unit → chapter → topic → subtopic → definition) ———

export interface SyllabusDefinition {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
}

export interface SyllabusSubtopic {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
  definitions: SyllabusDefinition[];
}

export interface SyllabusTopic {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
  subtopics: SyllabusSubtopic[];
}

export interface SyllabusChapter {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
  topics: SyllabusTopic[];
}

export interface SyllabusUnit {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
  chapters: SyllabusChapter[];
}

export interface SyllabusSubject {
  id: string;
  name: string;
  slug: string;
  weightage?: number;
  marks?: number;
  units: SyllabusUnit[];
}

/** Builds full 7-level hierarchy for syllabus page. */
export async function buildFullSyllabusHierarchy(examId: string): Promise<SyllabusSubject[]> {
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

  const subtopicsPerTopic = await Promise.all(
    topicsActive.map((t) => getSubtopics({ topicId: t.id, contextapi: true }))
  );
  const allSubtopics = subtopicsPerTopic.flat() as SubtopicRow[];
  const subtopicsActive = allSubtopics.filter(isActive).sort(byOrder);

  const definitionsPerSubtopic = await Promise.all(
    subtopicsActive.map((s) => getDefinitions({ subtopicId: s.id, contextapi: true }))
  );
  const allDefinitions = definitionsPerSubtopic.flat() as DefinitionRow[];
  const definitionsActive = allDefinitions.filter(isActive).sort(byOrder);

  return subjects.map((subject) => {
    const s = subject as SubjectRow;
    const subjectUnits = unitsActive.filter((u) => u.subjectId === subject.id);
    const unitsWithChapters = subjectUnits.map((unit) => {
      const u = unit as UnitRow;
      const unitChapters = chaptersActive.filter((c) => c.unitId === unit.id);
      const chaptersWithTopics = unitChapters.map((chapter) => {
        const ch = chapter as ChapterRow;
        const chapterTopics = topicsActive.filter((t) => t.chapterId === chapter.id);
        const topicsWithSubtopics = chapterTopics.map((topic) => {
          const t = topic as TopicRow;
          const topicSubtopics = subtopicsActive.filter((st) => st.topicId === topic.id);
          const subtopicsWithDefs = topicSubtopics.map((subtopic) => {
            const st = subtopic as SubtopicRow;
            return {
              id: subtopic.id,
              name: subtopic.name,
              slug: subtopic.slug,
              weightage: st.weightage,
              marks: st.marks,
              definitions: definitionsActive
                .filter((d) => d.subtopicId === subtopic.id)
                .map((d) => {
                  const dr = d as DefinitionRow;
                  return { id: d.id, name: d.name, slug: d.slug, weightage: dr.weightage, marks: dr.marks };
                }),
            };
          });
          return {
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            weightage: t.weightage,
            marks: t.marks,
            subtopics: subtopicsWithDefs,
          };
        });
        return {
          id: chapter.id,
          name: chapter.name,
          slug: chapter.slug,
          weightage: ch.weightage,
          marks: ch.marks,
          topics: topicsWithSubtopics,
        };
      });
      return {
        id: unit.id,
        name: unit.name,
        slug: unit.slug,
        weightage: u.weightage,
        marks: u.marks,
        chapters: chaptersWithTopics,
      };
    });
    return {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      weightage: s.weightage,
      marks: s.marks,
      units: unitsWithChapters,
    };
  });
}
