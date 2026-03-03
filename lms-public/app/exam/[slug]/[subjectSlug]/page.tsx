import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getSubjects, getSubjectById, getUnits, getSidebarTree } from "@/lib/api";
import { generateEntityMetadata, normalizeApiSeo } from "@/lib/metadata";
import { getUniversalNav } from "@/lib/navigationService";
import { toTitleCase } from "@/lib/titleCase";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { HierarchyListSection } from "@/components/HierarchyListSection";
import { RecordVisit } from "@/components/RecordVisit";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: examSlug, subjectSlug } = await params;
  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) return { title: "Not Found | LmsDoors" };
  const examId = String((exam as { id: string }).id);
  const examName = String((exam as { name?: string }).name ?? examSlug);
  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subjectBySlug = subjects.find((s) => s.slug === subjectSlug);
  if (!subjectBySlug) return { title: "Not Found | LmsDoors" };
  const subject = await getSubjectById(subjectBySlug.id);
  if (!subject || typeof subject !== "object") return { title: "Not Found | LmsDoors" };
  const subjectName = toTitleCase(String((subject as { name?: string }).name ?? subjectSlug));
  const seo = normalizeApiSeo((subject as { seo?: unknown }).seo);
  return generateEntityMetadata({
    title: subjectName,
    examTitle: toTitleCase(examName),
    level: "subject",
    seo: seo ?? undefined,
  });
}

export default async function SubjectPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug } = await params;

  const exam = await getExamBySlugOrId(examSlug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();
  const examId = String((exam as { id: string }).id);
  const examName = toTitleCase(String((exam as { name?: string }).name ?? examSlug));

  const subjectsRaw = await getSubjects({ examId, contextapi: true });
  const subjects = (subjectsRaw as { id: string; name: string; slug: string }[]).filter(
    (s) => (s as { status?: string }).status === "Active"
  );
  const subjectBySlug = subjects.find((s) => s.slug === subjectSlug);
  if (!subjectBySlug) notFound();

  const subject = await getSubjectById(subjectBySlug.id);
  if (!subject || typeof subject !== "object") notFound();
  const subjectName = toTitleCase(String((subject as { name?: string }).name ?? subjectSlug));
  const contentBody = (subject as { contentBody?: string }).contentBody ?? "";

  const [sidebarData, nav, unitsRaw] = await Promise.all([
    getSidebarTree(examId),
    getUniversalNav({ examSlug, subjectSlug }),
    getUnits({ subjectId: subjectBySlug.id, contextapi: true }),
  ]);
  const hierarchy = sidebarData.subjects ?? [];
  const units = (unitsRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  ).map((u) => ({ id: u.id, href: `/exam/${examSlug}/${subjectSlug}/${u.slug ?? u.id}`, slug: u.slug, name: toTitleCase(u.name ?? "") }));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
  ];

  return (
    <>
      <RecordVisit resource="subjects" param={subjectBySlug.id} />
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
        {subjectName}
      </h1>
      {contentBody ? (
        <div className="mt-6 sm:mt-8 md:mt-10">
          <ContentRenderer content={contentBody} />
        </div>
      ) : null}
      <HierarchyListSection variant="units" items={units} />
      <div className="mt-8 sm:mt-10 md:mt-12">
        <NavigationButtons prev={nav.prev} next={nav.next} />
      </div>
    </>
  );
}
