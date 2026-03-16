"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  History,
  Bot,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { cn } from "@/lib/utils";
import { getExams, getPreviousYearPapers, type PreviousYearPaper as ApiPreviousYearPaper } from "@/lib/api";

interface ExamItem {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  orderNumber?: number;
}

interface PreviousYearPaperProps {
  paper: ApiPreviousYearPaper;
}

export default function MaterialsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(true);
  const [previousPapers, setPreviousPapers] = useState<ApiPreviousYearPaper[]>([]);
  const [previousPapersLoading, setPreviousPapersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getExams(true).then((raw) => {
      if (cancelled) return;
      const list = (Array.isArray(raw) ? raw : []) as ExamItem[];
      const active = list.filter((e) => e.status === "Active");
      active.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
      setExams(active);
    }).finally(() => {
      if (!cancelled) setFlashcardsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPreviousYearPapers({ status: "Active" }).then((list) => {
      if (!cancelled) setPreviousPapers(list);
    }).finally(() => {
      if (!cancelled) setPreviousPapersLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filters = [
    { id: "all", label: "All Resources" },
    { id: "biology", label: "Biology" },
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "mathematics", label: "Mathematics" },
    { id: "flashcards", label: "Flashcards" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 pt-10 sm:pt-12 md:pt-14 pb-16">
        <header className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 py-10 text-center sm:text-left">
          <h1 className="text-3xl min-[480px]:text-4xl sm:text-5xl font-serif italic text-foreground mb-3 tracking-tight">
            Study Materials &amp; Archives
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Premium repository of year-wise papers, flashcards by exam & syllabus,
            and AI-assisted revision guides.
          </p>
        </header>

        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeFilter === filter.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                    : "bg-card dark:bg-gray-800 border border-border text-muted-foreground hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 pb-16">
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Flashcards
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse and practice flashcards by exam—from subject level down to definitions.
                </p>
              </div>
              <Link
                href="/exam"
                className="text-primary font-semibold text-sm flex items-center group"
              >
                Browse exams
                <ArrowRight
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                  size={16}
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {flashcardsLoading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading flashcards…
                </div>
              ) : exams.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground rounded-2xl border border-dashed border-border bg-muted/30">
                  No exams available for flashcards yet. Check back later.
                </div>
              ) : (
                exams.map((exam) => (
                  <FlashcardExamCard
                    key={exam.id}
                    name={exam.name ?? "Exam"}
                    slug={exam.slug ?? exam.id}
                  />
                ))
              )}
            </div>
          </section>

          <section className="pb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Year-wise Previous Papers
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Official question papers with verified solutions and video
                  explanations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {previousPapersLoading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading previous papers…
                </div>
              ) : (
                <>
                  {previousPapers.map((paper) => (
                    <PreviousYearPaperCard key={paper.id} paper={paper} />
                  ))}
                  <Link
                    href="/practice/previous-year-paper"
                    className="bg-muted/50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-dashed border-border flex flex-col items-center justify-center hover:bg-card dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <History className="text-muted-foreground mb-2" size={32} />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      More Archives
                    </p>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="fixed right-6 sm:right-8 bottom-28 sm:bottom-8 max-xl:hidden xl:flex flex-col gap-4 z-40">
          <button
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20 hover:scale-110 transition-transform active:scale-95 group relative"
            title="Ask AI Tutor"
            type="button"
          >
            <Bot size={24} />
            <span className="absolute right-full mr-3 bg-foreground text-background text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ask AI Revision Guide
            </span>
          </button>
          <Link
            href="/exam"
            className="w-14 h-14 bg-card border border-border text-foreground rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
            title="Browse exams and flashcards"
          >
            <Sparkles size={24} />
          </Link>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}

function FlashcardExamCard({ name, slug }: { name: string; slug: string }) {
  const href = `/exam/${slug}/flashcards`;
  return (
    <Link href={href} className="block group">
      <div className="h-full bg-card/80 dark:bg-card/60 rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/40 transition-all flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-5 text-primary">
          <BookOpen size={24} aria-hidden />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {name} Flashcards
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
          Practice flashcards by subject, unit, chapter, and topic for {name}.
        </p>
        <span className="inline-flex items-center text-sm font-semibold text-primary">
          Open flashcards
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

function PreviousYearPaperCard({ paper }: PreviousYearPaperProps) {
  const examLabel = paper.examName || "Exam";
  const href = `/practice/${paper.slug}`;
  return (
    <Link href={href} className="block">
      <div className="bg-card/80 dark:bg-gray-800/60 rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all group cursor-pointer h-full flex flex-col">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {examLabel} Paper
        </p>
        <p className="text-3xl font-bold text-foreground mb-4 group-hover:scale-110 transition-transform">
          {paper.year}
        </p>
        {paper.session && (
          <p className="text-xs text-muted-foreground mb-2">{paper.session}</p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center justify-center">
            <Download size={14} className="mr-1" /> PDF
          </span>
          <span className="py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-blue-600 hover:text-white text-xs font-bold uppercase transition-all">
            Mock Test
          </span>
        </div>
      </div>
    </Link>
  );
}
