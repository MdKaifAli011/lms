"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Clock, HelpCircle, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getFullLengthMocks, type FullLengthMock } from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";
import { cn } from "@/lib/utils";

const INITIAL_PAGE_SIZE = 10;
const LOAD_MORE_SIZE = 10;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

function MockTestCard({ id, paper }: { id: string; paper: FullLengthMock }) {
  const duration = formatDuration(paper.durationMinutes);
  const locked = paper.locked ?? false;
  return (
    <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-blue-500/20 overflow-hidden">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0",
                locked ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
              )}
            >
              {id}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{toTitleCase(paper.title)}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {paper.description || "Full-length mock test"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-3 py-2 bg-muted/40 rounded-lg">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" /> {duration}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" /> {paper.totalQuestions} Qs
              </span>
              {paper.difficulty ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" /> {paper.difficulty}
                </span>
              ) : null}
            </div>
            {locked ? (
              <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 sm:px-8">
                Unlock & Start
              </Button>
            ) : (
              <Link href={`/practice/${paper.slug}`}>
                <Button size="sm" variant="outline" className="rounded-xl font-semibold text-xs sm:text-sm px-6 sm:px-8 border-2">
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

export default function PracticeFullLengthPage() {
  const [papers, setPapers] = useState<FullLengthMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await getFullLengthMocks({ status: "Active" });
        if (!cancelled) setPapers(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const visiblePapers = papers.slice(0, visibleCount);
  const hasMore = visibleCount < papers.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + LOAD_MORE_SIZE, papers.length));
  }, [papers.length]);

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
      title="Full-Length Mock Tests"
      description="Complete mock tests for your exam. Click Start Test to open. Scroll for more."
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
          <div className="space-y-3 sm:space-y-4">
            {visiblePapers.map((paper, idx) => (
              <MockTestCard key={paper.id} id={String(idx + 1)} paper={paper} />
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6 min-h-[60px]">
              <span className="text-xs text-muted-foreground">Scroll for more</span>
            </div>
          )}
          {papers.length === 0 && (
            <p className="text-sm text-muted-foreground">No full-length mock tests available yet.</p>
          )}
        </>
      )}
    </PracticeShell>
  );
}
