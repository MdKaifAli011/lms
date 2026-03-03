"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, HelpCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getPracticePaperBySlug } from "@/lib/api";
import type { LevelWisePractice, FullLengthMock, PreviousYearPaper } from "@/lib/api";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function PracticeSlugPage() {
  const params = useParams();
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
  const duration = formatDuration(paper.durationMinutes);
  const typeLabel =
    type === "practice"
      ? "Practice Test"
      : type === "full_length"
        ? "Full-Length Mock"
        : "Previous Year Paper";

  return (
    <PracticeShell title={paper.title} description={typeLabel}>
      <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg max-w-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
            <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted/60">
              {typeLabel}
            </span>
            {"examName" in paper && paper.examName && (
              <span>{paper.examName}</span>
            )}
            {"year" in paper && (
              <span>Year: {paper.year}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{paper.title}</h2>
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
            <Button size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold" asChild>
              <Link href="#">Start Test (Coming soon)</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl" asChild>
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
