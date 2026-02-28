import React from 'react'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const timelineSteps = [
  {
    step: '01',
    title: 'Diagnostic Baseline',
    description:
      'Choose your exam (NEET, JEE, CAT, etc.) and take a baseline assessment. We identify your strengths and gaps across subjects and units so your study plan targets what matters most.',
    label: 'Initial Assessment',
    side: 'left' as const,
    nodeActive: true,
  },
  {
    step: '02',
    title: 'Concept Mapping',
    description:
      'Explore the full curriculum: subjects, units, chapters, and topics in a clear hierarchy. See how concepts connect and build a complete mental map of the syllabus before you dive in.',
    label: 'Structure',
    side: 'right' as const,
    nodeActive: false,
  },
  {
    step: '03',
    title: 'Foundation Building',
    description:
      'Study structured content for every subject and unit. Master theory with expert notes and rich learning materials so you have a rock-solid foundation for each topic and subtopic.',
    label: 'Growth',
    side: 'left' as const,
    nodeActive: false,
  },
  {
    step: '04',
    title: 'Practice & Application',
    description:
      'Apply what you\'ve learned with topic-wise practice and chapter-level exercises. Use our practice tests and materials to build speed, accuracy, and confidence before mock tests.',
    label: 'Practice',
    side: 'right' as const,
    nodeActive: false,
  },
  {
    step: '05',
    title: 'Mock Tests & Simulation',
    description:
      'Take full-length mock tests that mirror real exam pattern and timing. Build exam stamina, manage pressure, and track your performance with our mock test hub and analytics.',
    label: 'Test',
    side: 'left' as const,
    nodeActive: false,
  },
  {
    step: '06',
    title: 'Performance Optimization',
    description:
      'Use insights from mocks and practice to pinpoint weak areas. Revise by subject and unit, focus on high-weight topics, and optimize your plan so you peak on exam day.',
    label: 'Refine',
    side: 'right' as const,
    nodeActive: false,
  },
  {
    step: '07',
    title: 'Absolute Exam Mastery',
    description:
      'Final revision, strategy, and exam-day readiness. You\'ve covered the curriculum, practiced, and tested—now deliver your best and aim for the top ranks.',
    label: 'Target: Rank 1',
    side: 'left' as const,
    isFinal: true,
  },
]

