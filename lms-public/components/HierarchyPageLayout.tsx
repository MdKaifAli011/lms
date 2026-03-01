"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { HierarchySidebar } from "@/components/HierarchySidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentRenderer } from "@/components/ContentRenderer";
import { NavigationButtons } from "@/components/NavigationButtons";
import { FooterComponent } from "@/components/home/FooterComponent";
import { MainContentSkeleton } from "@/components/RouteLoadingSkeletons";
import { useNavigationLoading } from "@/context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { HierarchySubject } from "@/lib/buildHierarchy";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HierarchyPageLayoutProps {
  examSlug: string;
  exams: Array<{ id: string; name?: string; slug?: string; status?: string }>;
  subjects: HierarchySubject[];
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  content?: string | null;
  children?: ReactNode;
  prev?: { label: string; href: string } | null;
  next?: { label: string; href: string } | null;
}

export function HierarchyPageLayout({
  examSlug,
  exams,
  subjects,
  breadcrumbs,
  title,
  description,
  content,
  children,
  prev,
  next,
}: HierarchyPageLayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const navigationLoading = useNavigationLoading();
  const isNavigating = Boolean(navigationLoading?.isNavigating);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
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
          typeof window !== "undefined" && url.origin === window.location.origin;
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
    [router]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <ExamCategoriesBar exams={exams} sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className="h-[72px] sm:h-[84px]" aria-hidden />

      <div className="flex flex-1 relative">
        <HierarchySidebar examSlug={examSlug} subjects={subjects} isOpen={sidebarOpen} onClose={closeSidebar} />

        <div className="flex-1 min-w-0 relative">
          <main className={cn("w-full bg-background dark:bg-slate-950/50", "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0")}>
            {isNavigating ? (
              <MainContentSkeleton />
            ) : (
              <div
                className="max-w-7xl mx-auto"
                onClickCapture={onMainContentClick}
                role="presentation"
              >
                <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                  <div className="mb-3 sm:mb-4">
                    <Breadcrumbs items={breadcrumbs} />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
                    {title}
                  </h1>
                  {description ? (
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                      {description}
                    </p>
                  ) : null}
                  {content != null && content !== "" ? (
                    <div className="mt-6 sm:mt-8 md:mt-10">
                      <ContentRenderer content={content} />
                    </div>
                  ) : null}
                  {children ? <div className="mt-6 sm:mt-8 md:mt-10">{children}</div> : null}
                  <div className="mt-8 sm:mt-10 md:mt-12">
                    <NavigationButtons prev={prev} next={next} />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}
