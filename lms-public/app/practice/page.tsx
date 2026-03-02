"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getLevelWisePractices,
  getFullLengthMocks,
  getPreviousYearPapers,
  getExams,
  type LevelWisePractice,
  type FullLengthMock,
  type PreviousYearPaper,
} from "@/lib/api";
import { PracticePageView } from "@/components/practice/PracticePageView";

// Unified type for practice page
type PracticePaper = {
  id: string;
  examId: string;
  type: "practice" | "full_length" | "previous_paper";
  level: number;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: string;
  year?: number;
  orderNumber: number;
  status: string;
  locked?: boolean;
  image?: string;
  examName?: string;
  examSlug?: string;
  subjectName?: string;
};

const INITIAL_LIMIT = 3;
const LOAD_MORE_LIMIT = 10;

// Tab configuration with URL mapping
const TAB_CONFIG = {
  all: { id: "all", label: "All Tests", urlParam: "all" },
  practice: { id: "practice", label: "Practice Tests", urlParam: "practice-tests" },
  mock: { id: "mock", label: "Full-Length Mocks", urlParam: "full-length-mocks" },
  previous: { id: "previous", label: "Previous Year Papers", urlParam: "previous-year-papers" },
};

function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get tab from URL or default to "all"
  const urlTab = searchParams.get("tab");
  const activeTab = useMemo(() => {
    const entry = Object.entries(TAB_CONFIG).find(([_, config]) => config.urlParam === urlTab);
    return entry ? entry[0] : "all";
  }, [urlTab]);
  
  // Data loading state - track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["all"]));
  
  // Data states
  const [practicePapers, setPracticePapers] = useState<LevelWisePractice[]>([]);
  const [practiceTotal, setPracticeTotal] = useState(0);
  const [practicePage, setPracticePage] = useState(1);
  const [isLoadingMorePractice, setIsLoadingMorePractice] = useState(false);
  
  const [fullLengthPapers, setFullLengthPapers] = useState<FullLengthMock[]>([]);
  const [fullLengthTotal, setFullLengthTotal] = useState(0);
  const [fullLengthPage, setFullLengthPage] = useState(1);
  const [isLoadingMoreFullLength, setIsLoadingMoreFullLength] = useState(false);
  
  const [previousYearPapers, setPreviousYearPapers] = useState<PreviousYearPaper[]>([]);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update URL when tab changes
  const setActiveTab = useCallback((tabId: string) => {
    const config = TAB_CONFIG[tabId as keyof typeof TAB_CONFIG];
    if (config) {
      const url = tabId === "all" ? "/practice" : `/practice?tab=${config.urlParam}`;
      router.push(url, { scroll: false });
    }
  }, [router]);

  // Initial load - only load data for "all" tab (minimal data)
  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        // Only load minimal data for "all" tab initially
        const [levelWiseRes, examsRes] = await Promise.all([
          getLevelWisePractices({ status: "Active", page: 1, limit: INITIAL_LIMIT }),
          getExams(true),
        ]);
        if (cancelled) return;
        setPracticePapers(levelWiseRes.papers);
        setPracticeTotal(levelWiseRes.total);
        setExams(Array.isArray(examsRes) ? (examsRes as { id: string; name?: string }[]) : []);
        setPracticePage(1);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load practice data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, []);

  // Lazy load data when tab changes
  useEffect(() => {
    if (loadedTabs.has(activeTab)) return; // Already loaded

    let cancelled = false;
    async function loadTabData() {
      setLoading(true);
      try {
        if (activeTab === "practice" && practicePapers.length === 0) {
          const res = await getLevelWisePractices({ status: "Active", page: 1, limit: LOAD_MORE_LIMIT });
          if (!cancelled) {
            setPracticePapers(res.papers);
            setPracticeTotal(res.total);
            setPracticePage(1);
          }
        } else if (activeTab === "mock" && fullLengthPapers.length === 0) {
          const res = await getFullLengthMocks({ status: "Active" });
          if (!cancelled) {
            setFullLengthPapers(Array.isArray(res) ? res : []);
            setFullLengthTotal(Array.isArray(res) ? res.length : 0);
          }
        } else if (activeTab === "previous" && previousYearPapers.length === 0) {
          const res = await getPreviousYearPapers({ status: "Active" });
          if (!cancelled) setPreviousYearPapers(Array.isArray(res) ? res : []);
        }
        if (!cancelled) setLoadedTabs(prev => new Set([...prev, activeTab]));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    if (activeTab !== "all") {
      loadTabData();
    }
    return () => { cancelled = true; };
  }, [activeTab, loadedTabs, practicePapers.length, fullLengthPapers.length, previousYearPapers.length]);

  // Load more practice papers (infinite scroll)
  const loadMorePractices = useCallback(async () => {
    if (isLoadingMorePractice || practicePapers.length >= practiceTotal) return;
    
    setIsLoadingMorePractice(true);
    try {
      const nextPage = practicePage + 1;
      const res = await getLevelWisePractices({ 
        status: "Active", 
        page: nextPage, 
        limit: LOAD_MORE_LIMIT 
      });
      
      // Stop if no more data returned
      if (res.papers.length === 0) {
        setPracticeTotal(practicePapers.length); // Update total to stop further loading
        return;
      }
      
      setPracticePapers(prev => [...prev, ...res.papers]);
      setPracticePage(nextPage);
    } catch (e) {
      console.error("Failed to load more practices:", e);
    } finally {
      setIsLoadingMorePractice(false);
    }
  }, [practicePage, practicePapers.length, practiceTotal, isLoadingMorePractice]);

  const examNameById = useMemo(() => {
    const map: Record<string, string> = {};
    exams.forEach((e) => { map[e.id] = e.name ?? "Exam"; });
    return map;
  }, [exams]);

  // Convert to unified format
  const allPracticePapers = useMemo<PracticePaper[]>(() => {
    return practicePapers.map((p) => ({
      ...p,
      type: "practice" as const,
      level: p.level,
      examName: p.examName,
      examSlug: p.examSlug,
      subjectName: p.subjectName,
    }));
  }, [practicePapers]);

  const fullLengthPapersForView = useMemo<PracticePaper[]>(() => {
    return fullLengthPapers.map((p) => ({
      ...p,
      type: "full_length" as const,
      level: 1,
      examName: p.examName,
      examSlug: p.examSlug,
    }));
  }, [fullLengthPapers]);

  const previousYearPapersForView = useMemo<PracticePaper[]>(() => {
    return previousYearPapers.map((p) => ({
      ...p,
      type: "previous_paper" as const,
      level: 1,
      year: p.year,
      examName: p.examName,
      examSlug: p.examSlug,
    }));
  }, [previousYearPapers]);

  const allPapers = useMemo<PracticePaper[]>(() => {
    return [...allPracticePapers, ...fullLengthPapersForView, ...previousYearPapersForView];
  }, [allPracticePapers, fullLengthPapersForView, previousYearPapersForView]);

  const filteredPapers = useMemo(() => {
    if (activeTab === "all") return allPapers;
    if (activeTab === "practice") return allPracticePapers;
    if (activeTab === "mock") return fullLengthPapersForView;
    if (activeTab === "previous") return previousYearPapersForView;
    return allPapers;
  }, [allPapers, allPracticePapers, fullLengthPapersForView, previousYearPapersForView, activeTab]);

  const recommendedPapers = useMemo(() => allPracticePapers.slice(0, 3), [allPracticePapers]);

  const previousYearsByYear = useMemo(() => {
    const byYearAndExam = new Map<string, PracticePaper[]>();
    previousYearPapersForView.forEach((p) => {
      const y = p.year ?? new Date().getFullYear();
      const key = `${y}-${p.examId}`;
      if (!byYearAndExam.has(key)) byYearAndExam.set(key, []);
      byYearAndExam.get(key)!.push(p);
    });
    return Array.from(byYearAndExam.entries())
      .map(([key, list]) => {
        const [yearStr, examId] = key.split("-");
        const year = Number(yearStr);
        const examName = list[0]?.examName || examNameById[examId] || "Exam";
        return { year, examId, examName, papers: list } as { year: number; examId: string; examName: string; papers: PracticePaper[] };
      })
      .sort((a, b) => b.year - a.year || a.examName.localeCompare(b.examName));
  }, [previousYearPapersForView, examNameById]);

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
    fullLengthPapers={fullLengthPapersForView}
    previousYearsByYear={previousYearsByYear}
    setActiveTab={setActiveTab}
    practiceTotal={practiceTotal}
    isLoadingMore={isLoadingMorePractice}
    onLoadMore={loadMorePractices}
  />;
}

// Wrap with Suspense for useSearchParams
export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PracticePageContent />
    </Suspense>
  );
}