export function MasteryPathSection() {
  return (
    <section
      id="mastery"
      className="relative overflow-x-hidden py-14 sm:py-20 md:py-24 lg:py-32 px-3 min-[480px]:px-4 sm:px-5 md:px-6 bg-muted/30 dark:bg-muted/20 border-y border-border"
    >
      <div className="max-w-4xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="mb-10 sm:mb-14 md:mb-16 lg:mb-24 text-center px-1">
          <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 md:mb-6 text-foreground leading-tight">
            The 7-Level Mastery Path
          </h2>
          <p className="text-sm min-[480px]:text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground px-1">
            From diagnostic assessment to exam-day mastery—a proven, step-by-step framework designed by experts to take you to the top ranks.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - responsive: align with node on mobile, center on md+ */}
          <div
            className="absolute left-[15px] sm:left-5 md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-1/2 pointer-events-none bg-border"
            aria-hidden
          />
          <div
            className="absolute left-[15px] sm:left-5 md:left-1/2 top-0 bottom-0 w-[2px] opacity-50 md:-translate-x-1/2 pointer-events-none bg-gradient-to-b from-transparent via-primary to-transparent"
            aria-hidden
          />

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {timelineSteps.map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col md:flex-row items-stretch md:items-center group"
              >
                {/* Column A: label (left rows) or card (right rows) - desktop only for labels/card swap */}
                <div
                  className={cn(
                    'flex-1 w-full min-w-0 mb-4 md:mb-0 hidden md:block',
                    item.side === 'left'
                      ? 'md:text-right md:pr-8 lg:pr-12'
                      : 'md:pl-8 lg:pl-12 md:order-1'
                  )}
                >
                  {item.side === 'left' ? (
                    <span
                      className={cn(
                        'text-xs font-black tracking-widest uppercase',
                        item.nodeActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <div
                      className={cn(
                        'p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 md:text-right',
                        'bg-card backdrop-blur-xl border border-border shadow-lg',
                        'hover:border-primary/40 hover:shadow-xl'
                      )}
                    >
                      <div className="flex items-center md:flex-row-reverse gap-3 sm:gap-4 mb-1.5 sm:mb-2">
                        <span className="text-xl sm:text-2xl font-black text-primary/70">
                          {item.step}
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p
                        className={cn(
                          'text-xs sm:text-sm text-muted-foreground leading-relaxed',
                          item.isFinal && 'font-bold text-primary'
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center node - responsive size */}
                <div
                  className={cn(
                    'z-10 flex items-center justify-center flex-shrink-0 md:order-2 self-start md:self-center mt-0.5 md:mt-0',
                    item.isFinal ? 'size-9 sm:size-10 md:size-12' : 'size-8 sm:size-9 md:size-10'
                  )}
                >
                  {item.isFinal ? (
                    <div
                      className={cn(
                        'rounded-full border-2 sm:border-4 flex items-center justify-center w-full h-full',
                        'bg-primary border-primary/30',
                        'shadow-[0_0_30px_-2px_hsl(var(--primary)_/_0.6)]'
                      )}
                    >
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'rounded-full border-2 sm:border-4 flex items-center justify-center shrink-0 w-full h-full',
                        'bg-background',
                        item.nodeActive
                          ? 'border-primary shadow-[0_0_20px_-5px_hsl(var(--primary)_/_0.5)]'
                          : 'border-border group-hover:border-primary transition-colors'
                      )}
                    >
                      <span
                        className={cn(
                          'rounded-full transition-colors shrink-0',
                          item.nodeActive
                            ? 'size-1.5 sm:size-2 bg-primary animate-pulse'
                            : 'size-1.5 sm:size-2 bg-muted-foreground group-hover:bg-primary'
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Column B: card (left rows) or label (right rows) - mobile: always card below node */}
                <div
                  className={cn(
                    'flex-1 w-full min-w-0 md:order-3',
                    item.side === 'left'
                      ? 'md:pl-8 lg:pl-12 ml-5 sm:ml-6 md:ml-0'
                      : 'md:pr-8 lg:pr-12 mr-5 sm:mr-6 md:mr-0 md:pl-8 lg:pl-12'
                  )}
                >
                  {item.side === 'left' ? (
                    <div
                      className={cn(
                        'p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300',
                        'bg-card backdrop-blur-xl border border-border shadow-lg',
                        'hover:border-primary/40 hover:shadow-xl'
                      )}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-1.5 sm:mb-2">
                        <span className="text-xl sm:text-2xl font-black text-primary/70">
                          {item.step}
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p
                        className={cn(
                          'text-xs sm:text-sm text-muted-foreground leading-relaxed',
                          item.isFinal && 'font-bold text-primary'
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="md:hidden">
                        <div
                          className={cn(
                            'p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300',
                            'bg-card backdrop-blur-xl border border-border shadow-lg',
                            'hover:border-primary/40'
                          )}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 mb-1.5 sm:mb-2">
                            <span className="text-xl sm:text-2xl font-black text-primary/70">
                              {item.step}
                            </span>
                            <h4 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                              {item.title}
                            </h4>
                          </div>
                          <p
                            className={cn(
                              'text-xs sm:text-sm text-muted-foreground leading-relaxed',
                              item.isFinal && 'font-bold text-primary'
                            )}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <span
                          className={cn(
                            'text-xs font-black tracking-widest uppercase',
                            item.isFinal ? 'text-primary italic' : 'text-muted-foreground'
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
