"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getLevelWisePractices,
  getFullLengthMocksPaginated,
  getExams,
  type LevelWisePractice,
  type FullLengthMock,
} from "@/lib/api";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { GradientBg } from "@/components/ui/gradient-bg";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PracticeTabs } from "@/components/practice/PracticeTabs";
import { PreviousYearPapersSection } from "@/components/practice/PreviousYearPapersSection";
import {
  Clock,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Bot,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/titleCase";

const RECOMMENDED_LIMIT = 6;
const MOCKS_PREVIEW = 3;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

/* Skeleton for loading state — matches PracticeTestCard dimensions to avoid CLS */
function PracticeCardSkeleton() {
  return (
    <div
      className="h-full min-h-[240px] rounded-2xl border border-border bg-card/60 p-4 sm:p-5 md:p-6 animate-pulse motion-reduce:animate-none"
      aria-hidden
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted" />
        <div className="h-5 w-16 sm:w-20 rounded-lg bg-muted" />
      </div>
      <div className="h-5 w-full max-w-[85%] rounded-lg bg-muted mb-2" />
      <div className="h-4 w-full rounded bg-muted/80 mb-1" />
      <div className="h-4 w-[80%] max-w-full rounded bg-muted/80 mb-4 sm:mb-6" />
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="h-4 w-12 rounded bg-muted/80" />
        <div className="h-4 w-14 rounded bg-muted/80" />
      </div>
      <div className="h-10 w-full rounded-xl bg-muted" />
    </div>
  );
}

function EmptySectionCard({ title, description, href, linkLabel }: { title: string; description: string; href: string; linkLabel: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 sm:p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HelpCircle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      <Link href={href}>
        <Button variant="outline" size="sm" className="rounded-xl gap-2">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function PracticeTestCard({ paper }: { paper: LevelWisePractice }) {
  const duration = formatDuration(paper.durationMinutes);
  const displayLabel = paper.subjectName
    ? `${toTitleCase(paper.examName ?? "")} · ${toTitleCase(paper.subjectName)}`
    : toTitleCase(paper.examName ?? "Practice");
  return (
    <Link href={`/practice/${paper.slug}`} className="block h-full group">
      <Card className="h-full rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-border shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-500/40 group-hover:border-blue-500/30">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10">
              <span className="text-xl sm:text-2xl">📝</span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted/70 uppercase tracking-wider text-muted-foreground border border-border/50">
              {displayLabel}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{toTitleCase(paper.title)}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 line-clamp-2">
            {paper.description || "Practice test"}
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {duration}
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {paper.totalQuestions} Qs
            </span>
          </div>
          <Button size="sm" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20">
            Start Test
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function MockTestCardRow({ id, paper }: { id: string; paper: FullLengthMock }) {
  const duration = formatDuration(paper.durationMinutes);
  const locked = paper.locked ?? false;
  return (
    <Card className="rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-border shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/20 overflow-hidden">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className={cn(
                "h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 ring-1 ring-border/50",
                locked ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
              )}
            >
              {id}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{toTitleCase(paper.title)}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {paper.description || "Full-length mock test"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-xl border border-border/50">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" /> {duration}
              </span>
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" /> {paper.totalQuestions} Qs
              </span>
              {paper.difficulty ? (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" /> {paper.difficulty}
                </span>
              ) : null}
            </div>
            {locked ? (
              <Link href={`/mock-tests/${paper.slug}`}>
                <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 sm:px-8 shadow-md shadow-blue-600/20">
                  Unlock & Start
                </Button>
              </Link>
            ) : (
              <Link href={`/mock-tests/${paper.slug}`}>
                <Button size="sm" variant="outline" className="rounded-xl font-semibold text-xs sm:text-sm px-6 sm:px-8 border-2 hover:bg-blue-500/10 hover:border-blue-500/50">
                  Start Test
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PracticePage() {
  const [practicePapers, setPracticePapers] = useState<LevelWisePractice[]>([]);
  const [practiceTotal, setPracticeTotal] = useState(0);
  const [fullLengthPapers, setFullLengthPapers] = useState<FullLengthMock[]>([]);
  const [fullLengthTotal, setFullLengthTotal] = useState(0);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [levelRes, mockRes, examsRes] = await Promise.all([
          getLevelWisePractices({ status: "Active", page: 1, limit: RECOMMENDED_LIMIT }),
          getFullLengthMocksPaginated({ status: "Active", page: 1, limit: MOCKS_PREVIEW }),
          getExams(true),
        ]);
        if (!cancelled) {
          setPracticePapers(levelRes.papers);
          setPracticeTotal(levelRes.total);
          setFullLengthPapers(Array.isArray(mockRes.papers) ? mockRes.papers : []);
          setFullLengthTotal(mockRes.total ?? 0);
          setExams(Array.isArray(examsRes) ? (examsRes as { id: string; name?: string }[]) : []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const examNameById = useMemo(() => {
    const map: Record<string, string> = {};
    exams.forEach((e) => { map[e.id] = toTitleCase(e.name ?? "Exam"); });
    return map;
  }, [exams]);

  const fullLengthPreview = fullLengthPapers;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      <GradientBg
        variant="subtle"
        intensity="low"
        className="relative overflow-x-hidden"
      >
        {/* Dotted grid — same as home page */}
        <div
          className="absolute inset-0 -z-30 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] bg-size-[18px_18px] sm:bg-size-[22px_22px]"
          aria-hidden
        />
        {/* Gradient glows — same as home page */}
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-primary/15 sm:bg-primary/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />
        <div className="absolute top-1/4 right-0 sm:top-1/3 sm:-right-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-primary/10 sm:bg-indigo-500/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-8 sm:pt-10 md:pt-12 pb-6">
       

          {/* Performance Analytics + Weekly Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="lg:col-span-2 rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-border shadow-lg overflow-hidden">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-5 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">
                      Performance Analytics
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track your progress and readiness for your exam.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    LIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50 hover:border-blue-500/20 transition-colors">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Average Score</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums text-foreground">642 <span className="text-xs sm:text-sm font-normal text-muted-foreground">/ 720</span></p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50 hover:border-blue-500/20 transition-colors">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Current Rank</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">#1,240</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50 hover:border-emerald-500/30 transition-colors">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Accuracy</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">92%</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50 hover:border-blue-500/20 transition-colors">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Tests Taken</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">48</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-border shadow-lg flex flex-col justify-between overflow-hidden">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Weekly Growth
                  </h3>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg sm:text-xl">+18.5%</span>
                </div>
                <div className="flex items-end gap-1.5 sm:gap-2 h-24 sm:h-28 mb-2">
                  {[40, 55, 45, 70, 60, 85, 100].map((height, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 rounded-t-md transition-all min-w-0",
                        i === 6 ? "bg-blue-600 dark:bg-blue-500" : "bg-blue-600/40 dark:bg-blue-500/40"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-4">Mon – Sun</p>
                <Button variant="outline" size="sm" className="w-full rounded-xl border-2 text-xs sm:text-sm hover:bg-blue-500/10 hover:border-blue-500/40">
                  View Detailed Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabs — route-based (pill style: blue selected, white bordered unselected) */}
          <section className="rounded-2xl border border-border bg-white/80 dark:bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-3 sm:py-4">
              <PracticeTabs />
            </div>
          </section>
        </div>
      </GradientBg>

      {/* Content — stable min-heights and aria-live for CLS + a11y */}
      <div
        className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 space-y-14 sm:space-y-16 pb-16 sm:pb-20 md:pb-24"
        aria-live="polite"
        aria-busy={loading}
        aria-atomic="true"
      >
        {loading ? (
          <div className="pt-8 space-y-14" role="status" aria-label="Loading practice content">
            <section className="pt-8 min-h-[320px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-primary shrink-0" aria-hidden />
                  <div className="h-8 w-48 sm:w-56 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <PracticeCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section className="min-h-[220px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-primary shrink-0" aria-hidden />
                  <div className="h-8 w-56 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
                </div>
                <div className="h-4 w-36 rounded bg-muted/80 animate-pulse motion-reduce:animate-none" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 sm:h-28 rounded-2xl bg-muted/60 animate-pulse motion-reduce:animate-none border border-border"
                  />
                ))}
              </div>
            </section>
            <section className="min-h-[180px]">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-8 w-1 rounded-full bg-primary shrink-0" aria-hidden />
                <div className="h-8 w-52 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-muted/60 animate-pulse motion-reduce:animate-none border border-border"
                  />
                ))}
              </div>
            </section>
          </div>
        ) : error ? (
          <div
            className="pt-8 rounded-2xl bg-destructive/10 border border-destructive/30 p-6 text-destructive text-sm flex items-center gap-3"
            role="alert"
          >
            <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
            {error}
          </div>
        ) : (
          <>
            {/* Recommended Practice Tests */}
            <section className="pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-primary shrink-0" aria-hidden />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Recommended Practice Tests
                  </h2>
                </div>
                {practiceTotal > RECOMMENDED_LIMIT && (
                  <Link href="/practice/level-wise">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 hover:bg-primary/10 hover:border-primary/40">
                      View all ({practiceTotal}) <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {practicePapers.map((paper) => (
                  <PracticeTestCard key={paper.id} paper={paper} />
                ))}
              </div>
              {practicePapers.length === 0 && (
                <EmptySectionCard
                  title="No practice tests yet"
                  description="Level-wise practice tests will appear here. Check back soon or explore exams."
                  href="/exam"
                  linkLabel="Explore exams"
                />
              )}
            </section>

            {/* Full-Length Mock Tests */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-primary shrink-0" aria-hidden />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Full-Length Mock Tests
                  </h2>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">New tests added regularly</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {fullLengthPreview.map((paper, idx) => (
                  <MockTestCardRow key={paper.id} id={String(idx + 1)} paper={paper} />
                ))}
              </div>
              {fullLengthTotal > MOCKS_PREVIEW && (
                <div className="mt-5">
                  <Link href="/mock-tests">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 hover:bg-primary/10 hover:border-primary/40">
                      View all ({fullLengthTotal}) <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
              {fullLengthPapers.length === 0 && (
                <EmptySectionCard
                  title="No mock tests yet"
                  description="Full-length mock tests will show here when available."
                  href="/practice"
                  linkLabel="Back to Practice"
                />
              )}
            </section>

            <PreviousYearPapersSection />
          </>
        )}

        {/* Floating action buttons */}
        <div className="fixed right-4 sm:right-6 bottom-28 sm:bottom-32 z-40 hidden xl:flex flex-col gap-3" aria-label="Quick actions">
          <button
            type="button"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:hover:scale-100"
            title="Ask AI Tutor"
            aria-label="Ask AI Tutor"
          >
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </button>
          <button
            type="button"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg hover:border-primary/30 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:hover:scale-100"
            title="Take Notes"
            aria-label="Take Notes"
          >
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" aria-hidden />
          </button>
          <button
            type="button"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg hover:border-primary/30 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:hover:scale-100"
            title="Flashcards"
            aria-label="Flashcards"
          >
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" aria-hidden />
          </button>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}
