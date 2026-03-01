import { getExams } from "@/lib/api";

export const dynamic = "force-dynamic";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import {
  HeroSection,
  AllExamsSection,
  MasteryPathSection,
  FeaturesSection,
  CTASection,
  FooterComponent,
} from "@/components/home";

export default async function HomePage() {
  const examsRaw = await getExams();
  const exams = (examsRaw as { id: string; name?: string; slug?: string; status?: string }[]).filter(
    (e) => e.status === "Active"
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ExamCategoriesBar exams={exams} />
      <div className="h-[80px]" />
      <HeroSection />
      <AllExamsSection exams={exams} />
      <MasteryPathSection />
      <FeaturesSection />
      <CTASection />
      <FooterComponent />
    </div>
  );
}
