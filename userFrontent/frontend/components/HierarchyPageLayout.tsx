'use client'

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Header } from '@/app/(frontend)/components/Header'
import { ExamCategoriesBar } from '@/app/(frontend)/components/ExamCategoriesBar'
import { HierarchySidebar } from '@/app/(frontend)/components/HierarchySidebar'
import { StudyToolsSidebar } from '@/app/(frontend)/components/StudyToolsSidebar'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'
import { LexicalContent } from '@/app/(frontend)/components/LexicalContent'
import { NavigationButtons } from '@/app/(frontend)/components/NavigationButtons'
import { FooterComponent } from '@/app/(frontend)/components/home/FooterComponent'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHierarchySearch, useNavigationLoading } from '@/context'
import { MainContentSkeleton } from '@/app/(frontend)/components/RouteLoadingSkeletons'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface HierarchyPageLayoutProps {
  exam: any
  examSlug: string
  exams: any[]
  subjects: any[]
  breadcrumbs: BreadcrumbItem[]
  title: string
  description?: string
  content?: any
  children?: ReactNode
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

export function HierarchyPageLayout({
  exam: _exam,
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
  const isMobile = useIsMobile()
  const hierarchySearch = useHierarchySearch()
  const navigationLoading = useNavigationLoading()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const isNavigating = Boolean(navigationLoading?.isNavigating) // Closed on mobile by default

  // Provide hierarchy to global search (exam-scoped = zero API)
  useEffect(() => {
    if (!hierarchySearch) return
    hierarchySearch.setHierarchy(examSlug, subjects ?? null)
    return () => hierarchySearch.setHierarchy(null, null)
  }, [hierarchySearch, examSlug, subjects])

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Fixed Header */}
      <Header />

      {/* Fixed Exam Categories Bar */}
      <ExamCategoriesBar exams={exams} sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

      {/* Spacer: Header (h-12 sm:h-14 = 48px/56px) + ExamCategoriesBar (h-6 sm:h-7 = 24px/28px) = 72px/84px */}
      <div className="h-[72px] sm:h-[84px]" aria-hidden />

      {/* Main Content Area with Sidebars - Normal Document Flow */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar - Sticky, independently scrollable */}
        <HierarchySidebar
          examSlug={examSlug}
          subjects={subjects}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main Content Area - Flexible width, independently scrollable */}
        <div className="flex-1 min-w-0 relative">
          <main
            className={cn(
              'w-full bg-background dark:bg-slate-950/50',
              'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0'
            )}
          >
            {isNavigating ? (
              <MainContentSkeleton />
            ) : (
              <>
                <div className="max-w-7xl mx-auto">
                  {/* Responsive Content Container */}
                  <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                    {/* Breadcrumbs - Responsive spacing */}
                    <div className="mb-3 sm:mb-4">
                      <Breadcrumbs items={breadcrumbs} />
                    </div>
          
                    {/* Page Title - Responsive typography */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-2 sm:mb-3">
                      {title}
                    </h1>
          
                    {/* Description - Responsive typography and spacing */}
                    {description && (
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                        {description}
                      </p>
                    )}
          
                    {/* Content Area - Responsive spacing */}
                    {content && (
                      <div className="mt-6 sm:mt-8 md:mt-10">
                        <LexicalContent content={content} />
                      </div>
                    )}
          
                    {/* Children Content */}
                    {children && (
                      <div className="mt-6 sm:mt-8 md:mt-10">
                        {children}
                      </div>
                    )}
          
                    {/* Navigation Buttons - Responsive layout */}
                    <div className="mt-8 sm:mt-10 md:mt-12">
                      <NavigationButtons prev={prev} next={next} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Right Sidebar - Study Tools (Hover to expand) */}
        <StudyToolsSidebar
          user={{
            name: 'Alex Johnson',
            role: 'NEET Aspirant',
          }}
        />
      </div>

      {/* Footer - Normal document flow, appears after sidebar and content */}
      <FooterComponent />
    </div>
  )
}
