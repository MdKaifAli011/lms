import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  getExamBySlugOrId,
  getSubjects,
  getUnits,
  getUnitById,
  getChapters,
} from "@/lib/api";
import { buildSubjectHierarchy } from "@/lib/buildHierarchy";
import { getUniversalNav } from "@/lib/navigationService";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { HierarchyListSection } from "@/components/HierarchyListSection";
import { RecordVisit } from "@/components/RecordVisit";

interface PageProps {
  params: Promise<{ slug: string; subjectSlug: string; unitSlug: string }>;
}

export default async function UnitPage({ params }: PageProps) {
  const { slug: examSlug, subjectSlug, unitSlug } = await params;

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

  const unit = await getUnitById(unitBySlug.id);
  if (!unit || typeof unit !== "object") notFound();
  const unitName = String((unit as { name?: string }).name ?? unitSlug);
  const contentBody = (unit as { contentBody?: string }).contentBody ?? "";

  const [, nav, chaptersRaw] = await Promise.all([
    buildSubjectHierarchy(examId),
    getUniversalNav({ examSlug, subjectSlug, unitSlug }),
    getChapters({ unitId: unitBySlug.id, contextapi: true }),
  ]);
  const chapters = (chaptersRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (c) => (c as { status?: string }).status === "Active"
  ).map((c) => ({ id: c.id, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${c.slug ?? c.id}`, slug: c.slug, name: c.name }));

  const breadcrumbs = [
    { label: examName, href: `/exam/${examSlug}` },
    { label: subjectName, href: `/exam/${examSlug}/${subjectSlug}` },
    { label: unitName, href: `/exam/${examSlug}/${subjectSlug}/${unitSlug}` },
  ];

  return (
    <>
      <RecordVisit resource="units" param={unitBySlug.id} />
      <div className="mb-3 sm:mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
        {unitName}
      </h1>
      {contentBody ? (
        <div className="mt-6 sm:mt-8 md:mt-10">
          <ContentRenderer content={contentBody} />
        </div>
      ) : null}
      <HierarchyListSection variant="chapters" items={chapters} />
      <div className="mt-8 sm:mt-10 md:mt-12">
        <NavigationButtons prev={nav.prev} next={nav.next} />
      </div>
    </>
  );
}
