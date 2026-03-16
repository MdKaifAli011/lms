"use client";

import React, {
  useState,
  use,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Timer,
  User,
  Loader2,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFullLengthMockBySlug,
  getFullLengthMockQuestions,
  type FullLengthMock,
  type FullLengthMockQuestion,
} from "@/lib/api";
import { CalculatorModal } from "@/components/mock-tests/CalculatorModal";

const TIMER_STORAGE_KEY = (slug: string) => `mock-exam-timer-${slug}`;
const ANSWERS_STORAGE_KEY = (slug: string) => `mock-exam-answers-${slug}`;
const VISITED_STORAGE_KEY = (slug: string) => `mock-exam-visited-${slug}`;
const REVIEW_STORAGE_KEY = (slug: string) => `mock-exam-review-${slug}`;
const INDEX_STORAGE_KEY = (slug: string) => `mock-exam-index-${slug}`;
const SUBJECT_STORAGE_KEY = (slug: string) => `mock-exam-subject-${slug}`;
const SECTION_STORAGE_KEY = (slug: string) => `mock-exam-section-${slug}`;

function toDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "text" in value) {
    const t = (value as { text?: unknown }).text;
    return typeof t === "string" ? t : String(t ?? "");
  }
  return String(value);
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

type QuestionStatus = "not_visited" | "current" | "answered" | "review";

