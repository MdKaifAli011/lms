'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface SubtopicsFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function SubtopicsFilter(props: SubtopicsFilterProps) {
  return <HierarchicalFilter collectionSlug="subtopics" {...props} />
}
