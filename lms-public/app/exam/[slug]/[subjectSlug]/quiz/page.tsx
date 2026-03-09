import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getSubjects, getUnits } from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LevelQuiz } from "@/components/LevelQuiz";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: examSlug, subjectSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) return { title: "Not Found | LmsDoors" };
  const examId = String((exam as { id: string }).id);
  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === subjectSlug);
  if (!subject) return { title: "Not Found | LmsDoors" };
  const name = toTitleCase(subject.name);
  return { title: `Quiz – ${name} | LmsDoors` };
}

export default async function SubjectQuizPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();
  const examId = String((exam as { id: string }).id);
  const examName = toTitleCase(String((exam as { name?: string }).name ?? examSlug));

  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subject = subjects.find((s) => s.slug === subjectSlug);
  if (!subject) notFound();
  const subjectName = toTitleCase(subject.name);

  const unitsRaw = await getUnits({ subjectId: subject.id, contextapi: true });
  const units = (unitsRaw as { id: string; name: string; slug: string; orderNumber?: number }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  );
  const firstUnit = units.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))[0];

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: "Quiz", href: `/exam/${examSlug}/${subjectSlug}/quiz` },
  ];

  const prevHref = `/exam/${examSlug}/quiz`;
  const nextHref = firstUnit ? `/exam/${examSlug}/${subjectSlug}/${firstUnit.slug ?? firstUnit.id}/quiz` : null;

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4 sm:mb-6">
        Quiz – {subjectName}
      </h1>
      <LevelQuiz
        level={2}
        examId={examId}
        examSlug={examSlug}
        subjectId={subject.id}
        title={`Practice quiz – ${subjectName}`}
      />
      <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <Link href={prevHref}>
            <ChevronLeft className="h-4 w-4" /> Previous level quiz
          </Link>
        </Button>
        {nextHref ? (
          <Button size="sm" className="gap-1" asChild>
            <Link href={nextHref}>
              Next level quiz <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}
