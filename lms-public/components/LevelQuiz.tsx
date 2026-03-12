"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  HelpCircle,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getLevelWisePracticesByHierarchy,
  getLevelWisePracticeQuestions,
  type LevelWisePractice,
  type LevelWisePracticeQuestion,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";

const LEVEL_NAMES: Record<number, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

function formatRemainingTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface LevelQuizProps {
  level: number;
  examId: string;
  examSlug?: string;
  subjectId?: string;
  unitId?: string;
  chapterId?: string;
  topicId?: string;
  subtopicId?: string;
  definitionId?: string;
  title?: string;
}

export function LevelQuiz({
  level,
  examId,
  subjectId,
  unitId,
  chapterId,
  topicId,
  subtopicId,
  definitionId,
  title,
}: LevelQuizProps) {
  /** Single paper loaded for current page (1-based). Next/Prev fetch one at a time. */
  const [currentPaper, setCurrentPaper] = useState<LevelWisePractice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);
  const [papersLoading, setPapersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<LevelWisePracticeQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const autoSubmittedRef = useRef(false);
  const [timeUp, setTimeUp] = useState(false);
  /** Timer starts only when the quiz section is in view (user has scrolled to it). */
  const [quizInView, setQuizInView] = useState(false);
  const quizSectionRef = useRef<HTMLElement>(null);

  const levelName = LEVEL_NAMES[level] ?? `Level ${level}`;
  const sectionTitle = title ?? `Practice quiz – ${levelName}`;
  const hasNextPaper = totalPapers > 0 && currentPage < totalPapers;
  const hasPrevPaper = currentPage > 1;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;

  const baseFilters = {
    level,
    examId,
    subjectId,
    unitId,
    chapterId,
    topicId,
    subtopicId,
    definitionId,
    status: "Active" as const,
  };

  // Initial load: fetch first paper only (page=1, limit=1)
  useEffect(() => {
    let cancelled = false;
    setPapersLoading(true);
    setError(null);
    getLevelWisePracticesByHierarchy({
      ...baseFilters,
      page: 1,
      limit: 1,
    })
      .then((res) => {
        if (cancelled) return;
        const list = res.papers ?? [];
        setTotalPapers(res.total ?? 0);
        setCurrentPaper(list[0] ?? null);
        setCurrentPage(1);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load quizzes");
      })
      .finally(() => {
        if (!cancelled) setPapersLoading(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- baseFilters fields are the deps
  }, [level, examId, subjectId, unitId, chapterId, topicId, subtopicId, definitionId]);

  // When we have papers, load questions for the current paper
  const loadQuestionsForCurrentPaper = useCallback(async () => {
    if (!currentPaper) return;
    setQuestionsLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setRemainingSeconds(null);
    autoSubmittedRef.current = false;
    setTimeUp(false);
    setQuizInView(false);
    try {
      const list = await getLevelWisePracticeQuestions(currentPaper.id);
      setQuestions(list);
    } finally {
      setQuestionsLoading(false);
    }
  }, [currentPaper]);

  // Load questions when current paper changes (first load or after Next/Prev paper)
  useEffect(() => {
    if (!currentPaper || papersLoading) return;
    loadQuestionsForCurrentPaper();
  }, [currentPaper, papersLoading, loadQuestionsForCurrentPaper]);

  // When quiz section (questions) is in viewport, start the timer
  useEffect(() => {
    if (submitted || questions.length === 0 || !currentPaper) return;
    const el = quizSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setQuizInView(true);
      },
      { threshold: 0.2, rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPaper, questions.length, submitted]);

  // Start countdown only when quiz is in view (user reached the quiz area)
  useEffect(() => {
    if (!quizInView || !currentPaper || questions.length === 0 || submitted || remainingSeconds !== null) return;
    const total = Math.max(0, currentPaper.durationMinutes * 60);
    setRemainingSeconds(total);
    autoSubmittedRef.current = false;
  }, [quizInView, currentPaper, questions.length, submitted, remainingSeconds]);

  // Tick countdown every second; auto-submit when time reaches 0
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0 || submitted) return;
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds, submitted]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (remainingSeconds !== 0 || submitted || autoSubmittedRef.current || totalQuestions === 0) return;
    autoSubmittedRef.current = true;
    setTimeUp(true);
    handleSubmitRef.current();
  }, [remainingSeconds, submitted, totalQuestions]);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = useCallback(() => {
    if (totalQuestions === 0) return;
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (q.type === "MCQ") {
        const selectedIndex = userAnswer !== undefined && userAnswer !== "" ? parseInt(userAnswer, 10) : -1;
        if (selectedIndex === q.correctOptionIndex) correct++;
      } else {
        const num = parseFloat(userAnswer ?? "");
        const expected = parseFloat(q.numericalAnswer);
        const tol = q.numericalTolerance ?? 0;
        if (!Number.isNaN(num) && !Number.isNaN(expected) && Math.abs(num - expected) <= tol) correct++;
      }
    });
    setScore({ correct, total: totalQuestions });
    setSubmitted(true);
  }, [questions, answers, totalQuestions]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  const goToNextPaper = () => {
    if (!hasNextPaper) return;
    setSubmitted(false);
    setScore(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRemainingSeconds(null);
    setTimeUp(false);
    autoSubmittedRef.current = false;
    setQuizInView(false);
    setPapersLoading(true);
    const nextPage = currentPage + 1;
    getLevelWisePracticesByHierarchy({ ...baseFilters, page: nextPage, limit: 1 })
      .then((res) => {
        const list = res.papers ?? [];
        if (list.length > 0) {
          setCurrentPaper(list[0]);
          setCurrentPage(nextPage);
        } else {
          setTotalPapers(currentPage);
        }
      })
      .finally(() => setPapersLoading(false));
  };

  const goToPrevPaper = () => {
    if (!hasPrevPaper) return;
    setSubmitted(false);
    setScore(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRemainingSeconds(null);
    setTimeUp(false);
    autoSubmittedRef.current = false;
    setQuizInView(false);
    setPapersLoading(true);
    const prevPage = currentPage - 1;
    getLevelWisePracticesByHierarchy({ ...baseFilters, page: prevPage, limit: 1 })
      .then((res) => {
        const list = res.papers ?? [];
        if (list.length > 0) {
          setCurrentPaper(list[0]);
          setCurrentPage(prevPage);
        }
      })
      .finally(() => setPapersLoading(false));
  };

  const retryCurrentPaper = () => {
    loadQuestionsForCurrentPaper();
  };

  if (papersLoading) {
    return (
      <section className="my-8 sm:my-10 min-h-[280px]" aria-label={sectionTitle}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <div className="flex justify-center items-center min-h-[200px] rounded-2xl border border-dashed border-border/60 bg-muted/10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  // No papers: keep a stable slot so layout doesn't shift (avoid CLS)
  if (!papersLoading && (totalPapers === 0 || currentPaper === null)) {
    return (
      <section className="my-8 sm:my-10 min-h-[180px]" aria-label={sectionTitle}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <div className="flex justify-center items-center min-h-[120px] rounded-2xl border border-dashed border-border/60 bg-muted/10">
          <p className="text-sm text-muted-foreground">No practice quizzes for this level yet.</p>
        </div>
      </section>
    );
  }

  // Loading questions for current paper — stable min-height to avoid CLS
  if (questionsLoading) {
    return (
      <section className="my-8 sm:my-10 min-h-[320px]" aria-label={sectionTitle}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <Card className="border border-border bg-card min-h-[260px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {currentPaper ? toTitleCase(currentPaper.title) : "Loading…"}
              </h3>
              {totalPapers > 1 && (
                <span className="text-xs text-muted-foreground">
                  Paper {currentPage} of {totalPapers}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center min-h-[180px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          </CardContent>
        </Card>
      </section>
    );
  }

  // Current paper has no questions — try next paper or show message (stable height)
  if (currentPaper && questions.length === 0) {
    return (
      <section className="my-8 sm:my-10 min-h-[280px]" aria-label={sectionTitle}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <Card className="border border-border bg-card min-h-[200px]">
          <CardContent className="py-8 text-center flex flex-col justify-center min-h-[160px]">
            <p className="text-sm text-muted-foreground mb-4">
              This paper has no questions yet.
            </p>
            {hasNextPaper ? (
              <Button onClick={goToNextPaper} className="gap-2">
                Next paper <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">No more papers.</p>
            )}
          </CardContent>
        </Card>
      </section>
    );
  }

  // Submitted: show score and Next paper / Retry
  if (submitted && score !== null) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <section className="my-8 sm:my-10" aria-label={sectionTitle}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <Card className="border border-border bg-card overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {timeUp ? "Time's up!" : "Quiz complete"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {currentPaper && toTitleCase(currentPaper.title)}
              </p>
              <div className="flex items-center gap-4 text-2xl font-bold">
                <span className="text-green-600 dark:text-green-400">{score.correct} / {score.total}</span>
                <span className="text-muted-foreground">({pct}%)</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {hasPrevPaper && (
                <Button variant="outline" onClick={goToPrevPaper} className="gap-2">
                  <ChevronLeft className="h-4 w-4" /> Previous quiz
                </Button>
              )}
              <Button variant="outline" onClick={retryCurrentPaper} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Retry this quiz
              </Button>
              {hasNextPaper ? (
                <Button onClick={goToNextPaper} className="gap-2">
                  Next quiz <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-4 py-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" /> All quizzes completed
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Active quiz: one question at a time. Timer starts when this section is in view.
  return (
    <section ref={quizSectionRef} className="my-8 sm:my-10" aria-label={sectionTitle}>
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        {sectionTitle}
      </h2>
      <Card className="border border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/30 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {currentPaper ? toTitleCase(currentPaper.title) : ""}
            </h3>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
              {currentPaper && (
                <>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> {currentPaper.totalQuestions} questions
                  </span>
                  {(remainingSeconds !== null || currentPaper.durationMinutes > 0) && (
                    <span
                      className={`flex items-center gap-1.5 font-mono font-semibold tabular-nums ${
                        remainingSeconds !== null && remainingSeconds <= 60 ? "text-red-600 dark:text-red-400" : "text-foreground"
                      }`}
                      aria-live="polite"
                    >
                      <Clock className="h-4 w-4 shrink-0" />
                      {remainingSeconds !== null
                        ? formatRemainingTime(remainingSeconds)
                        : formatRemainingTime(currentPaper.durationMinutes * 60)}
                    </span>
                  )}
                </>
              )}
              {totalPapers > 1 && (
                <span>Paper {currentPage} of {totalPapers}</span>
              )}
            </div>
          </div>
          {/* Progress dots */}
          {totalQuestions > 1 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentQuestionIndex
                      ? "w-6 bg-primary"
                      : answers[questions[i].id] !== undefined && answers[questions[i].id] !== ""
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {currentQuestion && (
            <>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                <p className="text-foreground font-medium">{currentQuestion.questionText}</p>
              </div>
              {currentQuestion.type === "MCQ" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {(currentQuestion.options ?? []).map((opt, idx) => {
                    const qId = currentQuestion.id;
                    const val = String(idx);
                    const isSelected = answers[qId] === val;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswer(qId, val)}
                        className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-medium opacity-80">{(idx + 1).toString()}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Your answer (numerical)</label>
                  <input
                    type="number"
                    step="any"
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter value"
                  />
                  {currentQuestion.numericalUnit && (
                    <p className="text-xs text-muted-foreground mt-1">Unit: {currentQuestion.numericalUnit}</p>
                  )}
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              disabled={isFirstQuestion}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {isLastQuestion ? (
              <Button onClick={handleSubmit} className="gap-1">
                Submit quiz <CheckCircle2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
