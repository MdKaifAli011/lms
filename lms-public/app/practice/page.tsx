"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPracticePapers, getExams, type PracticePaper } from "@/lib/api";
import { PracticePageView } from "@/components/practice/PracticePageView";

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [papers, setPapers] = useState<PracticePaper[]>([]);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [papersRes, examsRes] = await Promise.all([
          getPracticePapers({ status: "Active" }),
          getExams(true),
        ]);
        if (cancelled) return;
        setPapers(Array.isArray(papersRes) ? papersRes : []);
        setExams(Array.isArray(examsRes) ? (examsRes as { id: string; name?: string }[]) : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load practice data");
        setPapers([]);
        setExams([]);
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

  const filteredPapers = useMemo(() => {
    if (activeTab === "all") return papers;
    if (activeTab === "practice") return papers.filter((p) => p.type === "practice");
    if (activeTab === "mock") return papers.filter((p) => p.type === "full_length");
    if (activeTab === "previous") return papers.filter((p) => p.type === "previous_paper");
    return papers;
  }, [papers, activeTab]);

  const recommendedPapers = useMemo(
    () => papers.filter((p) => p.type === "practice").slice(0, 3),
    [papers]
  );
  const fullLengthPapers = useMemo(
    () => papers.filter((p) => p.type === "full_length"),
    [papers]
  );
  const previousYearPapers = useMemo(
    () => papers.filter((p) => p.type === "previous_paper"),
    [papers]
  );
  const previousYearsByYear = useMemo(() => {
    const byYearAndExam = new Map<string, PracticePaper[]>();
    previousYearPapers.forEach((p) => {
      const y = p.year ?? new Date().getFullYear();
      const key = `${y}-${p.examId}`;
      if (!byYearAndExam.has(key)) byYearAndExam.set(key, []);
      byYearAndExam.get(key)!.push(p);
    });
    return Array.from(byYearAndExam.entries())
      .map(([key, list]) => {
        const year = Number(key.split("-")[0]);
        return { year, papers: list } as { year: number; papers: PracticePaper[] };
      })
      .sort((a, b) => b.year - a.year);
  }, [previousYearPapers]);

  const tabs = [
    { id: "all", label: "All Tests" },
    { id: "practice", label: "Practice Tests" },
    { id: "mock", label: "Full-Length Mocks" },
    { id: "previous", label: "Previous Year Papers" },
  ];

  return <PracticePageView
    activeTab={activeTab}
    tabs={tabs}
    loading={loading}
    error={error}
    examNameById={examNameById}
    filteredPapers={filteredPapers}
    recommendedPapers={recommendedPapers}
    fullLengthPapers={fullLengthPapers}
    previousYearsByYear={previousYearsByYear}
    setActiveTab={setActiveTab}
  />;
}
