'use client'

import React, { useState } from 'react'
import BulkCreateSubtopics from './BulkCreateSubtopics'
import SubtopicsFilter from './SubtopicsFilter'

type ActivePanel = 'create' | 'filter' | null

const barStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: '16px',
  marginBottom: '20px',
  width: '100%',
  minHeight: '40px',
}

export default function SubtopicsListBar() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  const leftStyle: React.CSSProperties =
    activePanel === 'filter'
      ? { flex: '0 0 0', minWidth: 0, maxWidth: 0, overflow: 'hidden', visibility: 'hidden' as const }
      : activePanel === 'create'
        ? { flex: '1 1 100%', minWidth: 0 }
        : { flex: '0 1 auto', minWidth: 0, maxWidth: '420px' }

  const rightStyle: React.CSSProperties =
    activePanel === 'create'
      ? { flex: '0 0 0', minWidth: 0, maxWidth: 0, overflow: 'hidden', visibility: 'hidden' as const }
      : activePanel === 'filter'
        ? { flex: '1 1 100%', minWidth: 0 }
        : { flex: '1 1 280px', minWidth: 0, maxWidth: '100%' }

  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        <BulkCreateSubtopics
          isExpanded={activePanel === 'create'}
          onExpandChange={(open) => setActivePanel(open ? 'create' : null)}
        />
      </div>
      <div style={rightStyle}>
        <SubtopicsFilter
          isExpanded={activePanel === 'filter'}
          onExpandChange={(open) => setActivePanel(open ? 'filter' : null)}
        />
      </div>
    </div>
  )
}
