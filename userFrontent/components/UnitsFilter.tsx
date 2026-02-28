'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface UnitsFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function UnitsFilter(props: UnitsFilterProps) {
  return <HierarchicalFilter collectionSlug="units" {...props} />
}
