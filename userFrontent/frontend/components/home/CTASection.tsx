import React from 'react'
import Link from 'next/link'

/**
 * "Step Through the Door" CTA section — works in both light and dark mode.
 * Based on homepage.html (368–384): premium glass card, headline, subtext, two CTAs, background glow.
 */
export function CTASection() {
  return (
    <section className="relative overflow-x-hidden py-10 sm:py-14 md:py-16 lg:py-20 px-3 min-[480px]:px-4 sm:px-5 md:px-6">
      {/* Background glow — visible in both modes */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl sm:max-w-3xl bg-primary/10 dark:bg-primary/15 blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full min-w-0">
        <div
          className={[
            'rounded-lg sm:rounded-xl md:rounded-2xl text-center relative',
            'p-4 sm:p-6 md:p-8 lg:p-10',
            'bg-slate-50/90 dark:bg-white/[0.04]',
            'border border-slate-200/80 dark:border-white/[0.08]',
            'backdrop-blur-xl',
            'shadow-lg shadow-slate-200/30 dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]',
            'bg-primary/[0.04] dark:bg-primary/5',
            'border-primary/20 dark:border-primary/20',
            'hover:border-primary/30 dark:hover:border-primary/30',
            'hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-[0_25px_60px_-15px_hsl(var(--primary)_/_0.15)]',
            'transition-all duration-300',
          ].join(' ')}
        >
          <h2 className="text-xl min-[480px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-5 tracking-tight text-slate-900 dark:text-white leading-tight break-words">
            Step Through the <span className="text-primary italic">Door</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-5 md:mb-6 text-xs min-[480px]:text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-0.5">
            Over 50,000 students have used LMS Doors to secure their future. Your rank is waiting.
          </p>
          <div className="flex flex-col min-[480px]:flex-row flex-wrap gap-2.5 sm:gap-3 justify-center items-stretch min-[480px]:items-center">
            <Link
              href="/exam"
              className="min-h-[44px] min-[480px]:min-h-0 w-full min-[480px]:w-auto inline-flex justify-center items-center px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground text-sm sm:text-base font-bold rounded-lg shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.5)] hover:shadow-[0_0_24px_-4px_hsl(var(--primary)_/_0.6)] hover:opacity-95 active:scale-[0.98] transition-all duration-200"
            >
              Start 7-Day Free Pass
            </Link>
            <Link
              href="#"
              className={[
                'min-h-[44px] min-[480px]:min-h-0 w-full min-[480px]:w-auto inline-flex justify-center items-center px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200',
                'bg-white/80 dark:bg-white/5',
                'border border-slate-300 dark:border-white/10',
                'text-slate-800 dark:text-white',
                'hover:bg-slate-100 dark:hover:bg-white/10',
                'hover:border-slate-400 dark:hover:border-white/20',
              ].join(' ')}
            >
              Request Counseling
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
