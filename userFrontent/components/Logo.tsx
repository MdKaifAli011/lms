'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'

export default function Logo() {
  /* ================= CONFIG ================= */
  const BRAND_NAME = 'LmsDoors'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'calc(var(--base) * 1)',
        padding: 'calc(var(--base) * 0.5) 0',
      }}
    >
      {/* ===== ICON LOGO ===== */}
      <BookOpen
        size={32}
        style={{
          color: 'var(--theme-text)',
          flexShrink: 0,
        }}
      />

      {/* ===== TEXT BRAND ===== */}
      <span
        style={{
          fontSize: 'clamp(20px, 2vw, 28px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--theme-text)',
          whiteSpace: 'nowrap',
        }}
      >
        {BRAND_NAME}
      </span>
    </div>
  )
}
