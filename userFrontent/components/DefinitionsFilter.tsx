'use client'
import React from 'react'
import HierarchicalFilter from './HierarchicalFilter'

interface DefinitionsFilterProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function DefinitionsFilter(props: DefinitionsFilterProps) {
  return <HierarchicalFilter collectionSlug="definitions" {...props} />
}
