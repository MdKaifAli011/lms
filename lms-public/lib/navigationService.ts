/**
 * Prev/Next navigation for the content tree using the REST API.
 * Order: Exam → Subjects → Units → Chapters → Topics → Subtopics → Definitions.
 */

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
  getSubtopics,
  getDefinitions,
} from "./api";

export type NavItem = { label: string; href: string } | null;

export interface NavContext {
  examSlug: string;
  subjectSlug?: string;
  unitSlug?: string;
  chapterSlug?: string;
  topicSlug?: string;
  subtopicSlug?: string;
  definitionSlug?: string;
}

type Row = { id: string; name: string; slug: string; orderNumber?: number };

const byOrder = (a: Row, b: Row) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0);

function buildLink(
  examSlug: string,
  slugs: {
    subject?: string;
    unit?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
    definition?: string;
  },
  node: Row,
  level: string
): NavItem {
  let path = `/exam/${examSlug}`;
  const s = slugs.subject ?? "";
  const u = slugs.unit ?? "";
  const c = slugs.chapter ?? "";
  const t = slugs.topic ?? "";
  const st = slugs.subtopic ?? "";
  const slug = node.slug || node.id;
  if (level === "subject") path += `/${slug}`;
  else if (level === "unit") path += `/${s}/${slug}`;
  else if (level === "chapter") path += `/${s}/${u}/${slug}`;
  else if (level === "topic") path += `/${s}/${u}/${c}/${slug}`;
  else if (level === "subtopic") path += `/${s}/${u}/${c}/${t}/${slug}`;
  else if (level === "definition") path += `/${s}/${u}/${c}/${t}/${st}/${slug}`;
  return { label: (node as { name?: string }).name ?? "", href: path };
}