export default function MockTestExamPage({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.testSlug;
  const router = useRouter();

  const [mock, setMock] = useState<FullLengthMock | null>(null);
  const [questions, setQuestions] = useState<FullLengthMockQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<"" | "MCQ" | "NVQ">("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Load mock + questions once
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
        const totalSec = mockData?.durationMinutes
          ? mockData.durationMinutes * 60
          : 0;
        const stored = typeof window !== "undefined"
          ? sessionStorage.getItem(TIMER_STORAGE_KEY(slug))
          : null;
        const initial = stored != null ? parseInt(stored, 10) : totalSec;
        setTimerSeconds(Number.isFinite(initial) ? Math.max(0, initial) : totalSec);
        const ansRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(ANSWERS_STORAGE_KEY(slug))
          : null;
        if (ansRaw) {
          try {
            const parsed = JSON.parse(ansRaw) as Record<string, string>;
            setAnswers(typeof parsed === "object" && parsed !== null ? parsed : {});
          } catch {
            /* ignore */
          }
        }
        const visRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(VISITED_STORAGE_KEY(slug))
          : null;
        if (visRaw) {
          try {
            const arr = JSON.parse(visRaw) as string[];
            setVisited(Array.isArray(arr) ? new Set(arr) : new Set());
          } catch {
            /* ignore */
          }
        }
        const revRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(REVIEW_STORAGE_KEY(slug))
          : null;
        if (revRaw) {
          try {
            const arr = JSON.parse(revRaw) as string[];
            setMarkedForReview(Array.isArray(arr) ? new Set(arr) : new Set());
          } catch {
            /* ignore */
          }
        }
        const idxRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(INDEX_STORAGE_KEY(slug))
          : null;
        if (idxRaw != null) {
          const idx = parseInt(idxRaw, 10);
          if (Number.isFinite(idx) && idx >= 0) setCurrentIndex(idx);
        }
        const subjRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(SUBJECT_STORAGE_KEY(slug))
          : null;
        if (subjRaw != null) setSubjectFilter(subjRaw);
        const secRaw = typeof window !== "undefined"
          ? sessionStorage.getItem(SECTION_STORAGE_KEY(slug))
          : null;
        if (secRaw === "MCQ" || secRaw === "NVQ") setSectionFilter(secRaw);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setMock(null);
          setQuestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Timer tick and persist
  useEffect(() => {
    if (timerSeconds === null) return;
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((t) => {
        const prev = t ?? 0;
        const next = Math.max(0, prev - 1);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(TIMER_STORAGE_KEY(slug), String(next));
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    };
  }, [slug, timerSeconds === null]);

  // Persist answers, visited, review, index, subject
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(ANSWERS_STORAGE_KEY(slug), JSON.stringify(answers));
  }, [slug, answers]);
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(VISITED_STORAGE_KEY(slug), JSON.stringify([...visited]));
  }, [slug, visited]);
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(REVIEW_STORAGE_KEY(slug), JSON.stringify([...markedForReview]));
  }, [slug, markedForReview]);
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(INDEX_STORAGE_KEY(slug), String(currentIndex));
  }, [slug, currentIndex]);
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(SUBJECT_STORAGE_KEY(slug), subjectFilter);
  }, [slug, subjectFilter]);
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    sessionStorage.setItem(SECTION_STORAGE_KEY(slug), sectionFilter);
  }, [slug, sectionFilter]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const s = (q.subject ?? "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let list = questions;
    if (subjectFilter.trim()) {
      const lower = subjectFilter.trim().toLowerCase();
      list = list.filter(
        (q) => (q.subject ?? "").trim().toLowerCase() === lower
      );
    }
    if (sectionFilter === "MCQ" || sectionFilter === "NVQ") {
      list = list.filter((q) => q.type === sectionFilter);
    }
    return list;
  }, [questions, subjectFilter, sectionFilter]);

  const totalQuestions = filteredQuestions.length;

  // Clamp current index when filtered list shrinks (e.g. subject/section change)
  useEffect(() => {
    if (totalQuestions > 0 && currentIndex >= totalQuestions) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [totalQuestions, currentIndex]);
  const safeIndex = Math.min(
    Math.max(0, currentIndex),
    totalQuestions > 0 ? totalQuestions - 1 : 0
  );
  const currentQ = totalQuestions > 0 ? filteredQuestions[safeIndex] : null;
  const displayNumber = currentQ?.orderNumber ?? safeIndex + 1;

  const setAnswerFor = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const currentAnswer = currentQ ? (answers[currentQ.id] ?? "") : "";

  const getStatus = useCallback(
    (q: FullLengthMockQuestion): QuestionStatus => {
      if (q.id === currentQ?.id) return "current";
      if (markedForReview.has(q.id)) return "review";
      const hasAnswer = (answers[q.id] ?? "").trim() !== "";
      if (visited.has(q.id) || hasAnswer) return "answered";
      return "not_visited";
    },
    [currentQ?.id, markedForReview, visited, answers]
  );

  const answeredCount = useMemo(
    () => filteredQuestions.filter((q) => (answers[q.id] ?? "").trim() !== "").length,
    [filteredQuestions, answers]
  );
  const reviewCount = useMemo(
    () => filteredQuestions.filter((q) => markedForReview.has(q.id)).length,
    [filteredQuestions, markedForReview]
  );

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [totalQuestions]);
  const markForReviewAndNext = useCallback(() => {
    if (currentQ) {
      setMarkedForReview((s) => new Set(s).add(currentQ.id));
      setVisited((s) => new Set(s).add(currentQ.id));
    }
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [currentQ, totalQuestions]);
  const clearResponse = useCallback(() => {
    if (currentQ) setAnswerFor(currentQ.id, "");
  }, [currentQ, setAnswerFor]);
  const saveAndNext = useCallback(() => {
    if (currentQ) setVisited((s) => new Set(s).add(currentQ.id));
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [currentQ, totalQuestions]);

  const handleSubmitTest = useCallback(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(ANSWERS_STORAGE_KEY(slug), JSON.stringify(answers));
    sessionStorage.setItem(VISITED_STORAGE_KEY(slug), JSON.stringify([...visited]));
    sessionStorage.setItem(REVIEW_STORAGE_KEY(slug), JSON.stringify([...markedForReview]));
    sessionStorage.setItem(INDEX_STORAGE_KEY(slug), String(currentIndex));
    sessionStorage.setItem(SUBJECT_STORAGE_KEY(slug), subjectFilter);
    sessionStorage.setItem(SECTION_STORAGE_KEY(slug), sectionFilter);
    router.push(`/mock-tests/${slug}/exam/result`);
  }, [slug, answers, visited, markedForReview, currentIndex, subjectFilter, sectionFilter, router]);

  const handleNumpad = useCallback(
    (key: string) => {
      if (!currentQ) return;
      if (key === "backspace") {
        setAnswerFor(currentQ.id, currentAnswer.slice(0, -1));
      } else {
        setAnswerFor(currentQ.id, currentAnswer + key);
      }
    },
    [currentQ, currentAnswer, setAnswerFor]
  );

  const marksCorrect = currentQ?.marksCorrect ?? mock?.totalQuestions
    ? Math.round((mock?.totalMarks ?? 0) / (mock?.totalQuestions ?? 1))
    : 4;
  const marksIncorrect = currentQ?.marksIncorrect ?? 1;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background text-foreground flex flex-col items-center justify-center gap-5 p-6">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">Loading question paper...</p>
        <p className="text-xs text-muted-foreground">Preparing your exam environment</p>
      </div>
    );
  }

  if (error || !mock) {
    return (
      <div className="fixed inset-0 bg-background text-foreground flex flex-col items-center justify-center gap-6 p-6">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-foreground text-center">Mock test not found</h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {error ?? "This test may have been removed or the link is invalid."}
        </p>
        <Link
          href="/mock-tests"
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-opacity"
        >
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  const examTitle = mock.title || "Mock Test";
  const examSubtitle = mock.examName ?? "Mock Test Environment";

  return (
    <div
      className="fixed inset-0 bg-muted/20 dark:bg-background text-foreground antialiased flex flex-col overflow-hidden font-[family-name:var(--font-lexend),var(--font-sans),sans-serif]"
      style={{ fontFamily: "var(--font-lexend), var(--font-sans), sans-serif" }}
    >
      <header className="sticky top-0 z-20 flex h-12 flex-wrap items-center justify-between gap-3 border-b border-border bg-card dark:bg-card/95 backdrop-blur-sm px-4 sm:px-6 py-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/apple-touch-icon.png"
              alt=""
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight truncate">
              {examTitle}
            </h1>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest truncate mt-0.5">
              {examSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0 overflow-x-auto py-0.5 scrollbar-thin">
          {subjects.length > 0 && (
            <nav
              className="flex gap-1.5 bg-muted p-1 rounded-lg shrink-0"
              aria-label="Subject filter"
            >
              <button
                type="button"
                onClick={() => setSubjectFilter("")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                  !subjectFilter
                    ? "bg-background text-primary shadow-sm dark:bg-background dark:text-primary"
                    : "text-muted-foreground hover:text-primary font-medium"
                )}
              >
                All
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubjectFilter(s)}
className={cn(
                  "px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                  subjectFilter.trim().toLowerCase() === s.trim().toLowerCase()
                      ? "bg-background text-primary shadow-sm dark:bg-background dark:text-primary"
                      : "text-muted-foreground hover:text-primary font-medium"
                  )}
                >
                  {s}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 px-3 py-1 rounded-lg text-primary font-bold min-w-24 justify-center">
            <Timer className="w-3 h-3 shrink-0" aria-hidden />
            <span className="text-xs tabular-nums">{formatTime(timerSeconds ?? 0)}</span>
          </div>
          <div className="h-5 w-px bg-border shrink-0" aria-hidden />
          <button
            type="button"
            onClick={() => setCalculatorOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Open calculator"
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="sticky z-10 top-12 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 py-2 shadow-sm shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 leading-none">
              Section:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSectionFilter("")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-bold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 leading-none",
                  !sectionFilter
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSectionFilter("MCQ")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-bold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 leading-none",
                  sectionFilter === "MCQ"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary"
                )}
              >
                Section A (MCQs)
              </button>
              <button
                type="button"
                onClick={() => setSectionFilter("NVQ")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-bold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 leading-none",
                  sectionFilter === "NVQ"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary"
                )}
              >
                Section B (NVQ)
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800 leading-tight">
            +{marksCorrect} Correct
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-800 leading-tight">
            -{marksIncorrect} Incorrect
          </span>
        </div>
      </div>

      <main className="flex flex-1 min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-muted/10 dark:bg-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: question progress */}
            {totalQuestions > 0 && currentQ && (
              <div className="lg:hidden flex items-center justify-between gap-3 mb-4 py-2 px-3 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Question {displayNumber}
                  {totalQuestions !== questions.length && (
                    <span className="font-medium normal-case text-muted-foreground ml-1">
                      · {safeIndex + 1} of {totalQuestions}
                    </span>
                  )}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safeIndex <= 0}
                    className="p-2 rounded-lg border border-border bg-background disabled:opacity-50 disabled:pointer-events-none hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Previous question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={safeIndex >= totalQuestions - 1}
                    className="p-2 rounded-lg border border-border bg-background disabled:opacity-50 disabled:pointer-events-none hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Next question"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {totalQuestions === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 dark:bg-muted/20 p-10 sm:p-12 text-center">
                <p className="text-foreground font-semibold">No questions in this test yet.</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Questions have not been added to this mock test. Return to the instructions page.
                </p>
                <Link
                  href={`/mock-tests/${slug}`}
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-opacity"
                >
                  Back to instructions
                </Link>
              </div>
            ) : currentQ ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase shrink-0">
                      Question {displayNumber}
                    </span>
                    {currentQ.subject && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 dark:bg-muted/30 px-2.5 py-1 rounded-md">
                        {currentQ.subject}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{marksCorrect} Marks
                    </span>
                    <span className="text-muted-foreground/80" aria-hidden>|</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      -{marksIncorrect} Negative
                    </span>
                  </div>
                </div>

                <h2
                  className="text-xl font-medium leading-relaxed text-foreground whitespace-pre-wrap"
                  role="article"
                >
                  {toDisplayText(currentQ.questionText)}
                </h2>

                {currentQ.type === "NVQ" && (currentQ.imageUrl ?? "").trim() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start pt-3">
                    <div className="rounded-xl border border-border bg-card dark:bg-card/80 p-4 shadow-sm min-w-0">
                      <div className="aspect-video w-full rounded-lg bg-muted/30 dark:bg-muted/20 flex flex-col items-center justify-center border border-border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(currentQ.imageUrl ?? "").trim()}
                          alt={(currentQ.imageCaption ?? "").trim() || "Question diagram"}
                          className="w-full h-full object-contain p-4"
                          loading="lazy"
                        />
                      </div>
                      {(currentQ.imageCaption ?? "").trim() && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-2 text-center">
                          {toDisplayText(currentQ.imageCaption)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4 min-w-0 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Your Answer
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={currentAnswer}
                            onChange={(e) => setAnswerFor(currentQ.id, e.target.value)}
                            placeholder="Enter numerical value"
                            className="w-full h-12 pl-4 pr-20 text-xl font-bold bg-background border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                            {(currentQ.numericalUnit ?? "").trim() || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 dark:bg-muted/30 p-3 rounded-lg border border-border">
                        <div className="grid grid-cols-3 gap-1.5">
                          {NUMPAD_KEYS.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleNumpad(key)}
                              className={cn(
                                "flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-base font-bold text-foreground shadow-sm transition-all hover:bg-muted active:bg-muted/80 active:scale-[0.98]",
                                key === "backspace" && "text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
                              )}
                            >
                              {key === "backspace" ? "⌫" : key}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnswerFor(currentQ.id, "")}
                          className="w-full mt-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          Clear Entry
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentQ.type === "MCQ" && (currentQ.imageUrl ?? "").trim() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start pt-3">
                    <div className="rounded-xl border border-border bg-card dark:bg-card/80 p-4 shadow-sm min-w-0">
                      <div className="aspect-video w-full rounded-lg bg-muted/30 dark:bg-muted/20 flex flex-col items-center justify-center border border-border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(currentQ.imageUrl ?? "").trim()}
                          alt={(currentQ.imageCaption ?? "").trim() || "Question diagram"}
                          className="w-full h-full object-contain p-4"
                          loading="lazy"
                        />
                      </div>
                      {(currentQ.imageCaption ?? "").trim() && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-2 text-center">
                          {toDisplayText(currentQ.imageCaption)}
                        </p>
                      )}
                    </div>
                    <fieldset className="space-y-2 pt-0 min-w-0 max-w-md">
                      <legend className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider sr-only">
                        Choose one option
                      </legend>
                      {(currentQ.options ?? []).map((opt, i) => {
                        const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
                        const isSelected =
                          (answers[currentQ.id] ?? "").trim() === String(i);
                        return (
                          <label
                            key={i}
                            className={cn(
                              "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                              isSelected
                                ? "border-primary bg-primary/10 dark:bg-primary/15"
                                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                            )}
                          >
                            <input
                              type="radio"
                              name={`q-${currentQ.id}`}
                              value={i}
                              checked={isSelected}
                              onChange={() => setAnswerFor(currentQ.id, String(i))}
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-muted text-muted-foreground"
                              )}
                            >
                              {letter}
                            </span>
                            <span className="min-w-0 flex-1 text-sm sm:text-base text-foreground leading-snug">
                              {toDisplayText(opt)}
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                  </div>
                ) : currentQ.type === "MCQ" && (
                  <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-w-2xl">
                    <legend className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider sr-only">
                      Choose one option
                    </legend>
                    {(currentQ.options ?? []).map((opt, i) => {
                      const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
                      const isSelected =
                        (answers[currentQ.id] ?? "").trim() === String(i);
                      return (
                        <label
                          key={i}
                          className={cn(
                            "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                            isSelected
                              ? "border-primary bg-primary/10 dark:bg-primary/15"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQ.id}`}
                            value={i}
                            checked={isSelected}
                            onChange={() => setAnswerFor(currentQ.id, String(i))}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            {letter}
                          </span>
                          <span className="min-w-0 flex-1 text-sm sm:text-base text-foreground leading-snug">
                            {toDisplayText(opt)}
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                )}

                {currentQ.type === "NVQ" && !(currentQ.imageUrl ?? "").trim() && (
                  <div className="pt-3 max-w-md">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Your Answer
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={currentAnswer}
                            onChange={(e) => setAnswerFor(currentQ.id, e.target.value)}
                            placeholder="Enter numerical value"
                            className="w-full h-12 pl-4 pr-20 text-xl font-bold bg-background border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                            {(currentQ.numericalUnit ?? "").trim() || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 dark:bg-muted/30 p-3 rounded-lg border border-border">
                        <div className="grid grid-cols-3 gap-1.5">
                          {NUMPAD_KEYS.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleNumpad(key)}
                              className={cn(
                                "flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-base font-bold text-foreground shadow-sm transition-all hover:bg-muted active:bg-muted/80 active:scale-[0.98]",
                                key === "backspace" && "text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
                              )}
                            >
                              {key === "backspace" ? "⌫" : key}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnswerFor(currentQ.id, "")}
                          className="w-full mt-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          Clear Entry
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="hidden lg:flex w-80 flex-col border-l border-primary/10 dark:border-border bg-card/80 dark:bg-card/70 backdrop-blur-xl p-4 shrink-0 z-10 [background:rgba(255,255,255,0.85)] dark:[background:rgba(15,23,42,0.85)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-foreground truncate">Candidate</h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase truncate mt-0.5">
                ID: {mock.mockId?.trim() || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-background dark:bg-background/80 p-3 rounded-lg border border-border shadow-sm">
              <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Answered</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {String(answeredCount).padStart(2, "0")}{" "}
                <span className="text-xs font-medium text-muted-foreground">/ {totalQuestions}</span>
              </p>
            </div>
            <div className="bg-background dark:bg-background/80 p-3 rounded-lg border border-border shadow-sm">
              <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Review</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {String(reviewCount).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <h5 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
              Question Palette
              <span className="flex-1 h-px bg-border min-w-0" aria-hidden />
            </h5>
          </div>

          <div className="grid grid-cols-5 gap-2 overflow-y-auto mb-5 pr-1 max-h-48 min-h-[100px] exam-palette-scrollbar">
            {filteredQuestions.map((q, idx) => {
              const status = getStatus(q);
              const num = q.orderNumber ?? idx + 1;
              const numStr = String(num).padStart(2, "0");
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  title={`Go to question ${num}`}
                  className={cn(
                    "h-9 w-9 min-w-9 rounded-sm text-xs font-bold flex items-center justify-center transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 shrink-0",
                    status === "current" &&
                      "border-2 border-primary ring-2 ring-primary/25 bg-background text-primary shadow-sm",
                    status === "answered" &&
                      "border-emerald-200 dark:border-emerald-600 bg-emerald-600 dark:bg-emerald-500 text-white",
                    status === "review" &&
                      "border-amber-200 dark:border-amber-600 bg-amber-500 dark:bg-amber-500 text-white",
                    status === "not_visited" &&
                      "border-border bg-background dark:bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted font-medium"
                  )}
                >
                  {numStr}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-5 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500 shrink-0 border border-emerald-200 dark:border-emerald-600" aria-hidden /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-muted dark:bg-muted-foreground/40 shrink-0 border border-border" aria-hidden /> Not Visited
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-500 shrink-0 border border-amber-200 dark:border-amber-600" aria-hidden /> Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm border-2 border-primary bg-background shrink-0" aria-hidden /> Current
              </div>
            </div>
            <Link
              href={`/mock-tests/${slug}`}
              className="block w-full py-3 rounded-xl border-2 border-primary text-primary font-bold text-xs hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors text-center"
            >
              Full Question Paper
            </Link>
            <button
              type="button"
              onClick={handleSubmitTest}
              className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all text-center"
            >
              Submit Test
            </button>
          </div>
        </aside>
      </main>

      <footer className="min-h-18 border-t border-border bg-card px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.2)] shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex <= 0}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl border border-border font-bold text-sm text-foreground bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={markForReviewAndNext}
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl border border-border font-bold text-sm text-foreground bg-background hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Mark for Review & Next
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={clearResponse}
            className="px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Clear Response
          </button>
          <button
            type="button"
            onClick={saveAndNext}
            className="flex items-center gap-2 px-6 sm:px-10 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Save & Next
            <ChevronRight className="w-5 h-5 shrink-0" aria-hidden />
          </button>
        </div>
      </footer>

      <CalculatorModal open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
    </div>
  );
}
