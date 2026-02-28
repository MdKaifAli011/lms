'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface TopicsFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function TopicsFilter(props: TopicsFilterProps) {
  return <HierarchicalFilter collectionSlug="topics" {...props} />
}
