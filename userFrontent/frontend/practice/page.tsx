'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  HelpCircle,
  ArrowRight,
  Download,
  PlayCircle,
  History,
  Bot,
  FileText,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '../components/Header'
import { ExamCategoriesBar } from '../components/ExamCategoriesBar'
import { FooterComponent } from '../components/home/FooterComponent'
import { GradientBg } from '@/components/ui/gradient-bg'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  color?: string
}

interface TestCardProps {
  subject: string
  title: string
  description: string
  duration: string
  questions: number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  borderColor: string
}

interface MockTestProps {
  id: string
  title: string
  description: string
  duration: string
  questions: number
  difficulty: string
  locked?: boolean
}

interface PreviousYearPaperProps {
  exam: string
  year: number
}

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All Tests' },
    { id: 'practice', label: 'Practice Tests' },
    { id: 'mock', label: 'Full-Length Mocks' },
    { id: 'previous', label: 'Previous Year Papers' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      {/* Hero: Performance Analytics — same pattern as exam page hero */}
      <GradientBg variant="subtle" intensity="low" className="relative overflow-x-hidden">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] [background-size:18px_18px] sm:[background-size:22px_22px]" aria-hidden />
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-blue-500/10 sm:bg-blue-500/15 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />
        <div className="absolute top-1/4 right-0 sm:top-1/3 sm:-right-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-blue-500/5 sm:bg-blue-500/10 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-10 sm:pt-12 md:pt-14 pb-10 sm:pb-12 md:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Performance Analytics Card */}
            <Card className="lg:col-span-2 bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-blue-500/20">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-5 sm:mb-6">
                  <div>
                    <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-1 sm:mb-2">
                      Performance Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track your progress and readiness for the upcoming NEET 2024 exam.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    LIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Average Score" value="642" suffix="/ 720" color="text-foreground" />
                  <StatCard label="Current Rank" value="#1,240" />
                  <StatCard label="Accuracy" value="92%" color="text-blue-600 dark:text-blue-400" />
                  <StatCard label="Tests Taken" value="48" />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Growth Card */}
            <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-blue-500/20 flex flex-col justify-between">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Weekly Growth
                  </h3>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg sm:text-xl">+18.5%</span>
                </div>
                <div className="flex items-end gap-1 sm:gap-2 h-20 sm:h-24 mb-4">
                  {[40, 55, 45, 70, 60, 85, 100].map((height, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-t transition-all min-w-0',
                        i === 6 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-blue-600/40 dark:bg-blue-500/40'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-xl border-2 text-xs sm:text-sm">
                  View Detailed Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </GradientBg>

      {/* Filter Tabs */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-card border border-border text-foreground hover:bg-muted/50 hover:border-blue-500/30'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 space-y-12 sm:space-y-14 pb-14 sm:pb-16 md:pb-20">
        {/* Recommended Practice Tests */}
        <section className="pt-6 sm:pt-8">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-blue-500" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Recommended Practice Tests
              </h2>
              <Link
                href="#"
                className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium inline-flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <TestCard
              subject="Physics"
              title="Kinematics & Dynamics Mastery"
              description="Master the fundamentals of motion and force with high-yield MCQ practice."
              duration="45m"
              questions={30}
              icon={<span className="text-xl sm:text-2xl">⚛️</span>}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-600 dark:text-blue-400"
              borderColor="border-blue-500/30"
            />
            <TestCard
              subject="Biology"
              title="Cell Biology Essentials"
              description="Deep dive into cellular structures, functions, and reproductive mechanisms."
              duration="60m"
              questions={50}
              icon={<span className="text-xl sm:text-2xl">🧬</span>}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-600 dark:text-blue-400"
              borderColor="border-blue-500/30"
            />
            <TestCard
              subject="Chemistry"
              title="Organic Chemistry Reactions"
              description="Comprehensive test on named reactions and mechanism predictions."
              duration="40m"
              questions={25}
              icon={<span className="text-xl sm:text-2xl">🧪</span>}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-600 dark:text-amber-400"
              borderColor="border-amber-500/30"
            />
          </div>
        </section>

        {/* Full-Length Mock Tests */}
        <section className="py-4 sm:py-6">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-blue-500" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Full-Length Mock Tests
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">New tests added every Sunday</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <MockTestCard
              id="M1"
              title="NEET AI-Predicted Mock Test 2024 - 01"
              description="Based on latest pattern & difficulty trends"
              duration="180m"
              questions={180}
              difficulty="Hard"
              locked={true}
            />
            <MockTestCard
              id="M2"
              title="National Mock Championship Paper"
              description="Participate to see your pan-India ranking"
              duration="180m"
              questions={180}
              difficulty="Medium"
              locked={false}
            />
          </div>
        </section>

        {/* Previous Year Papers */}
        <section className="py-4 sm:py-6 pb-8">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <span className="h-1 w-10 rounded-full bg-blue-500" />
            </div>
            <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Previous Year Papers
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[2023, 2022, 2021, 2020, 2019].map((year) => (
              <PreviousYearPaper key={year} exam="NEET" year={year} />
            ))}
            <div className="rounded-xl bg-card/60 border border-dashed border-border p-4 flex flex-col items-center justify-center min-h-[100px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <History className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              <p className="text-[10px] sm:text-xs font-semibold mt-1.5 text-muted-foreground">Archived</p>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 sm:right-6 bottom-28 sm:bottom-32 z-40 hidden xl:flex xl:flex-col gap-2 sm:gap-3">
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:scale-105 transition-all"
          title="Ask AI Tutor"
          type="button"
        >
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:border-blue-500/30 hover:scale-105 transition-all"
          title="Take Notes"
          type="button"
        >
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
        </button>
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:border-blue-500/30 hover:scale-105 transition-all"
          title="Flashcards"
          type="button"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
        </button>
      </div>

      <FooterComponent />
    </div>
  )
}

function StatCard({ label, value, suffix, color = 'text-foreground' }: StatCardProps) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border">
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{label}</p>
      <p className={cn('text-lg sm:text-xl md:text-2xl font-bold tabular-nums', color)}>
        {value} {suffix && <span className="text-xs sm:text-sm font-normal opacity-70">{suffix}</span>}
      </p>
    </div>
  )
}

