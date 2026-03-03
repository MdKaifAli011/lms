"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Clock, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getLevelWisePractices, type LevelWisePractice } from "@/lib/api";

const LOAD_MORE_LIMIT = 10;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

function PracticeTestCard({ paper }: { paper: LevelWisePractice }) {
  const duration = formatDuration(paper.durationMinutes);
  const displayLabel = paper.subjectName
    ? `${paper.examName ?? ""} · ${paper.subjectName}`
    : (paper.examName ?? "Practice");
  return (
    <Link href={`/practice/${paper.slug}`}>
      <Card className="h-full bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer hover:border-blue-500/30">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <span className="text-xl sm:text-2xl">📝</span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/60 uppercase tracking-wider text-muted-foreground">
              {displayLabel}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-foreground">{paper.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 line-clamp-2">
            {paper.description || "Practice test"}
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {duration}
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {paper.totalQuestions} Qs
            </span>
          </div>
          <Button size="sm" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold">
            Start Test
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PracticeLevelWisePage() {
  const [papers, setPapers] = useState<LevelWisePractice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const hasMore = papers.length < total;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getLevelWisePractices({ status: "Active", page: 1, limit: LOAD_MORE_LIMIT });
        if (!cancelled) {
          setPapers(res.papers);
          setTotal(res.total);
          setPage(1);
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

  const loadMore = useCallback(async () => {
    if (loadingMore || papers.length >= total) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getLevelWisePractices({
        status: "Active",
        page: nextPage,
        limit: LOAD_MORE_LIMIT,
      });
      if (res.papers.length > 0) {
        setPapers((prev) => [...prev, ...res.papers]);
        setPage(nextPage);
      }
      if (res.papers.length === 0) setTotal((t) => Math.min(t, papers.length));
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [page, papers.length, total, loadingMore]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingMore) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <PracticeShell
      title="Level-wise Practice Tests"
      description="Practice by exam, subject, unit, chapter, topic, subtopic, or definition. Scroll for more."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {papers.map((paper) => (
              <PracticeTestCard key={paper.id} paper={paper} />
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6 min-h-[60px]">
              {loadingMore ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-xs text-muted-foreground">Scroll for more</span>
              )}
            </div>
          )}
          {!loading && papers.length === 0 && (
            <p className="text-sm text-muted-foreground">No practice tests available yet.</p>
          )}
        </>
      )}
    </PracticeShell>
  );
}
