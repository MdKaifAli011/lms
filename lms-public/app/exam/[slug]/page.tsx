import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getSidebarTree } from "@/lib/api";
import type { HierarchySubject } from "@/lib/buildHierarchy";
import { getUniversalNav } from "@/lib/navigationService";
import { generateEntityMetadata, normalizeApiSeo } from "@/lib/metadata";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { SubjectCardGrid } from "@/components/SubjectCardGrid";
import { RecordVisit } from "@/components/RecordVisit";
import { LevelQuiz } from "@/components/LevelQuiz";
import { BookOpen } from "lucide-react";

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
  const seo = normalizeApiSeo((exam as { seo?: unknown }).seo);
  return generateEntityMetadata({
    title: name,
    level: "exam",
    seo: seo ?? undefined,
  });
}

export default async function ExamSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = await getExamBySlugOrId(slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();

  const examId = String((exam as { id: string }).id);
  const examName = toTitleCase(String((exam as { name?: string }).name ?? slug));
  const contentBody = (exam as { contentBody?: string }).contentBody ?? "";

  const [sidebarData, nav] = await Promise.all([
    getSidebarTree(examId),
    getUniversalNav({ examSlug: slug }),
  ]);
  const hierarchy = (sidebarData.subjects ?? []) as HierarchySubject[];

  const breadcrumbs = [{ label: examName, href: `/exam/${slug}` }];

  return (
    <>
      <RecordVisit resource="exams" param={slug} />
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
        {examName}
      </h1>
      {contentBody ? (
        <div className="mt-6 sm:mt-8 md:mt-10">
          <ContentRenderer content={contentBody} />
        </div>
      ) : null}
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/exam/${slug}/syllabus`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          View full syllabus
        </Link>
      </div>
      <div className="mt-6 sm:mt-8 md:mt-10">
        <SubjectCardGrid examSlug={slug} subjects={hierarchy} />
      </div>
      <LevelQuiz level={1} examId={examId} examSlug={slug} />
      <div className="mt-8 sm:mt-10 md:mt-12">
        <NavigationButtons prev={nav.prev} next={nav.next} />
      </div>
    </>
  );
}
