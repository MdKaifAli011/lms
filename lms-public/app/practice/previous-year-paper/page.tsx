"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Download, PlayCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getPreviousYearPapers, getExams, type PreviousYearPaper } from "@/lib/api";

const INITIAL_GROUPS = 4;
const LOAD_MORE_GROUPS = 4;

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
    <Link href={`/practice/${paper.slug}`}>
      <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border p-4 text-center hover:shadow-lg hover:border-blue-500/30 transition-all cursor-pointer">
        <CardContent className="p-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mb-0.5">{examName}</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{year}</p>
          <div className="mt-2 sm:mt-3 flex justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Download className="h-4 w-4" />
            <PlayCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PracticePreviousYearPaperPage() {
  const [papers, setPapers] = useState<PreviousYearPaper[]>([]);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_GROUPS);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [list, examsRes] = await Promise.all([
          getPreviousYearPapers({ status: "Active" }),
          getExams(true),
        ]);
        if (!cancelled) {
          setPapers(list);
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
    exams.forEach((e) => { map[e.id] = e.name ?? "Exam"; });
    return map;
  }, [exams]);

  const byYearAndExam = useMemo(() => {
    const map = new Map<string, { year: number; examId: string; examName: string; papers: PreviousYearPaper[] }>();
    papers.forEach((p) => {
      const y = p.year ?? new Date().getFullYear();
      const key = `${y}-${p.examId}`;
      if (!map.has(key)) {
        map.set(key, {
          year: y,
          examId: p.examId,
          examName: p.examName ?? examNameById[p.examId] ?? "Exam",
          papers: [],
        });
      }
      map.get(key)!.papers.push(p);
    });
    return Array.from(map.values()).sort(
      (a, b) => b.year - a.year || a.examName.localeCompare(b.examName)
    );
  }, [papers, examNameById]);

  const visibleGroups = useMemo(
    () => byYearAndExam.slice(0, visibleCount),
    [byYearAndExam, visibleCount]
  );
  const hasMore = visibleCount < byYearAndExam.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + LOAD_MORE_GROUPS);
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <PracticeShell
      title="Previous Year Papers"
      description="Previous year exam papers. Click a card to open. Scroll for more."
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {visibleGroups.map(({ year, examName, papers: groupPapers }) => (
              <div key={`${year}-${examName}`}>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {examName} — {year}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {groupPapers.map((paper) => (
                    <PreviousYearCard
                      key={paper.id}
                      examName={examName}
                      year={year}
                      paper={paper}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6 min-h-[60px]">
              <span className="text-xs text-muted-foreground">Scroll for more</span>
            </div>
          )}
          {byYearAndExam.length === 0 && (
            <p className="text-sm text-muted-foreground">No previous year papers available yet.</p>
          )}
        </>
      )}
    </PracticeShell>
  );
}
