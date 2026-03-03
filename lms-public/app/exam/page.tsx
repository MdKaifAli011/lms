import type { Metadata } from "next";
import { getExams } from "@/lib/api";
import { ExamPageClient } from "@/components/exam/ExamPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exams | LmsDoors",
  description:
    "Explore exam overviews, syllabus, subjects, and preparation resources. Choose your exam and start learning with LmsDoors.",
  openGraph: {
    title: "Exams | LmsDoors",
    description: "Explore exam overviews and preparation resources on LmsDoors.",
    siteName: "LmsDoors",
  },
};

export default async function ExamListPage() {
  const examsRaw = await getExams();
  const exams = (examsRaw as { id: string; name?: string; slug?: string; status?: string; image?: unknown; orderNumber?: number; seo?: unknown }[]).filter(
    (e) => (e as { status?: string }).status === "Active"
  );

  return <ExamPageClient exams={exams} />;
}
