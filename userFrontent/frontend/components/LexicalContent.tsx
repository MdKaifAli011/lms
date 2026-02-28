'use client'

import React, { Fragment, ReactNode } from 'react'
import { InteractiveQuiz } from './blocks/InteractiveQuiz'
import { InteractiveTable } from './blocks/InteractiveTable'
import { InteractiveFileEmbed } from './blocks/InteractiveFileEmbed'
import { InteractiveInfoBox } from './blocks/InteractiveInfoBox'
import { InteractiveYouTube } from './blocks/InteractiveYouTube'
import { ResponsiveTable } from './ResponsiveTable'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

// Type definitions for Lexical nodes
interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number
  textAlign?: string
  [key: string]: any
}

interface LexicalTextNode extends LexicalNode {
  type: 'text'
  text: string
  /** Inline style from payloadcms-lexical-ext (e.g. "color: #333; background-color: #ff0") */
  style?: string
}

interface LexicalBlockNode extends LexicalNode {
  fields?: {
    blockType?: string
    [key: string]: any
  }
}

interface LexicalContentProps {
  content: {
    root: {
      children: LexicalNode[]
    }
  } | null
}

interface ParsedCSVRow {
  [key: string]: string
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/** Parse payloadcms-lexical-ext style string into React CSSProperties */
function parseTextNodeStyle(styleStr: string | undefined): CSSProperties | undefined {
  if (!styleStr || typeof styleStr !== 'string') return undefined
  const style: Record<string, string> = {}
  styleStr.split(';').forEach((part) => {
    const [key, value] = part.split(':').map((s) => s?.trim())
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      style[camelKey] = value
    }
  })
  return Object.keys(style).length ? (style as CSSProperties) : undefined
}

