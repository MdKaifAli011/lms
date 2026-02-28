'use client'

import React from 'react'

const TICKER_ITEMS = [
  '1,452 students are currently practicing JEE Physics',
  '3,120 students just completed a NEET Mock Test',
  'Aarav S. from Delhi reached Level 06 (Mastery)',
  '890 tutors are currently answering live doubts',
  '2,840+ mock tests taken this week across all exams',
]

function TickerItem({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 shrink-0 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap mx-4">
      <span className="size-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden />
      {text}
    </span>
  )
}

export function FooterTicker() {
  const duplicated = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="border-y border-border py-2 sm:py-2.5 bg-primary/5 mb-6 overflow-hidden w-full" aria-label="Live activity ticker">
      <div className="ticker-track py-1">
        {duplicated.map((text, i) => (
          <TickerItem key={`${i}-${text.slice(0, 15)}`} text={text} />
        ))}
      </div>
    </div>
  )
}
