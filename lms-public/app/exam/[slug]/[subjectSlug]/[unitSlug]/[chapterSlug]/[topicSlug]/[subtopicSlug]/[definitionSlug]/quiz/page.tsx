import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
  getSubtopics,
  getDefinitions,
  getDefinitionById,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LevelQuiz } from "@/components/LevelQuiz";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    slug: string;
    subjectSlug: string;
    unitSlug: string;
    chapterSlug: string;
    topicSlug: string;
    subtopicSlug: string;
    definitionSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const exam = await getExamBySlugOrId(p.slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) return { title: "Not Found | LmsDoors" };
  const examId = String((exam as { id: string }).id);
  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === p.subjectSlug);
  if (!subject) return { title: "Not Found | LmsDoors" };
  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unit = units.find((u) => u.slug === p.unitSlug);
  if (!unit) return { title: "Not Found | LmsDoors" };
  const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapter = chapters.find((c) => c.slug === p.chapterSlug);
  if (!chapter) return { title: "Not Found | LmsDoors" };
  const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const topic = topics.find((t) => t.slug === p.topicSlug);
  if (!topic) return { title: "Not Found | LmsDoors" };
  const subtopicsRaw = await getSubtopics({ topicId: topic.id, contextapi: true });
  const subtopics = (subtopicsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subtopic = subtopics.find((s) => s.slug === p.subtopicSlug);
  if (!subtopic) return { title: "Not Found | LmsDoors" };
  const definitionsRaw = await getDefinitions({ subtopicId: subtopic.id, contextapi: true });
  const definitions = (definitionsRaw as { id: string; name: string; slug: string }[]).filter(
    (d) => (d as { status?: string }).status === "Active"
  );
  const definition = definitions.find((d) => d.slug === p.definitionSlug);
  if (!definition) return { title: "Not Found | LmsDoors" };
  const definitionData = await getDefinitionById(definition.id);
  if (!definitionData || typeof definitionData !== "object") return { title: "Not Found | LmsDoors" };
  const definitionName = toTitleCase(String((definitionData as { name?: string }).name ?? p.definitionSlug));
  return { title: `Quiz – ${definitionName} | LmsDoors` };
}

export default async function DefinitionQuizPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug, subtopicSlug, definitionSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();
  const examId = String((exam as { id: string }).id);
  const examName = toTitleCase(String((exam as { name?: string }).name ?? examSlug));

  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === subjectSlug);
  if (!subject) notFound();
  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unit = units.find((u) => u.slug === unitSlug);
  if (!unit) notFound();
  const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) notFound();
  const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) notFound();
  const subtopicsRaw = await getSubtopics({ topicId: topic.id, contextapi: true });
  const subtopics = (subtopicsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subtopic = subtopics.find((s) => s.slug === subtopicSlug);
  if (!subtopic) notFound();
  const definitionsRaw = await getDefinitions({ subtopicId: subtopic.id, contextapi: true });
  const definitions = (definitionsRaw as { id: string; name: string; slug: string }[]).filter(
    (d) => (d as { status?: string }).status === "Active"
  );
  const definition = definitions.find((d) => d.slug === definitionSlug);
  if (!definition) notFound();
  const definitionData = await getDefinitionById(definition.id);
  if (!definitionData || typeof definitionData !== "object") notFound();
  const definitionName = toTitleCase(String((definitionData as { name?: string }).name ?? definitionSlug));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: toTitleCase(subject.name), href: `/exam/${examSlug}/${subjectSlug}` },
    { label: toTitleCase(unit.name), href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    { label: toTitleCase(chapter.name), href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}` },
    { label: toTitleCase(topic.name), href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}` },
    { label: toTitleCase(subtopic.name), href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}` },
    { label: definitionName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/${definitionSlug}` },
    { label: "Quiz", href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/${definitionSlug}/quiz` },
  ];

  const prevHref = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/quiz`;

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4 sm:mb-6">
        Quiz – {definitionName}
      </h1>
      <LevelQuiz
        level={7}
        examId={examId}
        examSlug={examSlug}
        subjectId={subject.id}
        unitId={unit.id}
        chapterId={chapter.id}
        topicId={topic.id}
        subtopicId={subtopic.id}
        definitionId={definition.id}
        title={`Practice quiz – ${definitionName}`}
      />
      <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <Link href={prevHref}>
            <ChevronLeft className="h-4 w-4" /> Previous level quiz
          </Link>
        </Button>
      </div>
    </>
  );
}
