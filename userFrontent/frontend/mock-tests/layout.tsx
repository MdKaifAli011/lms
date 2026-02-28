'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@/app/(frontend)/components/Header'
import { ExamCategoriesBar } from '@/app/(frontend)/components/ExamCategoriesBar'
import { FooterComponent } from '@/app/(frontend)/components/home/FooterComponent'

/**
 * Mock-tests layout: Header + ExamCategoriesBar + main area + Footer for hub and
 * test setup pages. For the full-screen exam page (.../exam), render only children
 * so the exam UI is not wrapped in the site shell.
 */
export default function MockTestsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExamPage = pathname != null && /\/mock-tests\/[^/]+\/exam\/?$/.test(pathname)

  if (isExamPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />
      {children}
      <FooterComponent />
    </div>
  )
}
