'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface ChaptersFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function ChaptersFilter(props: ChaptersFilterProps) {
  return <HierarchicalFilter collectionSlug="chapters" {...props} />
}
