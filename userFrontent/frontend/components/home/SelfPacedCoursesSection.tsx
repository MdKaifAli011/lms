import React, { Suspense } from 'react'
import { BookOpen } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { ExamCard } from '../ExamCard'
import { ExamCardSkeleton } from '../ExamCardSkeleton'
import { SectionHeader } from '../SectionHeader'

interface SelfPacedCoursesSectionProps {
  exams: any[]
}

export function SelfPacedCoursesSection({ exams }: SelfPacedCoursesSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <SectionHeader title="Self-Paced Courses" />
      
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.slice(0, 3).map((exam) => (
              <ExamCard
                key={`self-paced-${exam.id}`}
                exam={exam}
                showProgress={true}
                progress={Math.random() * 20}
                mentor="Expert Team"
                courseType="self-paced"
              />
            ))}
          </div>
        )}
      </Suspense>
    </section>
  )
}
