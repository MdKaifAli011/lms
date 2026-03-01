import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getExamBySlugOrId, getExams } from "@/lib/api";
import { buildSubjectHierarchy } from "@/lib/buildHierarchy";
import { getUniversalNav } from "@/lib/navigationService";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { SubjectCardGrid } from "@/components/SubjectCardGrid";
import { RecordVisit } from "@/components/RecordVisit";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExamSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = await getExamBySlugOrId(slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();

  const examId = String((exam as { id: string }).id);
  const examName = String((exam as { name?: string }).name ?? slug);
  const contentBody = (exam as { contentBody?: string }).contentBody ?? "";

  const [hierarchy, nav] = await Promise.all([
    buildSubjectHierarchy(examId),
    getUniversalNav({ examSlug: slug }),
  ]);

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
      <div className="mt-6 sm:mt-8 md:mt-10">
        <SubjectCardGrid examSlug={slug} subjects={hierarchy} />
      </div>
      <div className="mt-8 sm:mt-10 md:mt-12">
        <NavigationButtons prev={nav.prev} next={nav.next} />
      </div>
    </>
  );
}
