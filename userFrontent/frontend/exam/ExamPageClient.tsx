'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Grid, List, BookOpen, Users, TrendingUp, Star, Clock, Award, Target, Zap } from 'lucide-react'
import type { Exam } from '@/payload-types'
import { ExamCard } from '@/app/(frontend)/components/ExamCard'
import { Header } from '@/app/(frontend)/components/Header'
import { ExamCategoriesBar } from '@/app/(frontend)/components/ExamCategoriesBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GradientBg } from '@/components/ui/gradient-bg'
import { FooterComponent } from '@/app/(frontend)/components/home/FooterComponent'
import { cn } from '@/lib/utils'

interface ExamsPageClientProps {
  exams: Exam[]
}

export function ExamPageClient({ exams }: ExamsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('order')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort exams
  const filteredAndSortedExams = useMemo(() => {
    const filtered = exams.filter((exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort exams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0)
      }
    })

    return filtered
  }, [exams, searchTerm, sortBy])

  const stats = {
    total: exams.length,
    active: exams.filter((e) => e.isActive).length,
    totalSubjects: exams.reduce((acc, exam) => acc + ((exam as Exam & { subjectCount?: number }).subjectCount ?? 0), 0),
    avgRating: 4.8,
    totalStudents: 50000,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar exams={exams} />
      <div className="h-[80px]" aria-hidden />

      {/* Hero — matches home hero spacing and typography */}
      <GradientBg variant="subtle" intensity="low" className="relative overflow-x-hidden">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] [background-size:18px_18px] sm:[background-size:22px_22px]" aria-hidden />
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] rounded-full bg-primary/15 sm:bg-primary/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />
        <div className="absolute top-1/4 right-0 sm:top-1/3 sm:-right-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] rounded-full bg-primary/10 sm:bg-indigo-500/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-14 sm:pt-16 md:pt-20 lg:pt-24 pb-14 sm:pb-16 md:pb-20 lg:pb-24">
          <div className="text-center space-y-8 sm:space-y-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border border-border bg-background/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary shrink-0 animate-pulse" />
              Excellence in education since 2020
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="leading-[1.1] tracking-tight">
                <span className="block text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                  Master your{' '}
                </span>
                <span className="block text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl font-black text-primary mt-0.5">
                  exam preparation
                </span>
              </h1>
              <p className="text-sm min-[480px]:text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Join thousands of successful students with comprehensive programs, expert faculty, and proven methodology.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: stats.total, label: 'Exam programs', icon: BookOpen, color: 'bg-primary/10 text-primary' },
                { value: stats.totalStudents.toLocaleString(), label: 'Students', icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                { value: stats.avgRating, label: 'Avg rating', icon: Star, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                { value: '95%', label: 'Success rate', icon: Award, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
              ].map(({ value, label, icon: Icon, color }) => (
                <Card key={label} className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className={cn('inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl mb-1.5 sm:mb-2', color)}>
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tabular-nums">{value}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col min-[480px]:flex-row gap-3 justify-center pt-2">
              <Button size="default" className="gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold text-sm sm:text-base" asChild>
                <Link href="#programs">
                  <Target className="h-4 w-4" />
                  Explore programs
                </Link>
              </Button>
              <Button size="default" variant="outline" className="gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold text-sm sm:text-base border-2" asChild>
                <Link href="/">
                  <Zap className="h-4 w-4" />
                  Free trial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </GradientBg>

      {/* Why choose us — same section pattern as home */}
      <section className="py-14 sm:py-16 md:py-20 bg-muted/30 dark:bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-primary" />
            </div>
            <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why choose our exam programs
            </h2>
            <p className="mt-2 sm:mt-3 text-xs min-[480px]:text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Comprehensive preparation with proven results and expert guidance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[
              { icon: Target, title: 'Targeted preparation', desc: 'Focused curriculum for each exam pattern', color: 'bg-primary/10 text-primary' },
              { icon: Award, title: 'Expert faculty', desc: 'Experienced teachers with proven track records', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              { icon: Clock, title: 'Flexible schedule', desc: 'Study at your own pace', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
              { icon: TrendingUp, title: 'Proven results', desc: '95% success rate, thousands of success stories', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
                <CardContent className="p-5 sm:p-6 text-center">
                  <div className={cn('inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 sm:mb-4', color)}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exam programs list — same section and grid as home AllExamsSection */}
      <section id="programs" className="py-14 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-primary" />
            </div>
            <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              All exam programs
            </h2>
            <p className="mt-2 sm:mt-3 text-xs min-[480px]:text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Choose from our range of exam preparation programs
            </p>
          </div>

          <div className="mb-6 sm:mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm sm:max-w-md min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11 rounded-xl border-border bg-background focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full min-[480px]:w-[180px] h-10 sm:h-11 rounded-xl border-border bg-background text-foreground">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Default order</SelectItem>
                    <SelectItem value="title">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex rounded-xl border border-border overflow-hidden bg-background">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2.5 transition-colors',
                      viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2.5 transition-colors',
                      viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>Showing {filteredAndSortedExams.length} of {exams.length} exams</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs font-normal rounded-md">
                  {'"'}{searchTerm}{'"'}
                </Badge>
              )}
            </div>
          </div>

          {filteredAndSortedExams.length === 0 ? (
            <Card className="bg-card/80 border border-border">
              <CardContent className="py-12 sm:py-16 text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No exams found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  {searchTerm
                    ? 'No exams match your search. Try different keywords.'
                    : 'No exams are available right now. Check back later.'}
                </p>
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="rounded-xl">
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {filteredAndSortedExams.map((exam) => (
                <div key={exam.id} className="min-w-0 transition-transform duration-200 hover:-translate-y-0.5">
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
        </div>
      </section>

      {/* Testimonials — same section pattern as home */}
      <section className="py-14 sm:py-16 md:py-20 bg-muted/30 dark:bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-primary" />
            </div>
            <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Student success stories
            </h2>
            <p className="mt-2 sm:mt-3 text-xs min-[480px]:text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Hear from students who achieved their goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[
              { initials: 'AK', name: 'Arjun Kumar', meta: 'JEE Advanced – AIR 127', quote: 'The structured approach and expert guidance helped me crack JEE Advanced. The mock tests were invaluable.', color: 'bg-primary/10 text-primary' },
              { initials: 'PS', name: 'Priya Sharma', meta: 'NEET – AIR 89', quote: 'The biology faculty and test series were exceptional. Regular doubt clearing made all the difference.', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              { initials: 'RK', name: 'Rohit Kumar', meta: 'CAT – 99.2%ile', quote: 'Comprehensive study material and mock tests helped me achieve my dream score. Highly recommend.', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
            ].map(({ initials, name, meta, quote, color }) => (
              <Card key={name} className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-primary/20 overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm', color)}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{meta}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
                  <div className="flex gap-0.5 mt-4" aria-hidden>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — same pattern as home CTASection */}
      <section className="py-10 sm:py-14 md:py-16 lg:py-20 px-3 min-[480px]:px-4 sm:px-5 md:px-6">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <GradientBg variant="subtle" intensity="low" className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] [background-size:18px_18px] sm:[background-size:22px_22px]" aria-hidden />
            <div className="text-center space-y-4 sm:space-y-6 py-10 sm:py-12 md:py-14 px-4">
              <h2 className="text-xl min-[480px]:text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Ready to start your journey?
              </h2>
              <p className="max-w-lg mx-auto text-xs min-[480px]:text-sm sm:text-base text-muted-foreground">
                Join thousands of successful students with expert guidance
              </p>
              <div className="flex flex-col min-[480px]:flex-row gap-3 justify-center pt-2">
                <Button size="default" className="gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold text-sm sm:text-base" asChild>
                  <Link href="#programs">
                    <Target className="h-4 w-4" />
                    Get started today
                  </Link>
                </Button>
                <Button size="default" variant="outline" className="gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-semibold text-sm sm:text-base border-2" asChild>
                  <Link href="/">
                    <BookOpen className="h-4 w-4" />
                    Download brochure
                  </Link>
                </Button>
              </div>
            </div>
          </GradientBg>
        </div>
      </section>

      <FooterComponent />
    </div>
  )
}
