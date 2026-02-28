'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

export default function BulkImportNavLink() {
  const router = useRouter()

  return (
    <div
      style={{
        padding: '8px 16px',
        margin: '8px 0',
        borderTop: '1px solid var(--theme-border-color)',
        paddingTop: '16px',
      }}
    >
      <button
        onClick={() => router.push('/admin/bulk-import')}
        style={{
          padding: '8px 12px',
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: '1px solid var(--theme-border-color)',
          color: 'var(--theme-text)',
          cursor: 'pointer',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
          e.currentTarget.style.borderColor = 'var(--theme-elevation-400)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.borderColor = 'var(--theme-border-color)'
        }}
      >
        <span>📥</span>
        <span>Bulk Import</span>
      </button>
    </div>
  )
}
