'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface InfoBoxData {
  type: 'note' | 'tip' | 'warning'
  content: any // Lexical content
  title?: string
  dismissible?: boolean
  expandable?: boolean
  shareable?: boolean
}

interface InteractiveInfoBoxProps {
  data: InfoBoxData
  className?: string
  onDismiss?: () => void
}

export function InteractiveInfoBox({
  data,
  className,
  onDismiss,
}: InteractiveInfoBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const type = data.type || 'note'
  const content = data.content
  const dismissible = data.dismissible ?? false

  // Get type-specific styling and icons (original simple design)
  const getInfoBoxConfig = (type: string) => {
    switch (type) {
      case 'note':
        return {
          icon: 'ℹ️',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500',
        }
      case 'tip':
        return {
          icon: '💡',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-500',
        }
      case 'warning':
        return {
          icon: '⚠️',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-500',
        }
      default:
        return {
          icon: 'ℹ️',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500',
        }
    }
  }

  const config = getInfoBoxConfig(type)

  // Render Lexical content (simplified)
  const renderContent = (content: any) => {
    if (!content || !content.root) return null
    
    const renderNode = (node: any, index: number): React.ReactNode => {
      if (!node) return null

      const { type, children, text, format, ...rest } = node

      // Handle text nodes
      if (type === 'text') {
        let element: React.ReactNode = text

        if (format !== undefined) {
          const f = typeof format === 'number' ? format : 0
          // Bitwise flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
          if (f & 1) element = <strong key="b">{element}</strong>
          if (f & 2) element = <em key="i">{element}</em>
          if (f & 4) element = <s key="s" className="line-through">{element}</s>
          if (f & 8) element = <u key="u">{element}</u>
          if (f & 16) {
            element = (
              <code key="c" className="bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-600 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-nowrap inline-block">
                {element}
              </code>
            )
          }
          if (f & 32) element = <sub key="sub">{element}</sub>
          if (f & 64) element = <sup key="sup">{element}</sup>
        }

        return element
      }

      // Handle other node types (simplified for info box)
      switch (type) {
        case 'paragraph':
          return <p key={index} className="mb-2 last:mb-0">{children?.map((child: any, idx: number) => renderNode(child, idx))}</p>
        case 'heading':
          const Tag = (rest.tag || rest.headingSize || 'h3') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
          return <Tag key={index} className="font-semibold mb-2">{children?.map((child: any, idx: number) => renderNode(child, idx))}</Tag>
        case 'list':
          const ListTag = rest.listType === 'number' ? 'ol' : 'ul'
          return (
            <ListTag key={index} className="mb-2 space-y-1 pl-4">
              {children?.map((child: any, idx: number) => (
                <li key={idx} className="mb-1">{renderNode(child, idx)}</li>
              ))}
            </ListTag>
          )
        case 'listitem':
          return <li key={index}>{children?.map((child: any, idx: number) => renderNode(child, idx))}</li>
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
              {children?.map((child: any, idx: number) => renderNode(child, idx))}
            </blockquote>
          )
        case 'link':
          const url = rest.url || rest.fields?.url
          return (
            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              {children?.map((child: any, idx: number) => renderNode(child, idx))}
            </a>
          )
        default:
          return children?.map((child: any, idx: number) => renderNode(child, idx))
      }
    }

    return content.root?.children?.map((child: any, idx: number) => renderNode(child, idx))
  }

  // Copy content to clipboard
  const copyToClipboard = async () => {
    try {
      const textContent = content?.root?.children?.map((child: any) => {
        if (child.type === 'text') return child.text
        return ''
      }).join(' ').trim()
      
      if (textContent) {
        await navigator.clipboard.writeText(textContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className={cn("my-4", className)}>
      <div className={cn(
        "p-3 sm:p-4 rounded-r-lg border-l-4",
        config.bg,
        config.border
      )}>
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl flex-shrink-0">{config.icon}</span>
          <div className="flex-1 min-w-0">
            {data.title && (
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {data.title}
              </h4>
            )}
            <div className={cn(
              !isExpanded && "line-clamp-3"
            )}>
              {renderContent(content)}
            </div>
            
            {data.expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          
          {/* Action buttons - Responsive spacing */}
          <div className="flex items-center gap-1 ml-2 sm:ml-3 flex-shrink-0">
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 sm:p-2"
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? '✓' : '📋'}
            </button>
            
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 sm:p-2"
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
