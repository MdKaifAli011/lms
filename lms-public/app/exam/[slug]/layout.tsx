import { notFound } from "next/navigation";
import { getExamBySlugOrId, getExams } from "@/lib/api";
import { buildSubjectHierarchy } from "@/lib/buildHierarchy";
import { HierarchyShell } from "@/components/HierarchyShell";

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function ExamSlugLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const exam = await getExamBySlugOrId(slug);
  if (!exam || typeof exam !== "object" || !("id" in exam)) notFound();

  const examId = String((exam as { id: string }).id);

  const [hierarchy, examsRaw] = await Promise.all([
    buildSubjectHierarchy(examId),
    getExams(),
  ]);
  const exams = (examsRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (e) => e.status === "Active"
  );

  return (
    <HierarchyShell examSlug={slug} exams={exams} subjects={hierarchy}>
      {children}
    </HierarchyShell>
  );
}
