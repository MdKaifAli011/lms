import React, { Fragment, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Type definitions for table nodes
interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number
  textAlign?: string
  [key: string]: any
}

interface ResponsiveTableProps {
  tableChildren?: LexicalNode[]
  className?: string
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ tableChildren, className }) => {
  console.log('ResponsiveTable received props:', { tableChildren })
  const renderNode = (node: LexicalNode, index: number): ReactNode => {
    if (!node) return null

    const { type, children: nodeChildren, text, format } = node
    
    // Debug logging
    console.log('ResponsiveTable renderNode:', { type, text, children: nodeChildren, index })
    
    const renderedChildren = nodeChildren?.map((child: LexicalNode, idx: number) => 
      renderNode(child, idx)
    )

    // Handle text nodes
    if (type === 'text') {
      let element: ReactNode = text ?? ''
      
      console.log('ResponsiveTable text node:', { text, element })

      if (format !== undefined) {
        const f = typeof format === 'number' ? format : 0
        if (f & 1) element = <strong key={`b-${index}`}>{element}</strong>
        if (f & 2) element = <em key={`i-${index}`}>{element}</em>
        if (f & 4) element = <s key={`s-${index}`} className="line-through">{element}</s>
        if (f & 8) element = <u key={`u-${index}`}>{element}</u>
        if (f & 16) {
          element = (
            <code 
              key={`c-${index}`}
              className="bg-gray-100/80 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 px-1.5 py-0.5 rounded-lg text-xs font-mono font-semibold text-gray-900 dark:text-gray-100 shadow-sm whitespace-nowrap"
            >
              {element}
            </code>
          )
        }
        if (f & 32) element = <sub key={`sub-${index}`}>{element}</sub>
        if (f & 64) element = <sup key={`sup-${index}`}>{element}</sup>
      }

      return <Fragment key={index}>{element}</Fragment>
    }

    // Handle paragraph nodes (common in table cells)
    if (type === 'paragraph') {
      return (
        <div key={index} className="text-inherit">
          {renderedChildren}
        </div>
      )
    }

    switch (type) {
      case 'tablerow':
        return (
          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
            {renderedChildren}
          </tr>
        )

      case 'tableheadcell':
      case 'tableheader':
      case 'tableHeadCell':
        return (
          <th
            key={index}
            className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm lg:text-base tracking-wide bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-700/60 text-gray-900 dark:text-white sticky top-0 z-10 shadow-sm border-r border-gray-200/50 dark:border-gray-700/50 last:border-r-0 whitespace-nowrap"
          >
            {renderedChildren || 'No content'}
          </th>
        )

      case 'tablecell':
      case 'tableCell':
        return (
          <td
            key={index}
            className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm lg:text-base leading-5 sm:leading-6 lg:leading-7 text-gray-700 dark:text-gray-300 border-r border-gray-100/50 dark:border-gray-800/50 last:border-r-0 min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]"
          >
            <div className="truncate sm:whitespace-normal sm:overflow-visible">
              {renderedChildren || <span className="text-muted-foreground">No content</span>}
            </div>
          </td>
        )

      default:
        console.log('ResponsiveTable unhandled type:', type)
        return null
    }
  }

  const renderTable = () => {
    if (!tableChildren) return null

    const headerRows: ReactNode[] = []
    const bodyRows: ReactNode[] = []

    tableChildren.forEach((child: LexicalNode, idx: number) => {
      if (child?.type === 'tablerow') {
        const hasHeaderCells = child.children?.some((cell: LexicalNode) =>
          cell?.type === 'tableheadcell' || cell?.type === 'tableheader'
        )
        if (hasHeaderCells) {
          headerRows.push(renderNode(child, idx))
        } else {
          bodyRows.push(renderNode(child, idx))
        }
      }
    })

    return (
      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        {headerRows.length > 0 && <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">{headerRows}</thead>}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">{bodyRows}</tbody>
      </table>
    )
  }

  return (
    <div className={cn('my-6 sm:my-8 lg:my-10 w-full', className)}>
      {/* Table container with fixed width to prevent layout break */}
      <div className="w-full max-w-[100vw] overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {/* Mobile table indicator - only visible on mobile */}
        <div className="sm:hidden px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            <svg className="w-4 h-4 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="whitespace-nowrap">Swipe table to see more columns</span>
          </div>
        </div>
        
        {/* Scrollable table container - constrained and isolated */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-lg">
          <div className="min-w-max">
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  )
}

ResponsiveTable.displayName = 'ResponsiveTable'

export { ResponsiveTable }