function TestCard({
  subject,
  title,
  description,
  duration,
  questions,
  icon,
  iconBg,
  iconColor,
  borderColor,
}: TestCardProps) {
  return (
    <Card
      className={cn(
        'bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
        borderColor.replace('border-', 'hover:border-')
      )}
    >
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className={cn('p-2.5 sm:p-3 rounded-xl', iconBg, iconColor)}>{icon}</div>
          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/60 uppercase tracking-wider text-muted-foreground">
            {subject}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-foreground">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 line-clamp-2">{description}</p>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {duration}
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {questions} Qs
          </span>
        </div>
        <Button size="sm" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold">
          Start Test
        </Button>
      </CardContent>
    </Card>
  )
}

function MockTestCard({ id, title, description, duration, questions, difficulty, locked }: MockTestProps) {
  return (
    <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg transition-all hover:shadow-xl hover:border-blue-500/20 overflow-hidden">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className={cn(
                'h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0',
                locked
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {id}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-3 py-2 bg-muted/40 rounded-lg">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" /> {duration}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" /> {questions} Qs
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" /> {difficulty}
              </span>
            </div>
            {locked ? (
              <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 sm:px-8">
                Unlock & Start
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-xl font-semibold text-xs sm:text-sm px-6 sm:px-8 border-2">
                Start Test
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PreviousYearPaper({ exam, year }: PreviousYearPaperProps) {
  return (
    <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border p-4 text-center hover:shadow-lg hover:border-blue-500/30 transition-all cursor-pointer">
      <CardContent className="p-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mb-0.5">{exam}</p>
        <p className="text-lg sm:text-xl font-bold text-foreground">{year}</p>
        <div className="mt-2 sm:mt-3 flex justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Download className="h-4 w-4" />
          <PlayCircle className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  )
}
