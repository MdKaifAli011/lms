"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search, Clock, BarChart, Lock, Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MockTestCard } from "@/components/mock-tests/MockTestCard";
import { getFullLengthMocks, getLevelWisePractices, type FullLengthMock, type LevelWisePractice } from "@/lib/api";
import { cn } from "@/lib/utils";

type MockItem = {
  type: "full_length" | "level_wise";
  id: string;
  slug: string;
  title: string;
  examName?: string;
  difficulty: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  locked?: boolean;
  levelName?: string;
};

function formatTime(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m !== 0 ? `${h}h ${m}m` : `${h}h`;
}

function difficultyColor(d: string): "green" | "orange" | "blue" {
  if (d === "Easy") return "green";
  if (d === "Hard") return "orange";
  return "blue";
}

export default function MockTestHub() {
  const [fullLength, setFullLength] = useState<FullLengthMock[]>([]);
  const [levelWise, setLevelWise] = useState<LevelWisePractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [examFilter, setExamFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [mocksRes, levelRes] = await Promise.all([
          getFullLengthMocks({ status: "Active" }),
          getLevelWisePractices({ status: "Active", limit: 0 }),
        ]);
        if (!cancelled) {
          setFullLength(mocksRes);
          setLevelWise(levelRes.papers ?? []);
        }
      } catch {
        if (!cancelled) setFullLength([]), setLevelWise([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const combined: MockItem[] = useMemo(() => {
    const full: MockItem[] = fullLength.map((m) => ({
      type: "full_length" as const,
      id: m.id, slug: m.slug, title: m.title, examName: m.examName,
      difficulty: m.difficulty ?? "Mixed", durationMinutes: m.durationMinutes,
      totalMarks: m.totalMarks, totalQuestions: m.totalQuestions, locked: m.locked, levelName: "Full Length",
    }));
    const level: MockItem[] = levelWise.map((p) => ({
      type: "level_wise" as const,
      id: p.id, slug: p.slug, title: p.title, examName: p.examName,
      difficulty: p.difficulty ?? "Mixed", durationMinutes: p.durationMinutes,
      totalMarks: p.totalMarks, totalQuestions: p.totalQuestions, locked: p.locked, levelName: p.levelName ?? "Practice",
    }));
    return [...full, ...level];
  }, [fullLength, levelWise]);

  const filtered = useMemo(() => combined.filter((item) => {
    const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) || (item.examName ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchExam = examFilter === "all" || (item.examName ?? "").toLowerCase() === examFilter.toLowerCase();
    const matchType = typeFilter === "all" || (typeFilter === "full_length" && item.type === "full_length") || (typeFilter === "level_wise" && item.type === "level_wise");
    return matchSearch && matchExam && matchType;
  }), [combined, searchTerm, examFilter, typeFilter]);

  const featured = useMemo(() => fullLength.find((m) => !m.locked) ?? fullLength[0] ?? filtered[0], [fullLength, filtered]);
  const examNamesForFilter = useMemo(() => Array.from(new Set(combined.map((i) => i.examName).filter(Boolean))) as string[], [combined]);

  return (
    <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4"><span className="h-1 w-10 rounded-full bg-primary" /></div>
          <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3">Exam Hub</span>
          <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">Mock Test <span className="text-primary">Selection</span></h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">Full-length papers, chapter-wise, unit-wise and subject-wise tests—aligned with NEET, JEE, and other entrance exams.</p>
        </div>
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input className="w-full h-10 sm:h-11 pl-9 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Search by title or exam..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <>
          {featured && !("locked" in featured && featured.locked) && (
            <section className="mb-10 sm:mb-12">
              <Card className="overflow-hidden border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
                <CardContent className="p-0">
                  <div className="relative bg-muted/50 dark:bg-muted/20">
                    <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 md:p-10">
                      <div>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4"><span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" /><span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">Recommended</span></div>
                        <h2 className="text-xl min-[480px]:text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight">{featured.title}</h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">{"description" in featured && featured.description ? featured.description : "Full-length mock test matching actual exam pattern and marking scheme."}</p>
                        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                          <div className="flex items-center gap-2 text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm font-medium"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />{formatTime(featured.durationMinutes)}</div>
                          <div className="flex items-center gap-2 text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm font-medium"><BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />{featured.totalMarks} Marks</div>
                          <Link href={`/mock-tests/${featured.slug}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all">Start Now <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                      </div>
                      <div className="hidden md:block relative">
                        <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
                        <Card className="bg-card/80 backdrop-blur-xl border border-border p-5 rounded-xl shadow-xl relative">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Smartphone className="w-5 h-5" /></div>
                            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Exam</p><p className="text-lg font-bold text-foreground">{featured.examName ?? "Mock Test"}</p></div>
                          </div>
                          <div className="space-y-2"><div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[85%] rounded-full" /></div><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex justify-between"><span>Questions</span><span className="text-foreground">{featured.totalQuestions}</span></p></div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button type="button" onClick={() => setExamFilter("all")} className={cn("px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all", examFilter === "all" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5")}>All Exams</button>
            {examNamesForFilter.slice(0, 8).map((name) => (
              <button key={name} type="button" onClick={() => setExamFilter(examFilter === name ? "all" : name)} className={cn("px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors", examFilter === name ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5")}>{name}</button>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-card border border-border rounded-full px-3 py-2 text-xs sm:text-sm font-medium text-foreground cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="all">All Types</option>
                <option value="full_length">Full Length</option>
                <option value="level_wise">Chapter/Unit/Subject</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground">No mock tests match your filters. Try a different exam or type.</div>
            ) : filtered.map((item) => {
                if (item.locked) return (
                  <Card key={item.id} className="relative overflow-hidden bg-card/60 border border-border border-dashed opacity-80">
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60 backdrop-blur-sm"><div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-lg"><Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span className="text-xs font-bold text-foreground uppercase tracking-wider">Locked</span></div></div>
                    <CardContent className="p-5 sm:p-6 relative">
                      <div className="flex justify-between items-start mb-4"><span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{item.difficulty}</span><span className="text-xs text-muted-foreground">{item.levelName ?? item.type}</span></div>
                      <h3 className="text-lg font-bold mb-4 text-foreground">{item.title}</h3>
                      <div className="flex items-center gap-4 mb-6 text-muted-foreground text-sm"><span className="font-bold text-foreground">{formatTime(item.durationMinutes)}</span><span className="font-bold text-foreground">{item.totalMarks} Marks</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">{item.examName}</span><span className="bg-muted px-5 py-2 rounded-xl text-xs font-bold cursor-not-allowed text-muted-foreground">Coming Soon</span></div>
                    </CardContent>
                  </Card>
                );
                return <MockTestCard key={item.id} id={item.levelName ?? (item.type === "full_length" ? "Full Length" : "Practice")} title={item.title} difficulty={item.difficulty} difficultyColor={difficultyColor(item.difficulty)} time={formatTime(item.durationMinutes)} marks={String(item.totalMarks)} questions={String(item.totalQuestions)} users={[item.examName ?? "Exam"].filter(Boolean)} userColors={["bg-primary"]} actionLabel="Start Now" href={`/mock-tests/${item.slug}`} />;
              })}
          </div>
        </>
      )}
    </main>
  );
}
