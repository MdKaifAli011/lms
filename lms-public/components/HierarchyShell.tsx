"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { HierarchySidebar } from "@/components/HierarchySidebar";
import { StudyToolsSidebar } from "@/components/StudyToolsSidebar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { MainContentSkeleton } from "@/components/RouteLoadingSkeletons";
import { useNavigationLoading } from "@/context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { HierarchySubject } from "@/lib/buildHierarchy";

interface HierarchyShellProps {
  examSlug: string;
  exams: Array<{ id: string; name?: string; slug?: string; status?: string }>;
  subjects: HierarchySubject[];
  children: ReactNode;
}

/**
 * Shared shell for all hierarchy routes under exam/[slug].
 * Header, exam bar, sidebar stay mounted; only the main area (children) updates on navigation.
 * Loading states show only MainContentSkeleton in the main area.
 */
export function HierarchyShell({
  examSlug,
  exams,
  subjects,
  children,
}: HierarchyShellProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const navigationLoading = useNavigationLoading();
  const isNavigating = Boolean(navigationLoading?.isNavigating);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  /** Sync open state when switching between mobile/desktop (e.g. resize); deferred to avoid synchronous setState in effect. */
  useEffect(() => {
    const open = !isMobile;
    queueMicrotask(() => setSidebarOpen(open));
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const closeSidebar = () => setSidebarOpen(false);

  const onMainContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        const isSameOrigin =
          typeof window !== "undefined" &&
          url.origin === window.location.origin;
        const path = url.pathname + url.search;
        if (
          isSameOrigin &&
          path !== window.location.pathname &&
          !anchor.target &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(path);
        }
      } catch {
        // ignore
      }
    },
    [router],
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <ExamCategoriesBar
        exams={exams}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      {/* Spacer: matches Header (h-12/h-14) + ExamCategoriesBar (h-8/h-9) = 80px/92px — avoids sidebar overlapping header, no CLS */}
      <div className="h-[80px] sm:h-[92px]" aria-hidden />

      {/* Body: sticky left sidebar | main | sticky right sidebar. Right sidebar sticky so full menu visible with main area; when page scrolls to footer, both sidebars move (no overlap). */}
      <div className="flex min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-92px)]">
        <HierarchySidebar
          examSlug={examSlug}
          subjects={subjects}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          sticky
        />

        <div className="flex-1 min-w-0 flex flex-col pr-16">
          <main
            className={cn(
              "w-full min-h-0 flex-1 bg-background dark:bg-slate-950/50",
              "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0",
            )}
          >
            {isNavigating ? (
              <MainContentSkeleton />
            ) : (
              <div
                className="max-w-7xl mx-auto"
                onClickCapture={onMainContentClick}
                role="presentation"
              >
                <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                  {children}
                </div>
              </div>
            )}
          </main>
        </div>

        <StudyToolsSidebar
          examSlug={examSlug}
          user={{
            name: "Alex Johnson",
            role: "NEET Aspirant",
          }}
          sticky
        />
      </div>

      <div className="shrink-0">
        <FooterComponent />
      </div>
    </div>
  );
}
