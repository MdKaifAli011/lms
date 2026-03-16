"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
  Sparkles,
  Settings2,
  LineChart,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getFullLengthMockBySlug,
  getFullLengthMockQuestions,
  type FullLengthMock,
  type FullLengthMockQuestion,
} from "@/lib/api";

const ANSWERS_STORAGE_KEY = (slug: string) => `mock-exam-answers-${slug}`;
const TIMER_STORAGE_KEY = (slug: string) => `mock-exam-timer-${slug}`;

function parseNum(value: string): number | null {
  const n = parseFloat(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function isNumericalCorrect(
  userAnswer: string,
  correctAnswer: string,
  tolerance: number
): boolean {
  const u = parseNum(userAnswer);
  const c = parseNum(correctAnswer);
  if (u === null || c === null) return false;
  return Math.abs(u - c) <= tolerance;
}

export default function MockTestResultPage({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.testSlug;

  const [mock, setMock] = useState<FullLengthMock | null>(null);
  const [questions, setQuestions] = useState<FullLengthMockQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getFullLengthMockBySlug(slug),
      getFullLengthMockQuestions(slug),
    ])
      .then(([mockData, questionsList]) => {
        if (cancelled) return;
        setMock(mockData ?? null);
        setQuestions(Array.isArray(questionsList) ? questionsList : []);
        if (!mockData) setError("Mock test not found");
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const ansRaw = sessionStorage.getItem(ANSWERS_STORAGE_KEY(slug));
    if (ansRaw) {
      try {
        const parsed = JSON.parse(ansRaw) as Record<string, string>;
        setAnswers(typeof parsed === "object" && parsed !== null ? parsed : {});
      } catch {
        /* ignore */
      }
    }
    const totalSec = (mock?.durationMinutes ?? 0) * 60;
    const stored = sessionStorage.getItem(TIMER_STORAGE_KEY(slug));
    const remaining = stored != null ? parseInt(stored, 10) : totalSec;
    const spent = Number.isFinite(remaining) ? Math.max(0, totalSec - remaining) : 0;
    setTimeSpentSeconds(spent);
  }, [slug, mock?.durationMinutes]);

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    const bySubject: Record<string, { correct: number; incorrect: number; total: number }> = {};
    for (const q of questions) {
      const sub = (q.subject ?? "Other").trim() || "Other";
      if (!bySubject[sub]) bySubject[sub] = { correct: 0, incorrect: 0, total: 0 };
      bySubject[sub].total += 1;
      const userAns = (answers[q.id] ?? "").trim();
      if (!userAns) {
        bySubject[sub].incorrect += 1;
        incorrect += 1;
        continue;
      }
      if (q.type === "MCQ") {
        const userIndex = parseInt(userAns, 10);
        const right =
          Number.isFinite(userIndex) && userIndex === q.correctOptionIndex;
        if (right) {
          correct += 1;
          bySubject[sub].correct += 1;
        } else {
          incorrect += 1;
          bySubject[sub].incorrect += 1;
        }
      } else {
        const right = isNumericalCorrect(
          userAns,
          q.numericalAnswer ?? "",
          q.numericalTolerance ?? 0
        );
        if (right) {
          correct += 1;
          bySubject[sub].correct += 1;
        } else {
          incorrect += 1;
          bySubject[sub].incorrect += 1;
        }
      }
    }
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, incorrect, total, accuracy, bySubject };
  }, [questions, answers]);

  const timePerSubject = useMemo(() => {
    const totalQ = questions.length;
    if (totalQ === 0 || timeSpentSeconds <= 0) return [];
    const subjectTotals: Record<string, number> = {};
    for (const q of questions) {
      const sub = (q.subject ?? "Other").trim() || "Other";
      subjectTotals[sub] = (subjectTotals[sub] ?? 0) + 1;
    }
    const maxCount = Math.max(...Object.values(subjectTotals), 1);
    return Object.entries(subjectTotals)
      .map(([name, count]) => ({
        name,
        seconds: Math.round((timeSpentSeconds * count) / totalQ),
      }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [questions, timeSpentSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 selection:bg-primary/30">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Loading results…</p>
        </div>
      </main>
    );
  }

  if (error || !mock) {
    return (
      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 selection:bg-primary/30">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <h1 className="text-xl font-bold text-foreground">Results unavailable</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            {error ?? "Mock test not found. You may need to submit the test again from the exam page."}
          </p>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity"
          >
            Back to Mock Tests
          </Link>
        </div>
      </main>
    );
  }

  const mockTitle = mock.title || "Mock Test";

  return (
    <div className="min-h-0 flex flex-col bg-background text-foreground selection:bg-primary/30">
      <main className="flex-1 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14">
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
          {/* Success confirmation – match hub hero styling */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-primary" aria-hidden />
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3">
              Submitted
            </span>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" aria-hidden />
            </div>
            <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Test Submitted Successfully
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Great job! You&apos;ve completed the{" "}
              <Link
                href={`/mock-tests/${slug}`}
                className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                {mockTitle}
              </Link>
              . Your preliminary results are calculated based on current answer keys.
            </p>
          </section>

          {/* Performance metrics – match hub card styling */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Card className="rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
              <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Correct (Est.)
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400">{stats.correct}</span>
                  <span className="text-muted-foreground font-normal text-base ml-1">/ {stats.total}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
              <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Incorrect (Est.)
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  <span className="text-rose-600 dark:text-rose-400">{stats.incorrect}</span>
                  <span className="text-muted-foreground font-normal text-base ml-1">/ {stats.total}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
              <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Accuracy %
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary">{stats.accuracy}%</p>
              </CardContent>
            </Card>
          </section>

          {/* Time spent per subject */}
          {timePerSubject.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <BarChart3 className="w-5 h-5 text-primary shrink-0" aria-hidden />
                Time Spent per Subject
              </h2>
              <Card className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {timePerSubject.map((s, i) => (
                      <span
                        key={s.name}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary/80"
                          style={{
                            opacity: 1 - i * 0.2,
                          }}
                          aria-hidden
                        />
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {timePerSubject.map((s, i) => {
                      const maxSec = timePerSubject[0]?.seconds ?? 1;
                      const pct = maxSec > 0 ? (s.seconds / maxSec) * 100 : 0;
                      return (
                        <div key={s.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <span className="text-muted-foreground tabular-nums">{formatTime(s.seconds)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Action buttons – match hub primary button */}
          <section className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/mock-tests/${slug}#analysis`}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <LineChart className="w-4 h-4 shrink-0" aria-hidden />
              Analyze My Performance
            </Link>
            <Link
              href="/mock-tests"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base border border-border bg-background text-foreground hover:bg-muted/50 hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden />
              Back to Mock Tests
            </Link>
          </section>

          {/* Insights cards – match hub card styling */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Card className="rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
              <CardContent className="p-4 sm:p-5 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                  <Settings2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    Your performance in{" "}
                    <span className="font-semibold">{timePerSubject[0]?.name ?? "this test"}</span> was
                    significantly faster than average. Consider reviewing the accuracy for these questions.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
              <CardContent className="p-4 sm:p-5 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    Our AI recommends focusing on{" "}
                    <span className="font-semibold">
                      {Object.keys(stats.bySubject).sort((a, b) => {
                        const ac = stats.bySubject[a];
                        const bc = stats.bySubject[b];
                        return (ac?.incorrect ?? 0) - (bc?.incorrect ?? 0);
                      })[0] ?? "weak areas"}
                    </span>{" "}
                    for your next study session based on your response pattern.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-background mt-auto">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-4">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
            Powered by LMS Doors Intelligent Analytics
          </p>
        </div>
      </footer>
    </div>
  );
}
