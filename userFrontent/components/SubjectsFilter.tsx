'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface SubjectsFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function SubjectsFilter(props: SubjectsFilterProps) {
  return <HierarchicalFilter collectionSlug="subjects" {...props} />
}
