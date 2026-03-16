"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, HelpCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { LevelQuiz } from "@/components/LevelQuiz";
import { getPracticePaperBySlug } from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import type { LevelWisePractice, FullLengthMock, PreviousYearPaper } from "@/lib/api";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function PracticeSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [result, setResult] = useState<{
    type: "practice" | "full_length" | "previous_paper";
    paper: LevelWisePractice | FullLengthMock | PreviousYearPaper;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Missing slug");
      return;
    }
    let cancelled = false;
    getPracticePaperBySlug(slug).then((data) => {
      if (!cancelled) {
        setResult(data ?? null);
        setError(data ? null : "Paper not found");
      }
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  // Full-length mock: send user to mock-tests flow to start the test
  useEffect(() => {
    if (!result || result.type !== "full_length") return;
    const mockSlug = (result.paper as FullLengthMock).slug;
    if (mockSlug) router.replace(`/mock-tests/${mockSlug}`);
  }, [result, router]);

  if (loading) {
    return (
      <PracticeShell title="Loading…" description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PracticeShell>
    );
  }

  if (error || !result) {
    return (
      <PracticeShell title="Not found" description="">
        <Card className="bg-card/80 border border-border">
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">{error ?? "This practice paper could not be found."}</p>
            <Link href="/practice">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Practice
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PracticeShell>
    );
  }

  const { type, paper } = result;

  // Level-wise practice: show LevelQuiz (questions + submit → result)
  if (type === "practice") {
    const p = paper as LevelWisePractice;
    return (
      <PracticeShell title={toTitleCase(p.title)} description="Practice Test">
        <LevelQuiz
          level={p.level}
          examId={p.examId}
          examSlug={p.examSlug}
          subjectId={p.subjectId}
          unitId={p.unitId}
          chapterId={p.chapterId}
          topicId={p.topicId}
          subtopicId={p.subtopicId}
          definitionId={p.definitionId}
          title={`Practice quiz – ${toTitleCase(p.title)}`}
          initialPaper={p}
        />
      </PracticeShell>
    );
  }

  // Full-length: redirecting to /mock-tests/[slug]; show brief loading
  if (type === "full_length") {
    return (
      <PracticeShell title="Redirecting…" description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PracticeShell>
    );
  }

  // Previous year paper: simple info card (start test flow TBD)
  const duration = formatDuration(paper.durationMinutes);
  return (
    <PracticeShell title={toTitleCase(paper.title)} description="Previous Year Paper">
      <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg max-w-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
            <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted/60">
              Previous Year Paper
            </span>
            {"examName" in paper && paper.examName && (
              <span>{toTitleCase(paper.examName)}</span>
            )}
            {"year" in paper && (
              <span>Year: {paper.year}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{toTitleCase(paper.title)}</h2>
          {paper.description && (
            <p className="text-muted-foreground text-sm sm:text-base mb-6">{paper.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" /> {duration}
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 shrink-0" /> {paper.totalQuestions} questions
            </span>
            {paper.difficulty && (
              <span>{paper.difficulty}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="default" variant="outline" className="h-11 px-6 text-base rounded-xl" asChild>
              <Link href="/practice" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Practice
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PracticeShell>
  );
}
