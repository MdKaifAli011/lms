import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getSyllabusTree } from "@/lib/api";
import type { SyllabusSubject } from "@/lib/buildHierarchy";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SyllabusTree } from "@/components/syllabus/SyllabusTree";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlugOrId(slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) {
    return { title: "Not Found | LmsDoors" };
  }
  const name = toTitleCase(String((exam as { name?: string }).name ?? slug));
  return {
    title: `${name} Syllabus | LmsDoors`,
    description: `Complete syllabus for ${name} – all subjects, units, chapters, topics, subtopics and definitions in one place.`,
  };
}

export default async function SyllabusPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = await getExamBySlugOrId(slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();

  const examId = String((exam as { id: string }).id);
  const examName = toTitleCase(String((exam as { name?: string }).name ?? slug));

  const { subjects: syllabus } = await getSyllabusTree(examId);

  const breadcrumbs = [
    { label: examName, href: `/exam/${slug}` },
    { label: "Syllabus", href: `/exam/${slug}/syllabus` },
  ];

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {examName} Syllabus
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Complete curriculum across all 7 levels. Expand any section to see units, chapters, topics, subtopics and definitions.
        </p>
      </header>
      <div className="mt-6 sm:mt-8">
        <SyllabusTree examSlug={slug} examName={examName} subjects={(syllabus ?? []) as SyllabusSubject[]} />
      </div>
    </>
  );
}
