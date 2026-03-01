import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getSubjects, getSubjectById, getUnits } from "@/lib/api";
import { buildSubjectHierarchy } from "@/lib/buildHierarchy";
import { getUniversalNav } from "@/lib/navigationService";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { HierarchyListSection } from "@/components/HierarchyListSection";
import { RecordVisit } from "@/components/RecordVisit";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug } = await params;

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

  const subject = await getSubjectById(subjectBySlug.id);
  if (!subject || typeof subject !== "object") notFound();
  const subjectName = String((subject as { name?: string }).name ?? subjectSlug);
  const contentBody = (subject as { contentBody?: string }).contentBody ?? "";

  const [hierarchy, nav, unitsRaw] = await Promise.all([
    buildSubjectHierarchy(examId),
    getUniversalNav({ examSlug, subjectSlug }),
    getUnits({ subjectId: subjectBySlug.id, contextapi: true }),
  ]);
  const units = (unitsRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (u) => (u as { status?: string }).status === "Active"
  ).map((u) => ({ id: u.id, href: `/exam/${examSlug}/${subjectSlug}/${u.slug ?? u.id}`, slug: u.slug, name: u.name }));

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
