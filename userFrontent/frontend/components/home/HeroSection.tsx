import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Play, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GradientBg } from '@/components/ui/gradient-bg'

export function HeroSection() {
  return (
    <GradientBg
      variant="subtle"
      intensity="low"
      className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen overflow-x-hidden"
    >
      {/* Dotted grid */}
      <div
        className="absolute inset-0 -z-30 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] [background-size:18px_18px] sm:[background-size:22px_22px]"
        aria-hidden
      />

      {/* Gradient glows — responsive size and position */}
      <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] rounded-full bg-primary/15 sm:bg-primary/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />
      <div className="absolute top-1/4 right-0 sm:top-1/3 sm:-right-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] rounded-full bg-primary/10 sm:bg-indigo-500/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-14 sm:pt-16 md:pt-20 lg:pt-24 pb-14 sm:pb-16 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* ================= LEFT ================= */}
          <div className="space-y-5 sm:space-y-6 md:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-border bg-background/80"
            >
              <span className="mr-1.5 sm:mr-2 inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary shrink-0" />
              New: JEE Advanced Batch 2025
            </Badge>

            {/* Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="leading-[1.1] tracking-tight">
                <span className="block text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                  Master Your
                </span>
                <span className="block text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary mt-0.5">
                  Entrance Exams
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-sm min-[480px]:text-base sm:text-lg text-muted-foreground leading-relaxed">
                Elevate your preparation with our premium AI-powered platform.
                Structured curriculum, real-time analytics, and expert mentorship
                designed for the next generation of top rankers.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col min-[480px]:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="default"
                className="w-full min-[480px]:w-auto gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold rounded-xl shadow-[0_0_20px_-6px_hsl(var(--primary)_/_0.4)] hover:opacity-95"
                asChild
              >
                <Link href="/exam">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="w-full min-[480px]:w-auto gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold rounded-xl border-2"
                asChild
              >
                <Link href="#">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', '+1k'].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-background dark:border-background bg-muted flex items-center justify-center text-[10px] sm:text-xs font-medium text-foreground"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Join <span className="font-semibold text-foreground">50,000+</span>{' '}
                ambitious students worldwide
              </p>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="relative">
            <Card className="rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-xl min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                    Live Performance
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Real-time study streak analytics
                  </p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shrink-0 text-[10px] sm:text-xs">
                  ● LIVE
                </Badge>
              </div>

              <LeaderboardRow
                rank="01"
                name="Sarah Jenkins"
                meta="Physics Master • 12 Day Streak"
                points="2,840"
              />
              <LeaderboardRow
                active
                rank="02"
                name="You"
                meta="Calculus Expert • 8 Day Streak"
                points="2,410"
              />
              <LeaderboardRow
                rank="03"
                name="Leon Zhang"
                meta="Chemistry Pro • 5 Day Streak"
                points="2,150"
              />
            </Card>

            {/* Floating growth — hidden on small screens to avoid overflow */}
            <Card className="hidden md:block absolute -right-4 -bottom-6 lg:-right-6 lg:-bottom-8 w-36 lg:w-44 rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-lg bg-background border border-border z-10">
              <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary shrink-0" />
                Growth
              </div>
              <p className="mt-0.5 lg:mt-1 text-base lg:text-lg font-semibold text-primary">
                +18.5%
              </p>
              <div className="mt-2 lg:mt-3 flex items-end gap-0.5 lg:gap-1 h-8 lg:h-12">
                {[2, 4, 6, 4, 8, 6].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h * 4}px` }}
                    className="w-1.5 lg:w-2 rounded-full bg-primary/70 min-h-[4px]"
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ================= TRUST ================= */}
        <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-28 border-t border-border pt-6 sm:pt-8 md:pt-10 text-center">
          <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-4 sm:mb-6 uppercase">
            Trusted by students at elite global institutions
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 text-sm sm:text-base md:text-lg font-semibold text-muted-foreground">
            <span>Oxford</span>
            <span>Stanford</span>
            <span>MIT</span>
            <span>Harvard</span>
            <span>Princeton</span>
          </div>
        </div>
      </div>
    </GradientBg>
  )
}

function LeaderboardRow({
  rank,
  name,
  meta,
  points,
  active,
}: {
  rank: string
  name: string
  meta: string
  points: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition min-w-0 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/50 dark:bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span
          className={`text-xs sm:text-sm font-semibold shrink-0 ${
            active ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {rank}
        </span>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 dark:bg-background/50 flex items-center justify-center shrink-0 text-sm">
          👤
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold truncate">{name}</p>
          <p
            className={`text-[10px] sm:text-xs truncate ${
              active
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            }`}
          >
            {meta}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs sm:text-sm font-semibold">{points}</p>
        <p className="text-[9px] sm:text-[10px] opacity-70">PTS</p>
      </div>
    </div>
  )
}
