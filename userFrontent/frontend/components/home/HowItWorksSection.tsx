import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    step: '01',
    title: 'Choose Your Exam',
    description:
      'Sign up and select the exam you want to prepare for from our curated list.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    step: '02',
    title: 'Learn & Practice',
    description:
      'Study with structured lessons, expert notes, and topic-wise practice tests.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    step: '03',
    title: 'Track & Succeed',
    description:
      'Monitor your progress, revise smartly, and score with confidence.',
    gradient: 'from-blue-500 to-indigo-500',
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative container mx-auto px-4 py-24">
      {/* Background subtle grid (edu feel) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff12_1px,transparent_1px)] bg-[size:18px_18px]" />

      {/* Header */}
      <div className="mb-20 text-center">
        <span className="inline-block mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          Getting Started
        </span>

        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          How It Works
        </h3>

        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
          Start your preparation journey with a simple, proven learning flow
          designed by exam experts.
        </p>
      </div>

      {/* Steps */}
      <div className="relative grid gap-8 md:grid-cols-3">
        {/* Connector line (desktop only) */}
        <div className="hidden md:block absolute top-14 left-0 right-0 h-px bg-border" />

        {steps.map((item, index) => (
          <Card
            key={item.step}
            className="
              relative h-full bg-background
              border border-border/60
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl
            "
          >
            {/* Top gradient */}
            <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />

            <CardContent className="p-8 text-center">
              {/* Step bubble */}
              <div
                className={`
                  mx-auto mb-6 flex h-14 w-14 items-center justify-center
                  rounded-full bg-gradient-to-br ${item.gradient}
                  text-white text-sm font-bold
                `}
              >
                {item.step}
              </div>

              {/* Title */}
              <h4 className="text-lg font-semibold text-foreground mb-3">
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              {/* Step index (subtle) */}
              <span className="absolute top-4 right-4 text-xs font-medium text-muted-foreground">
                Step {index + 1}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
