'use client'

import { ExamCategoriesBar } from '@/app/(frontend)/components/ExamCategoriesBar'

export function ExamCategoriesBarWrapper() {
  return (
    <ExamCategoriesBar
      exams={[]}
      sidebarOpen={false}
      onToggleSidebar={() => {}}
    />
  )
}
