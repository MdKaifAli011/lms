"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  PlayCircle,
  History,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  getPreviousYearPapersPaginated,
  getExams,
  type PreviousYearPaper,
} from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";

const PREVIEW_LIMIT = 5;

function PreviousYearCard({
  examName,
  year,
  paper,
}: {
  examName: string;
  year: number;
  paper: PreviousYearPaper;
}) {
  return (
    <Link href={`/practice/${paper.slug}`} className="block group">
      <Card className="rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-border p-4 text-center shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 hover:border-blue-500/40 cursor-pointer">
        <CardContent className="p-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mb-0.5 tracking-wider">
            {toTitleCase(examName)}
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {year}
          </p>
          <div className="mt-2 sm:mt-3 flex justify-center gap-2 text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
            <Download className="h-4 w-4" />
            <PlayCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArchivedCard() {
  return (
    <Link href="/practice/previous-year-paper" className="block group">
      <Card className="rounded-2xl bg-muted/20 dark:bg-muted/10 backdrop-blur-xl border border-dashed border-border p-4 text-center shadow-md transition-all duration-300 hover:shadow-lg hover:border-muted-foreground/40 cursor-pointer">
        <CardContent className="p-0">
          <p
            className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mb-0.5 tracking-wider invisible select-none"
            aria-hidden
          >
            &nbsp;
          </p>
          <div className="flex justify-center items-center min-h-6 sm:min-h-7">
            <History className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground group-hover:text-muted-foreground/90 transition-colors shrink-0" />
          </div>
          <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Archived
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PreviousYearPapersSection() {
  const [papers, setPapers] = useState<PreviousYearPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [prevRes, examsRes] = await Promise.all([
          getPreviousYearPapersPaginated({
            status: "Active",
            page: 1,
            limit: PREVIEW_LIMIT,
          }),
          getExams(true),
        ]);
        if (!cancelled) {
          setPapers(Array.isArray(prevRes.papers) ? prevRes.papers : []);
          setTotal(prevRes.total ?? 0);
          setExams(
            Array.isArray(examsRes)
              ? (examsRes as { id: string; name?: string }[])
              : [],
          );
        }
      } catch {
        if (!cancelled) (setPapers([]), setTotal(0));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const examNameById = useMemo(() => {
    const map: Record<string, string> = {};
    exams.forEach((e) => {
      map[e.id] = toTitleCase(e.name ?? "Exam");
    });
    return map;
  }, [exams]);

  if (loading) {
    return (
      <section className="pb-4">
        <div className="flex items-center gap-3 mb-6">
          <span
            className="h-8 w-1 rounded-full bg-primary shrink-0"
            aria-hidden
          />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Previous Year Papers
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border p-4 h-[88px] sm:h-[96px] bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pb-4">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="h-8 w-1 rounded-full bg-primary shrink-0"
          aria-hidden
        />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Previous Year Papers
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {papers.map((paper) => (
          <PreviousYearCard
            key={paper.id}
            examName={toTitleCase(
              paper.examName ?? examNameById[paper.examId] ?? "Exam",
            )}
            year={paper.year ?? new Date().getFullYear()}
            paper={paper}
          />
        ))}
        {total > PREVIEW_LIMIT && <ArchivedCard />}
      </div>
      {papers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 sm:p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No previous year papers yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Past exam papers will appear here when added.
          </p>
          <Link href="/practice">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              Back to Practice <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
