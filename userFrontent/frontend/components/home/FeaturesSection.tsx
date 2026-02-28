import React from 'react'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Users,
  Gamepad2,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Pro Mock Tests',
    description:
      'Adaptive difficulty engines that mimic the exact pattern of 2024 entrance exams with predictive analytics.',
    href: '/mock-tests',
    label: 'Enter Exam Simulator',
    badge: 'USED BY TOP 10 RANKERS',
    primaryIcon: true,
  },
  {
    icon: BookOpen,
    title: 'Material Archive',
    description:
      '25 years of year-wise solved archives with AI-generated step-by-step video solutions for every problem.',
    href: '/materials',
    label: 'Browse Archive',
  },
  {
    icon: Users,
    title: 'Prime Community',
    description:
      'Exclusive mastermind groups with mentors from Top IITs, AIIMS, and Ivy League universities.',
    href: '#',
    label: 'Join Discussion',
  },
  {
    icon: Gamepad2,
    title: 'Gamified XP',
    description:
      'Turn your revision into a quest. Earn XP for streaks, unlock milestones, and win monthly scholarships.',
    href: '#',
    label: 'View Leaderboard',
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-x-hidden py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 px-4 sm:px-5 md:px-6"
    >
      <div className="max-w-7xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="mb-10 sm:mb-14 md:mb-16 lg:mb-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2 sm:mb-3 md:mb-4 tracking-tight">
            Elite Features
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            The technology stack behind your success.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group block h-full"
              >
                <article
                  className={cn(
                    'h-full flex flex-col rounded-xl sm:rounded-2xl md:rounded-[2rem] p-5 sm:p-6 md:p-8 relative overflow-hidden',
                    'bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border',
                    'shadow-lg hover:shadow-xl',
                    'hover:border-primary/30 hover:-translate-y-1 sm:hover:-translate-y-2',
                    'transition-all duration-300'
                  )}
                >
                  {feature.badge && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-4 md:right-6">
                      <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight">
                        <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        {feature.badge}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      'size-12 sm:size-14 md:size-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 mb-5 sm:mb-6 md:mb-8 transition-colors',
                      feature.primaryIcon
                        ? 'bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary)_/_0.5)]'
                        : 'bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10'
                    )}
                  >
                    <Icon
                      className={cn(
                        'text-2xl sm:text-3xl transition-colors',
                        feature.primaryIcon
                          ? 'text-primary group-hover:text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>

                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 leading-tight pr-16 sm:pr-0">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5 sm:mb-6 md:mb-8 flex-1">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 text-primary font-bold text-xs sm:text-sm group-hover:underline">
                    {feature.label}
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </article>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
