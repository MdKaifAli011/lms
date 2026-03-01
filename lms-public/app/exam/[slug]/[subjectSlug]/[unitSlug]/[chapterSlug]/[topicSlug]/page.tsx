import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
  getTopicById,
  getSubtopics,
} from "@/lib/api";
import { buildSubjectHierarchy } from "@/lib/buildHierarchy";
import { getUniversalNav } from "@/lib/navigationService";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { HierarchyListSection } from "@/components/HierarchyListSection";
import { RecordVisit } from "@/components/RecordVisit";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string; unitSlug: string; chapterSlug: string; topicSlug: string }>;
}

export default async function TopicPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug } = await params;

  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();
  const examId = String((exam as { id: string }).id);
  const examName = String((exam as { name?: string }).name ?? examSlug);

  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subjectBySlug = subjects.find((s) => s.slug === subjectSlug);
  if (!subjectBySlug) notFound();
  const subjectName = subjectBySlug.name;

  const unitsRaw = await getUnits({ subjectId: subjectBySlug.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unitBySlug = units.find((u) => u.slug === unitSlug);
  if (!unitBySlug) notFound();
  const unitName = unitBySlug.name;

  const chaptersRaw = await getChapters({ unitId: unitBySlug.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapterBySlug = chapters.find((c) => c.slug === chapterSlug);
  if (!chapterBySlug) notFound();
  const chapterName = chapterBySlug.name;

  const topicsRaw = await getTopics({ chapterId: chapterBySlug.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const topicBySlug = topics.find((t) => t.slug === topicSlug);
  if (!topicBySlug) notFound();

  const topic = await getTopicById(topicBySlug.id);
  if (!topic || typeof topic !== "object") notFound();
  const topicName = String((topic as { name?: string }).name ?? topicSlug);
  const contentBody = (topic as { contentBody?: string }).contentBody ?? "";

  const [, nav, subtopicsRaw] = await Promise.all([
    buildSubjectHierarchy(examId),
    getUniversalNav({ examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug }),
    getSubtopics({ topicId: topicBySlug.id, contextapi: true }),
  ]);
  const subtopics = (subtopicsRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  ).map((s) => ({ id: s.id, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${s.slug ?? s.id}`, slug: s.slug, name: s.name }));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unitName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    { label: chapterName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}` },
    { label: topicName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}` },
  ];

  return (
    <>
      <RecordVisit resource="topics" param={topicBySlug.id} />
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
        {topicName}
      </h1>
      {contentBody ? (
        <div className="mt-6 sm:mt-8 md:mt-10">
          <ContentRenderer content={contentBody} />
        </div>
      ) : null}
      <HierarchyListSection variant="subtopics" items={subtopics} />
      <div className="mt-8 sm:mt-10 md:mt-12">
        <NavigationButtons prev={nav.prev} next={nav.next} />
      </div>
    </>
  );
}
