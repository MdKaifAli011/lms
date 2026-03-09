import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getUnitById,
  getChapters,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string; unitSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: examSlug, subjectSlug, unitSlug } = await params;
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
  const unitData = await getUnitById(unit.id);
  if (!unitData || typeof unitData !== "object") return { title: "Not Found | LmsDoors" };
  const unitName = toTitleCase(String((unitData as { name?: string }).name ?? unitSlug));
  return { title: `Flashcards – ${unitName} | LmsDoors` };
}

export default async function UnitFlashcardsPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug } = await params;
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
  const subjectName = toTitleCase(subject.name);

  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const unit = units.find((u) => u.slug === unitSlug);
  if (!unit) notFound();
  const unitData = await getUnitById(unit.id);
  if (!unitData || typeof unitData !== "object") notFound();
  const unitName = toTitleCase(String((unitData as { name?: string }).name ?? unitSlug));

  const chaptersRaw = await getChapters({ unitId: unit.id, contextapi: true });
  const chapters = (chaptersRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  );
  const firstChapter = chapters.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))[0];

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unitName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
    { label: "Flashcards", href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/flashcards` },
  ];

  const prevHref = `/exam/${examSlug}/${subjectSlug}/flashcards`;
  const nextHref = firstChapter
    ? `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${firstChapter.slug ?? firstChapter.id}/flashcards`
    : null;

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4 sm:mb-6">
        Flashcards – {unitName}
      </h1>
      <FlashcardDeck title={`Flashcards – ${unitName}`} />
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
