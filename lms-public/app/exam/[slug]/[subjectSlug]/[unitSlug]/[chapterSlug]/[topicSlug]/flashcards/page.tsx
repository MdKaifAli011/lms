import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getChapters,
  getTopics,
  getTopicById,
  getSubtopics,
  getLevelWiseFlashcardDeckAndCards,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Button } from "@/components/ui/button";
import { generateFlashcardDeckMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string; unitSlug: string; chapterSlug: string; topicSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) return { title: "Not Found | LmsDoors" };
  const examId = String((exam as { id: string }).id);
  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === subjectSlug);
  if (!subject) return { title: "Not Found | LmsDoors" };
  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unit = units.find((u) => u.slug === unitSlug);
  if (!unit) return { title: "Not Found | LmsDoors" };
  const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return { title: "Not Found | LmsDoors" };
  const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) return { title: "Not Found | LmsDoors" };
  const topicData = await getTopicById(topic.id);
  if (!topicData || typeof topicData !== "object") return { title: "Not Found | LmsDoors" };
  const topicName = toTitleCase(String((topicData as { name?: string }).name ?? topicSlug));
  const fallbackTitle = `Flashcards – ${topicName}`;
  const { deck } = await getLevelWiseFlashcardDeckAndCards({
    examId,
    level: 5,
    subjectId: subject.id,
    unitId: unit.id,
    chapterId: chapter.id,
    topicId: topic.id,
  });
  return generateFlashcardDeckMetadata(deck, fallbackTitle);
}

export default async function TopicFlashcardsPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug, topicSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();
  const examName = toTitleCase(String((exam as { name?: string }).name ?? examSlug));

  const subjectsRaw = await getSubjects({ examId: String((exam as { id: string }).id), contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === subjectSlug);
  if (!subject) notFound();
  const subjectName = toTitleCase(subject.name);

  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unit = units.find((u) => u.slug === unitSlug);
  if (!unit) notFound();
  const unitName = toTitleCase(unit.name);

  const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) notFound();
  const chapterName = toTitleCase(chapter.name);

  const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) notFound();
  const topicData = await getTopicById(topic.id);
  if (!topicData || typeof topicData !== "object") notFound();
  const topicName = toTitleCase(String((topicData as { name?: string }).name ?? topicSlug));

  const subtopicsRaw = await getSubtopics({ topicId: topic.id, contextapi: true });
  const subtopics = (subtopicsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const firstSubtopic = subtopics.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))[0];

  const { cards: rawCards } = await getLevelWiseFlashcardDeckAndCards({
    examId: String((exam as { id: string }).id),
    level: 5,
    subjectId: subject.id,
    unitId: unit.id,
    chapterId: chapter.id,
    topicId: topic.id,
  });
  const cards = rawCards.map((c) => ({ front: c.front, back: c.back }));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unitName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    { label: chapterName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}` },
    { label: topicName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}` },
    { label: "Flashcards", href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/flashcards` },
  ];

  const prevHref = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/flashcards`;
  const nextHref = firstSubtopic
    ? `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${firstSubtopic.slug ?? firstSubtopic.id}/flashcards`
    : null;

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4 sm:mb-6">
        Flashcards – {topicName}
      </h1>
      <FlashcardDeck title={`Flashcards – ${topicName}`} cards={cards} />
      <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <Link href={prevHref}>
            <ChevronLeft className="h-4 w-4" /> Previous level flashcards
          </Link>
        </Button>
        {nextHref ? (
          <Button size="sm" className="gap-1" asChild>
            <Link href={nextHref}>
              Next level flashcards <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}
