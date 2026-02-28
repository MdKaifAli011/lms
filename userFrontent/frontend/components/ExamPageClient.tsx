'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  ChevronRight, 
  Layers, 
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  PlayCircle,
  LayoutGrid
} from 'lucide-react'
import { HierarchyPageLayout } from '@/app/(frontend)/components/HierarchyPageLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress' // Assuming you have this shadcn component
import { cn } from '@/lib/utils'

interface Unit {
  id: string
  title: string
  slug?: string
}

interface Subject {
  id: string
  title: string
  slug?: string
  units?: Unit[]
}

interface ExamPageClientProps {
  exam: any
  examSlug: string
  exams: any[]
  subjects: Subject[]
  prev?: { label: string; href: string } | null
  next?: { label: string; href: string } | null
}

export function ExamPageClient({
  exam,
  examSlug,
  exams,
  subjects,
  prev,
  next,
}: ExamPageClientProps) {
  // Calculate stats
  const totalUnits = subjects.reduce((acc, s) => acc + (s.units?.length || 0), 0)
  
  return (
    <HierarchyPageLayout
      exam={exam}
      examSlug={examSlug}
      exams={exams}
      subjects={subjects}
      breadcrumbs={[{ label: exam.title, href: `/exam/${examSlug}` }]}
      title={exam.title}
      description=""
      content={exam.content}
      prev={prev}
      next={next}
    >
   

      {/* ================= Subjects Grid ================= */}
      <section className="mb-12">
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                examSlug={examSlug}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </HierarchyPageLayout>
  )
}

/* ================= SUBJECT CARD ================= */

function SubjectCard({
  subject,
  examSlug,
  index,
}: {
  subject: Subject
  examSlug: string
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const subjectSlug = subject.slug || subject.id
  const units = subject.units || []
  const visibleUnits = isExpanded ? units : units.slice(0, 4)
  const hasMoreUnits = units.length > 4
  const hiddenCount = units.length - 4

  return (
    <div className="group h-full">
      <Card className={cn(
        "relative h-full flex flex-col overflow-hidden border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/40",
        "transition-all duration-300 ease-out",
        "hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        "dark:hover:bg-card/80 dark:hover:border-primary/30"
      )}>
        {/* Hover Highlight Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* --- Header Section --- */}
        <div className="relative p-5 pb-0 flex-shrink-0">
          <Link href={`/exam/${examSlug}/${subjectSlug}`} className="block group/title focus:outline-none">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">

                {/* Title & Meta */}
                <div className="space-y-1 pt-0.5">
                  <h3 className="font-bold text-lg leading-tight text-foreground transition-colors group-hover/title:text-primary line-clamp-2">
                    {subject.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 
                    <span>{units.length} Units</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="mt-1 text-muted-foreground/30 group-hover/title:text-primary transition-all group-hover/title:translate-x-1">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
          
          {/* Divider with "Curriculum" label */}
          <div className="flex items-center gap-2 mt-6 mb-2">
            <div className="h-px flex-1 bg-border/60 group-hover:bg-border transition-colors" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Curriculum</span>
            <div className="h-px flex-1 bg-border/60 group-hover:bg-border transition-colors" />
          </div>
        </div>

        {/* --- Units List (Timeline Style) --- */}
        <div className="relative flex-1 p-5 pt-2">
          {units.length > 0 ? (
            <div className="relative space-y-0">
              {/* Vertical connecting line */}
              <div className="absolute left-[19px] top-2 bottom-6 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />

              <ul className="relative space-y-3">
                {visibleUnits.map((unit, i) => {
                  const unitSlug = unit.slug || unit.id
                  return (
                    <li key={unit.id} className="relative z-10">
                      <Link
                        href={`/exam/${examSlug}/${subjectSlug}/${unitSlug}`}
                        className={cn(
                          "group/item flex items-start gap-3 rounded-lg p-2 -ml-2 transition-all duration-200",
                          "hover:bg-muted/50 hover:translate-x-1"
                        )}
                      >
                        {/* Status Icon/Dot */}
                        <div className={cn(
                          "flex-shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background transition-all duration-300",
                          "group-hover/item:border-primary group-hover/item:text-primary shadow-sm"
                        )}>
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 group-hover/item:bg-primary transition-colors" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground group-hover/item:text-foreground transition-colors line-clamp-1">
                            {unit.title}
                          </p>
                        </div>

                        {/* Arrow hint */}
                        <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* --- Expand/Collapse Action --- */}
              {hasMoreUnits && (
                <div className="relative z-10 mt-3 pl-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                      "h-7 px-2 text-xs font-medium text-muted-foreground hover:text-primary",
                      "hover:bg-primary/5 -ml-2"
                    )}
                  >
                    {isExpanded ? (
                      <span className="flex items-center gap-1.5">
                        <ChevronUp className="w-3.5 h-3.5" />
                        Collapse
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        View {hiddenCount} more
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-border/60 dark:border-border/40 rounded-lg bg-muted/20 dark:bg-muted/10">
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          )}
        </div>

        {/* --- Card Footer / Active Indicator --- */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Card>
    </div>
  )
}

/* ================= EMPTY STATE ================= */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border/50 dark:border-border/40 rounded-3xl bg-muted/10 dark:bg-muted/5">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-background dark:bg-card border border-border dark:border-border/40 shadow-lg">
          <Layers className="w-10 h-10 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Curriculum Pending
      </h3>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        The syllabus structure for this exam is currently being curated. 
        Check back soon for a detailed breakdown of subjects and units.
      </p>
    </div>
  )
}