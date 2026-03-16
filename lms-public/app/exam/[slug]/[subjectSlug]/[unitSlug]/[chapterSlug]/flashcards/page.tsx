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
  getChapterById,
  getTopics,
  getLevelWiseFlashcardDeckAndCards,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string; unitSlug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug } = await params;
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
  const chapterData = await getChapterById(chapter.id);
  if (!chapterData || typeof chapterData !== "object") return { title: "Not Found | LmsDoors" };
  const chapterName = toTitleCase(String((chapterData as { name?: string }).name ?? chapterSlug));
  return { title: `Flashcards – ${chapterName} | LmsDoors` };
}

export default async function ChapterFlashcardsPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug, chapterSlug } = await params;
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
  const chapters = (chaptersRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) notFound();
  const chapterData = await getChapterById(chapter.id);
  if (!chapterData || typeof chapterData !== "object") notFound();
  const chapterName = toTitleCase(String((chapterData as { name?: string }).name ?? chapterSlug));

  const topicsRaw = await getTopics({ chapterId: chapter.id, contextapi: true });
  const topics = (topicsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (t) => (t as { status?: string }).status === "Active"
  );
  const firstTopic = topics.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))[0];

  const { cards: rawCards } = await getLevelWiseFlashcardDeckAndCards({
    examId: String((exam as { id: string }).id),
    level: 4,
    subjectId: subject.id,
    unitId: unit.id,
    chapterId: chapter.id,
  });
  const cards = rawCards.map((c) => ({ front: c.front, back: c.back }));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unitName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    { label: chapterName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}` },
    { label: "Flashcards", href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/flashcards` },
  ];

  const prevHref = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/flashcards`;
  const nextHref = firstTopic
    ? `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${firstTopic.slug ?? firstTopic.id}/flashcards`
    : null;

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4 sm:mb-6">
        Flashcards – {chapterName}
      </h1>
      <FlashcardDeck title={`Flashcards – ${chapterName}`} cards={cards} />
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