export async function getUniversalNav(ctx: NavContext): Promise<{ prev: NavItem; next: NavItem }> {
  const {
    examSlug,
    subjectSlug,
    unitSlug,
    chapterSlug,
    topicSlug,
    subtopicSlug,
    definitionSlug,
  } = ctx;

  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) return { prev: null, next: null };
  const examId = String((exam as { id: string }).id);

  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as Row[]).filter((s) => (s as { status?: string }).status === "Active").sort(byOrder);
  const subject = subjectSlug ? subjects.find((s) => s.slug === subjectSlug) ?? null : null;

  let unit: Row | null = null;
  if (subject && unitSlug) {
    const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
    const units = (unitsRaw as Row[]).filter((u) => (u as { status?: string }).status === "Active").sort(byOrder);
    unit = units.find((u) => u.slug === unitSlug) ?? null;
  }

  let chapter: Row | null = null;
  if (unit && chapterSlug) {
    const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
    const chapters = (chaptersRaw as Row[]).filter((c) => (c as { status?: string }).status === "Active").sort(byOrder);
    chapter = chapters.find((c) => c.slug === chapterSlug) ?? null;
  }

  let topic: Row | null = null;
  if (chapter && topicSlug) {
    const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
    const topics = (topicsRaw as Row[]).filter((t) => (t as { status?: string }).status === "Active").sort(byOrder);
    topic = topics.find((t) => t.slug === topicSlug) ?? null;
  }

  let subtopic: Row | null = null;
  if (topic && subtopicSlug) {
    const subtopicsRaw = await getSubtopics({ topicId: topic.id, contextapi: true });
    const subtopics = (subtopicsRaw as Row[]).filter((s) => (s as { status?: string }).status === "Active").sort(byOrder);
    subtopic = subtopics.find((s) => s.slug === subtopicSlug) ?? null;
  }

  let definition: Row | null = null;
  if (subtopic && definitionSlug) {
    const definitionsRaw = await getDefinitions({ subtopicId: subtopic.id, contextapi: true });
    const definitions = (definitionsRaw as Row[]).filter((d) => (d as { status?: string }).status === "Active").sort(byOrder);
    definition = definitions.find((d) => d.slug === definitionSlug) ?? null;
  }

  const slugs = {
    subject: subject?.slug,
    unit: unit?.slug,
    chapter: chapter?.slug,
    topic: topic?.slug,
    subtopic: subtopic?.slug,
  };

  const getFirstChild = async (node: Row, level: string): Promise<Row | null> => {
    if (level === "exam") {
      const list = (await getSubjects({ examId: node.id, contextapi: true })) as Row[];
      const active = list.filter((s) => (s as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    if (level === "subject") {
      const list = (await getUnits({ subjectId: node.id, contextapi: true })) as Row[];
      const active = list.filter((u) => (u as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    if (level === "unit") {
      const list = (await getChapters({ unitId: node.id, contextapi: true })) as Row[];
      const active = list.filter((c) => (c as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    if (level === "chapter") {
      const list = (await getTopics({ chapterId: node.id, contextapi: true })) as Row[];
      const active = list.filter((t) => (t as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    if (level === "topic") {
      const list = (await getSubtopics({ topicId: node.id, contextapi: true })) as Row[];
      const active = list.filter((s) => (s as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    if (level === "subtopic") {
      const list = (await getDefinitions({ subtopicId: node.id, contextapi: true })) as Row[];
      const active = list.filter((d) => (d as { status?: string }).status === "Active").sort(byOrder);
      return active[0] ?? null;
    }
    return null;
  };

  const getSibling = async (node: Row, level: string, dir: "next" | "prev"): Promise<Row | null> => {
    let list: Row[] = [];
    if (level === "subject") list = subjects;
    else if (level === "unit" && subject) list = (await getUnits({ subjectId: subject.id, contextapi: true })) as Row[];
    else if (level === "chapter" && unit) list = (await getChapters({ unitId: unit.id, contextapi: true })) as Row[];
    else if (level === "topic" && chapter) list = (await getTopics({ chapterId: chapter.id, contextapi: true })) as Row[];
    else if (level === "subtopic" && topic) list = (await getSubtopics({ topicId: topic.id, contextapi: true })) as Row[];
    else if (level === "definition" && subtopic) list = (await getDefinitions({ subtopicId: subtopic.id, contextapi: true })) as Row[];
    const active = list.filter((x) => (x as { status?: string }).status === "Active").sort(byOrder);
    const idx = active.findIndex((x) => x.id === node.id);
    if (idx < 0) return null;
    if (dir === "next") return active[idx + 1] ?? null;
    return active[idx - 1] ?? null;
  };

  const getLastLeaf = async (node: Row, level: string): Promise<{ node: Row; level: string }> => {
    const child = await getFirstChild(node, level);
    if (!child) return { node, level };
    const childLevel =
      level === "exam" ? "subject" : level === "subject" ? "unit" : level === "unit" ? "chapter" : level === "chapter" ? "topic" : level === "topic" ? "subtopic" : "definition";
    return getLastLeaf(child, childLevel);
  };

  const getNext = async (curr: Row, level: string): Promise<NavItem> => {
    const child = await getFirstChild(curr, level);
    const childLevel =
      level === "exam" ? "subject" : level === "subject" ? "unit" : level === "unit" ? "chapter" : level === "chapter" ? "topic" : level === "topic" ? "subtopic" : "definition";
    if (child) return buildLink(examSlug, slugs, child, childLevel);

    let node: Row = curr;
    let nodeLevel = level;
    while (nodeLevel !== "exam") {
      const sibling = await getSibling(node, nodeLevel, "next");
      if (sibling) return buildLink(examSlug, slugs, sibling, nodeLevel);

      const parentMap: Record<string, { node: Row | null; level: string }> = {
        subject: { node: exam as Row, level: "exam" },
        unit: { node: subject, level: "subject" },
        chapter: { node: unit, level: "unit" },
        topic: { node: chapter, level: "chapter" },
        subtopic: { node: topic, level: "subtopic" },
        definition: { node: subtopic, level: "subtopic" },
      };
      const parent = parentMap[nodeLevel];
      if (!parent?.node) break;
      node = parent.node;
      nodeLevel = parent.level;
    }
    return null;
  };

  const getPrev = async (curr: Row, level: string): Promise<NavItem> => {
    const sibling = await getSibling(curr, level, "prev");
    if (sibling) {
      const lastLeaf = await getLastLeaf(sibling, level);
      return buildLink(examSlug, slugs, lastLeaf.node, lastLeaf.level);
    }
    const parentMap: Record<string, { node: Row | null; level: string }> = {
      subject: { node: exam as Row, level: "exam" },
      unit: { node: subject, level: "subject" },
      chapter: { node: unit, level: "unit" },
      topic: { node: chapter, level: "chapter" },
      subtopic: { node: topic, level: "subtopic" },
      definition: { node: subtopic, level: "subtopic" },
    };
    const parent = parentMap[level];
    if (parent?.node) return buildLink(examSlug, slugs, parent.node, parent.level);
    return null;
  };

  let current: Row;
  let currentLevel: string;
  if (definition) {
    current = definition;
    currentLevel = "definition";
  } else if (subtopic) {
    current = subtopic;
    currentLevel = "subtopic";
  } else if (topic) {
    current = topic;
    currentLevel = "topic";
  } else if (chapter) {
    current = chapter;
    currentLevel = "chapter";
  } else if (unit) {
    current = unit;
    currentLevel = "unit";
  } else if (subject) {
    current = subject;
    currentLevel = "subject";
  } else {
    current = exam as Row;
    currentLevel = "exam";
  }

  const [next, prev] = await Promise.all([
    getNext(current, currentLevel),
    getPrev(current, currentLevel),
  ]);
  return { prev, next };
}