const LexicalContent: React.FC<LexicalContentProps> = ({ content }) => {
  if (!content?.root) return null

  const parseCSVRow = (row: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < row.length; i += 1) {
      const char = row[i]
      const nextChar = row[i + 1]

      if (char === '"' && nextChar === '"') {
        current += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const renderNode = (node: LexicalNode, index: number): ReactNode => {
    if (!node) return null

    const { type, children, text, format, ...rest } = node
    const renderedChildren = children?.map((child: LexicalNode, idx: number) =>
      renderNode(child, idx)
    )

    if (type === 'text') {
      const textNode = node as LexicalTextNode
      let element: ReactNode = textNode.text ?? ''

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

      const inlineStyle = parseTextNodeStyle(textNode.style)
      if (inlineStyle) {
        element = <span key={`style-${index}`} style={inlineStyle}>{element}</span>
      }

      return <Fragment key={index}>{element}</Fragment>
    }

    if (type === 'linebreak') return <br key={index} />
    if (type === 'horizontalrule') {
      return (
        <hr
          key={index}
          className="my-6 border-gray-200 dark:border-gray-700/50"
          style={{ borderStyle: 'solid' } as CSSProperties}
        />
      )
    }

    const getAlignmentClass = (): string => {
      const align = node.textAlign || rest.textAlign || rest.alignment || node.format || 'left'
      const alignmentMap: Record<string, string> = {
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      }
      return alignmentMap[align as keyof typeof alignmentMap] || ''
    }

    const alignmentClass = getAlignmentClass()

    switch (type) {
      case 'root':
        return (
          <article key={index} className="space-y-3 sm:space-y-4 lg:space-y-5 max-w-none overflow-x-hidden">
            {renderedChildren}
          </article>
        )

      case 'paragraph':
        return (
          <p
            key={index}
            className={cn(
              'mb-3 sm:mb-4 lg:mb-5 leading-5 sm:leading-6 lg:leading-7 text-gray-700 dark:text-gray-300 text-xs sm:text-sm lg:text-base font-normal tracking-wide break-words hyphens-auto',
              alignmentClass
            )}
          >
            {renderedChildren}
          </p>
        )

      case 'heading': {
        const tagMap: Partial<Record<string, HeadingTag>> = {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
        }
        const Tag = (tagMap[rest.tag || rest.headingSize] || 'h2') as HeadingTag
        const headingClasses = cn(
          'font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4 mt-4 sm:mt-6 lg:mt-8 scroll-m-20',
          alignmentClass,
          Tag === 'h1' && 'text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-white',
          Tag === 'h2' && 'text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white',
          Tag === 'h3' && 'text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white/95',
          Tag === 'h4' && 'text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white/90 font-semibold',
          Tag === 'h5' && 'text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white/85 font-semibold',
          Tag === 'h6' && 'text-xs sm:text-sm lg:text-base text-gray-900 dark:text-white/80 font-semibold uppercase tracking-wider'
        )
        return React.createElement(Tag, { key: index, className: headingClasses }, renderedChildren)
      }

      case 'list': {
        const ListTag = rest.listType === 'number' ? 'ol' : 'ul'
        const listClasses = cn(
          'mb-4 sm:mb-6 lg:mb-8 space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm lg:text-base',
          alignmentClass,
          rest.listType === 'number' ? 'list-decimal ml-4 sm:ml-6 lg:ml-8' : 'list-disc ml-4 sm:ml-6 lg:ml-8'
        )
        return React.createElement(ListTag, { key: index, className: listClasses }, renderedChildren)
      }

      case 'listitem': {
        if (rest.checked !== undefined) {
          return (
            <li key={index} className="mb-2 sm:mb-3 lg:mb-4 flex items-start gap-2 sm:gap-3 lg:gap-4 list-none text-xs sm:text-sm lg:text-base">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(rest.checked)}
                  disabled
                  className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white dark:bg-gray-800 cursor-default shadow-sm"
                />
              </div>
              <span className={cn('flex-1 py-0.5 leading-5 sm:leading-6 lg:leading-7', rest.checked && 'line-through decoration-2 decoration-gray-400/50 dark:decoration-gray-500/50')}>
                {renderedChildren}
              </span>
            </li>
          )
        }
        return (
          <li key={index} className={cn('mb-1 sm:mb-2 lg:mb-3 py-1 leading-5 sm:leading-6 lg:leading-7 text-xs sm:text-sm lg:text-base', alignmentClass)}>
            {renderedChildren}
          </li>
        )
      }

      case 'quote':
        return (
          <blockquote
            key={index}
            className={cn(
              'border-l-2 sm:border-l-3 lg:border-l-4 border-blue-400 dark:border-blue-500 pl-3 sm:pl-4 lg:pl-5 pr-2 sm:pr-3 lg:pr-4 my-4 sm:my-6 lg:my-8 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-sm rounded-r-lg sm:rounded-r-xl lg:rounded-r-2xl shadow-sm',
              alignmentClass
            )}
          >
            <div className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 italic font-medium leading-5 sm:leading-6 lg:leading-7">
              {renderedChildren}
            </div>
          </blockquote>
        )

      case 'link': {
        const url = rest.url || rest.fields?.url
        if (!url) return renderedChildren
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1 sm:gap-2 lg:gap-3 px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 rounded-md sm:rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 break-words max-w-full',
              'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20 hover:from-blue-500/20 hover:to-indigo-500/20 shadow-sm border border-blue-200/50 dark:border-blue-600/30 hover:shadow-md',
              'text-blue-600 dark:text-blue-400'
            )}
          >
            <span className="truncate">{renderedChildren}</span>
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )
      }

      case 'table':
      case 'tableNode':
        // Debug logging to see what data we're passing
        console.log('LexicalContent table case:', { children, node: rest })
        return (
          <ResponsiveTable key={index} tableChildren={children} />
        )

      case 'block': {
        const blockNode = node as LexicalBlockNode
        const blockType = blockNode.fields?.blockType
        const fields = blockNode.fields || {}

        if (blockType === 'youtube' && fields.url) {
          return (
            <div key={index} className="my-6 sm:my-8 lg:my-10">
              <div className="relative rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg lg:shadow-xl bg-black">
                <InteractiveYouTube
                  data={{
                    url: fields.url,
                    title: fields.title,
                    description: fields.description,
                    startTime: fields.startTime,
                    endTime: fields.endTime,
                    autoplay: fields.autoplay,
                    controls: fields.controls,
                    mute: fields.mute,
                    loop: fields.loop,
                  }}
                  aspectRatio="16:9"
                  showInfo
                  allowFullscreen
                />
              </div>
            </div>
          )
        }

        if (blockType === 'math' && fields.latex) {
          return (
            <div
              key={index}
              className="my-4 sm:my-6 lg:my-8 p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-orange-50/80 to-yellow-50/80 dark:from-orange-900/40 dark:to-yellow-900/40 border border-orange-200/60 dark:border-orange-700/60 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl backdrop-blur-sm"
            >
              <div className="text-xs sm:text-sm lg:text-base font-mono font-semibold text-gray-900 dark:text-orange-100 leading-relaxed tracking-tight break-all">
                {fields.latex}
              </div>
            </div>
          )
        }

        if (blockType === 'info' || blockType === 'infoBox') {
          return (
            <div key={index} className="my-6 sm:my-8 lg:my-10">
              <InteractiveInfoBox
                data={{
                  type: fields.type || 'note',
                  content: fields.content,
                  title: fields.title,
                  dismissible: fields.dismissible,
                  expandable: fields.expandable,
                  shareable: fields.shareable,
                }}
              />
            </div>
          )
        }

        if (blockType === 'quiz') {
          return (
            <InteractiveQuiz
              key={index}
              quizTitle={fields.quizTitle}
              timeLimit={fields.timeLimit}
              questions={fields.questions || []}
            />
          )
        }

        if (blockType === 'file' && fields.file) {
          return (
            <div key={index} className="my-6 sm:my-8 lg:my-10">
              <InteractiveFileEmbed
                data={{ file: fields.file, displayName: fields.displayName, description: fields.description }}
                showPreview
                allowDownload
              />
            </div>
          )
        }

        if (blockType === 'csvTable' && fields.csv) {
          const rows = fields.csv.split('\n').filter(Boolean)
          if (!rows.length) return null

          const parsedRows = rows.map(parseCSVRow)
          const headers = parsedRows[0] || []
          const dataRows = parsedRows.slice(1)

          const columns = headers.map((header: string, columnIndex: number) => ({
            key: `col_${columnIndex}`,
            title: header || `Column ${columnIndex + 1}`,
            sortable: true,
            filterable: true,
            type: 'text' as const,
          }))

          const tableData: ParsedCSVRow[] = dataRows.map((row: string[]) => {
            const obj: ParsedCSVRow = {}
            row.forEach((cell: string, index: number) => {
              obj[`col_${index}`] = cell
            })
            return obj
          })

          return (
            <div key={index} className="my-6 sm:my-8 lg:my-10">
              <div className="rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm sm:shadow-md lg:shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                <InteractiveTable
                  data={tableData}
                  columns={columns}
                  title="Data Table"
                  description="Interactive table with search, sort, and filter capabilities"
                  searchable
                  filterable
                  sortable
                  exportable
                  maxHeight="400px"
                />
              </div>
            </div>
          )
        }

        if (blockType === 'code' && fields.code) {
          return (
            <div key={index} className="my-4 sm:my-6 lg:my-8 group">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-t-md sm:rounded-t-lg lg:rounded-t-xl border-b border-gray-700/50 shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300 bg-gray-800/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  {fields.language || 'text'}
                </span>
              </div>
              <pre className="p-3 sm:p-4 lg:p-5 overflow-x-auto rounded-b-md sm:rounded-b-lg lg:rounded-b-xl bg-gray-900/95 dark:bg-gray-900/98 border border-gray-700/50 shadow-md sm:shadow-lg lg:shadow-xl backdrop-blur-sm text-xs sm:text-sm lg:text-base font-mono leading-4 sm:leading-5 lg:leading-6 text-gray-100">
                <code className="whitespace-pre-wrap break-all sm:whitespace-pre">{fields.code}</code>
              </pre>
            </div>
          )
        }

        if (blockType === 'coloredText') {
          const colorClasses: Record<string, string> = {
            blue: 'from-blue-500/20 via-blue-500/10 to-indigo-500/20 text-blue-700 dark:from-blue-400/30 dark:via-blue-400/20 dark:to-indigo-400/30 dark:text-blue-300',
            red: 'from-red-500/20 via-red-500/10 to-pink-500/20 text-red-700 dark:from-red-400/30 dark:via-red-400/20 dark:to-pink-400/30 dark:text-red-300',
            green: 'from-emerald-500/20 via-emerald-500/10 to-teal-500/20 text-emerald-700 dark:from-emerald-400/30 dark:via-emerald-400/20 dark:to-teal-400/30 dark:text-emerald-300',
          }

          const baseColorClass = colorClasses[fields.color as keyof typeof colorClasses] || colorClasses.blue

          return (
            <span
              key={index}
              className={cn(
                'px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm lg:text-base bg-gradient-to-r inline-block',
                baseColorClass,
                'shadow-md border border-current/30 hover:shadow-lg transition-all duration-200'
              )}
            >
              {fields.text}
            </span>
          )
        }

        if (blockType === 'rawHtml' && fields.html) {
          return (
            <div
              key={index}
              className="my-4 sm:my-6 lg:my-8"
              dangerouslySetInnerHTML={{ __html: fields.html }}
            />
          )
        }

        return null
      }

      case 'upload':
      case 'image': {
        const media = rest.value || rest
        const src = media.url || media.src
        if (!src) return null

        return (
          <figure key={index} className="my-6 sm:my-8 lg:my-10 flex flex-col items-center">
            <div className="relative group w-full max-w-full">
              <img
                src={src}
                alt={media.alt || ''}
                className="w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-contain rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border-2 border-white/50 dark:border-gray-900/50 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-md hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 pointer-events-none" />
            </div>
            {media.alt && (
              <figcaption className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 italic font-medium px-2 sm:px-3 text-center break-words">
                {media.alt}
              </figcaption>
            )}
          </figure>
        )
      }

      default:
        return null
    }
  }

  return (
    <article
      className={cn(
        'prose dark:prose-invert prose-xs sm:prose-sm lg:prose-base max-w-none',
        'prose-headings:font-bold prose-headings:tracking-tight prose-headings:shadow-sm scroll-m-20',
        'prose-headings:text-gray-900 dark:prose-headings:text-white',
        'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:break-words prose-p:hyphens-auto',
        'prose-a:no-underline prose-a:font-semibold prose-a:shadow-sm prose-a:backdrop-blur-sm prose-a:max-w-full',
        'prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white',
        'prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:shadow-sm',
        'prose-blockquote:border-blue-400 dark:prose-blockquote:border-blue-500 prose-blockquote:backdrop-blur-sm prose-blockquote:shadow-md',
        'prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed',
        '[&>ul]:list-disc [&>ol]:list-decimal',
        'prose-img:rounded-lg prose-img:shadow-md prose-img:border-2 prose-img:border-white/50 dark:prose-img:border-gray-900/50'
      )}
    >
      {content.root.children?.map((child: LexicalNode, idx: number) => renderNode(child, idx))}
    </article>
  )
}

LexicalContent.displayName = 'LexicalContent'

export { LexicalContent }
