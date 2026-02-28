import React from 'react'
import { BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ExamCard } from '../ExamCard'

interface AllExamsSectionProps {
  exams: any[]
}

export function AllExamsSection({ exams }: AllExamsSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 sm:mb-10 md:mb-12 text-center">
        <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
          <span className="h-1 w-10 rounded-full bg-primary" />
        </div>

        <h3 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          All Available Exams
        </h3>

        <p className="mt-2 sm:mt-3 text-xs min-[480px]:text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-1">
          Explore all exams and start your preparation journey with expert-designed content
        </p>
      </div>

      {/* Empty State */}
      {exams.length === 0 ? (
        <Card className="border-dashed border-muted">
          <CardContent className="py-12 sm:py-16 text-center">
            <div className="mx-auto mb-4 sm:mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/40">
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>

            <p className="text-sm sm:text-base font-medium text-foreground">
              No exams available yet
            </p>

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              New exams will appear here as soon as they’re published.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="min-w-0 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <ExamCard
                exam={exam}
                showProgress={false}
                mentor="Expert Team"
                courseType="self-paced"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
