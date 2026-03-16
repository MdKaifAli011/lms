"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getExams } from "@/lib/api";

interface ExamCategoriesBarProps {
  exams?: Array<{ id: string; name?: string; slug?: string; status?: string }>;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ESTIMATED_ITEM_WIDTH = 72;

export function ExamCategoriesBar({
  exams: examsProp,
  sidebarOpen = true,
  onToggleSidebar,
}: ExamCategoriesBarProps) {
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [fetchedExams, setFetchedExams] = useState<
    Array<{ id: string; name?: string; slug?: string; status?: string }>
  >([]);
  const [loading, setLoading] = useState(!examsProp?.length);

  useEffect(() => {
    const t = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (examsProp?.length) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getExams(true)
      .then((list) => {
        if (cancelled) return;
        const items = Array.isArray(list)
          ? (list as Array<{ id?: string; name?: string; slug?: string; status?: string }>).map(
              (e) => ({
                id: typeof e.id === "string" ? e.id : String(e.id ?? ""),
                name: e.name,
                slug: e.slug,
                status: e.status,
              })
            )
          : [];
        setFetchedExams(items);
      })
      .catch(() => {
        if (!cancelled) setFetchedExams([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [examsProp?.length]);

  const exams = examsProp?.length ? examsProp : fetchedExams;
  const displayExams =
    exams
      .filter((e) => (e.slug || e.id) && (e.status === "Active" || !e.status))
      .map((e) => ({
        title: (e.name ?? "").trim().toUpperCase() || (e.slug ?? e.id),
        slug: (e.slug || e.id).toString(),
      }))
      .filter((e) => e.title) ?? [];

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("exam-categories-scroll");
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!isClient) return;
    const container = document.getElementById("exam-categories-scroll");
    if (!container) return;
    const handleScroll = () => setScrollPosition(container.scrollLeft);
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const canScrollLeft = isClient && scrollPosition > 0;
  const canScrollRight =
    isClient &&
    typeof window !== "undefined" &&
    window.innerWidth > 0 &&
    scrollPosition <
      Math.max(
        0,
        displayExams.length * ESTIMATED_ITEM_WIDTH - window.innerWidth + 80,
      );

  return (
    <div className="bg-gray-900 dark:bg-black border-b border-gray-800 fixed top-12 sm:top-14 left-0 right-0 z-40">
      <div className="container mx-auto px-2 sm:px-3">
        <div className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 min-[480px]:h-9">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-white hover:text-gray-300 transition-colors shrink-0 rounded"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          )}

          <div className="hidden md:flex items-center gap-0.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                canScrollLeft
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                canScrollRight
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div
            id="exam-categories-scroll"
            className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide flex-1 scroll-smooth min-h-0"
          >
            {loading ? (
              <span className="text-xs sm:text-sm text-gray-500 shrink-0 py-1 sm:py-1.5">
                Loading…
              </span>
            ) : displayExams.length > 0 ? (
              displayExams.map((exam) => {
                const isActive =
                  pathname === `/exam/${exam.slug}` ||
                  (pathname ?? "").startsWith(`/exam/${exam.slug}/`);
                return (
                  <Link
                    key={exam.slug}
                    href={`/exam/${exam.slug}`}
                    className={`relative whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors shrink-0 ${
                      isActive
                        ? "text-blue-500"
                        : "text-white hover:text-blue-500"
                    }`}
                  >
                    <span className="py-1 sm:py-1.5 inline-block">
                      {exam.title}
                    </span>
                    {isActive && (
                      <span className="absolute left-0 bottom-0 h-[1.5px] sm:h-[2px] w-full bg-blue-500" />
                    )}
                  </Link>
                );
              })
            ) : null}
          </div>

          <div className="md:hidden flex items-center shrink-0">
            <div className="w-6 h-0.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{
                  width: `${Math.min(
                    (scrollPosition /
                      Math.max(displayExams.length * ESTIMATED_ITEM_WIDTH, 1)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
