import { getExams } from "@/lib/api";
import { ExamPageClient } from "@/components/exam/ExamPageClient";

export const dynamic = "force-dynamic";

export default async function ExamListPage() {
  const examsRaw = await getExams();
  const exams = (examsRaw as { id: string; name?: string; slug?: string; status?: string; image?: unknown; orderNumber?: number; seo?: unknown }[]).filter(
    (e) => (e as { status?: string }).status === "Active"
  );

  return <ExamPageClient exams={exams} />;
}
