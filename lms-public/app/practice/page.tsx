"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination state for practice tests
  const [practicePapers, setPracticePapers] = useState<LevelWisePractice[]>([]);
  const [practiceTotal, setPracticeTotal] = useState(0);
  const [practicePage, setPracticePage] = useState(1);
  const [isLoadingMorePractice, setIsLoadingMorePractice] = useState(false);
  
  // Pagination state for full-length mocks
  const [mockPapers, setMockPapers] = useState<FullLengthMock[]>([]);
  const [mockTotal, setMockTotal] = useState(0);
  const [mockPage, setMockPage] = useState(1);
  const [isLoadingMoreMock, setIsLoadingMoreMock] = useState(false);
  
  const [previousYearPapers, setPreviousYearPapers] = useState<PreviousYearPaper[]>([]);
  const [exams, setExams] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load - only fetch 3 items for each type
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [levelWiseRes, mockRes, previousYearRes, examsRes] = await Promise.all([
          getLevelWisePractices({ status: "Active", page: 1, limit: INITIAL_LIMIT }),
          getFullLengthMocks({ status: "Active", page: 1, limit: INITIAL_LIMIT }),
          getPreviousYearPapers({ status: "Active" }),
          getExams(true),
        ]);
        if (cancelled) return;
        setPracticePapers(levelWiseRes.papers);
        setPracticeTotal(levelWiseRes.total);
        setPracticePage(1);
        setMockPapers(mockRes.papers);
        setMockTotal(mockRes.total);
        setMockPage(1);
        setPreviousYearPapers(Array.isArray(previousYearRes) ? previousYearRes : []);
        setExams(Array.isArray(examsRes) ? (examsRes as { id: string; name?: string }[]) : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load practice data");
        setPracticePapers([]);
        setMockPapers([]);
        setPreviousYearPapers([]);
        setExams([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

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

  // Load more mock papers (infinite scroll)
  const loadMoreMocks = useCallback(async () => {
    console.log("loadMoreMocks called", { isLoadingMoreMock, mockPapersLength: mockPapers.length, mockTotal });
    if (isLoadingMoreMock || mockPapers.length >= mockTotal) {
      console.log("loadMoreMocks early return");
      return;
    }
    
    setIsLoadingMoreMock(true);
    try {
      const nextPage = mockPage + 1;
      console.log("Fetching page", nextPage);
      const res = await getFullLengthMocks({ 
        status: "Active", 
        page: nextPage, 
        limit: LOAD_MORE_LIMIT 
      });
      console.log("Got response", res);
      
      // Stop if no more data returned
      if (res.papers.length === 0) {
        setMockTotal(mockPapers.length); // Update total to stop further loading
        return;
      }
      
      setMockPapers(prev => [...prev, ...res.papers]);
      setMockPage(nextPage);
    } catch (e) {
      console.error("Failed to load more mocks:", e);
    } finally {
      setIsLoadingMoreMock(false);
    }
  }, [mockPage, mockPapers.length, mockTotal, isLoadingMoreMock]);

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
    return mockPapers.map((p) => ({
      ...p,
      type: "full_length" as const,
      level: 1,
      examName: p.examName,
      examSlug: p.examSlug,
    }));
  }, [mockPapers]);

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
    isLoadingMorePractice={isLoadingMorePractice}
    onLoadMorePractice={loadMorePractices}
    mockTotal={mockTotal}
    isLoadingMoreMock={isLoadingMoreMock}
    onLoadMoreMock={loadMoreMocks}
  />;
}
