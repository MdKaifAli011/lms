'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'

export default function Icon() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BookOpen
        size={15}
        style={{
          color: 'var(--theme-text)',
        }}
      />
    </div>
  )
}
