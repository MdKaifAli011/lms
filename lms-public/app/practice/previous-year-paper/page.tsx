"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Download, PlayCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getPreviousYearPapersPaginated, getExams, type PreviousYearPaper } from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";

const PAGE_SIZE = 10;

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
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mb-0.5">{toTitleCase(examName)}</p>
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);

  const hasMore = papers.length < total;

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    try {
      const { papers: nextPapers, total: nextTotal } = await getPreviousYearPapersPaginated({
        status: "Active",
        page: pageNum,
        limit: PAGE_SIZE,
      });
      if (append) {
        setPapers((prev) => [...prev, ...nextPapers]);
      } else {
        setPapers(nextPapers);
      }
      setTotal(nextTotal);
      setPage(pageNum);
    } catch (e) {
      if (!append) {
        setPapers([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    } finally {
      setter(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const examsRes = await getExams(true);
      if (!cancelled && Array.isArray(examsRes)) {
        setExams(examsRes as { id: string; name?: string }[]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setError(null);
    loadPage(1, false);
  }, [loadPage]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadPage(page + 1, true);
  };

  const examNameById = useMemo(() => {
    const map: Record<string, string> = {};
    exams.forEach((e) => { map[e.id] = toTitleCase(e.name ?? "Exam"); });
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
          examName: toTitleCase(p.examName ?? examNameById[p.examId] ?? "Exam"),
          papers: [],
        });
      }
      map.get(key)!.papers.push(p);
    });
    return Array.from(map.values()).sort(
      (a, b) => b.year - a.year || a.examName.localeCompare(b.examName)
    );
  }, [papers, examNameById]);

  return (
    <PracticeShell
      title="Previous Year Papers"
      description="Previous year exam papers. Click a card to open. Load more to see all."
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
            {byYearAndExam.map(({ year, examId, examName, papers: groupPapers }) => (
              <div key={`${year}-${examId}`}>
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
          {hasMore && papers.length > 0 && (
            <div className="flex justify-center py-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-primary bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Load more ({papers.length} of {total})</>
                )}
              </button>
            </div>
          )}
          {papers.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No previous year papers available yet.</p>
          )}
        </>
      )}
    </PracticeShell>
  );
}
