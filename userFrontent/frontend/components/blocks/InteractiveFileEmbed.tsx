'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface FileEmbedData {
  file: {
    filename: string
    filesize?: number
    mimeType?: string
    url?: string
    caption?: string
    alt?: string
  }
  displayName?: string
  description?: string
}

interface InteractiveFileEmbedProps {
  data: FileEmbedData
  className?: string
  showPreview?: boolean
  allowDownload?: boolean
}

export function InteractiveFileEmbed({
  data,
  className,
  showPreview = true,
  allowDownload = true,
}: InteractiveFileEmbedProps) {
  const [copied, setCopied] = useState(false)

  const file = data.file
  const displayName = data.displayName || file.filename || 'Untitled File'
  const description = data.description
  const fileUrl = file.url ? `/media/${file.filename}` : `/media/${file.filename}`

  // Enhanced file type detection
  const getFileType = (filename: string, mimeType?: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase()
    const mime = mimeType?.toLowerCase()
    
    if (mime?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext || '')) {
      return {
        type: 'image',
        icon: '🖼️',
        color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      }
    }
    if (mime === 'application/pdf' || ext === 'pdf') {
      return {
        type: 'pdf',
        icon: '📄',
        color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      }
    }
    if (['doc', 'docx'].includes(ext || '') || mime?.includes('word')) {
      return {
        type: 'word',
        icon: '📝',
        color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      }
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '') || mime?.includes('excel') || mime?.includes('spreadsheet')) {
      return {
        type: 'excel',
        icon: '📊',
        color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      }
    }
    if (['ppt', 'pptx'].includes(ext || '') || mime?.includes('powerpoint') || mime?.includes('presentation')) {
      return {
        type: 'powerpoint',
        icon: '📈',
        color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
      }
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '') || mime?.includes('zip') || mime?.includes('archive')) {
      return {
        type: 'archive',
        icon: '📦',
        color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
      }
    }
    if (['txt', 'md', 'rtf'].includes(ext || '') || mime?.startsWith('text/')) {
      return {
        type: 'text',
        icon: '📄',
        color: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
      }
    }
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(ext || '')) {
      return {
        type: 'code',
        icon: '💻',
        color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800',
      }
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '') || mime?.startsWith('video/')) {
      return {
        type: 'video',
        icon: '🎬',
        color: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
      }
    }
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext || '') || mime?.startsWith('audio/')) {
      return {
        type: 'audio',
        icon: '🎵',
        color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      }
    }
    
    return {
      type: 'unknown',
      icon: '📎',
      color: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Get file info
  const fileInfo = getFileType(file.filename, file.mimeType)

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + fileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <div className={cn("my-4", className)}>
      <div className={cn(
        "p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        fileInfo.color
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* File Icon - Responsive sizing */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center text-xl sm:text-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {fileInfo.icon}
            </div>
          </div>
          
          {/* File Info - Responsive layout */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
              {displayName}
            </p>
            
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 line-clamp-2">
                {description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{fileInfo.type}</span>
              {file.filesize && (
                <span>{formatFileSize(file.filesize)}</span>
              )}
              {file.filename && (
                <span className="truncate max-w-[150px] sm:max-w-none">{file.filename}</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Responsive layout */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {allowDownload && (
              <a
                href={fileUrl}
                download={file.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold text-center"
              >
                Download
              </a>
            )}
            
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
              title={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
        
        {/* Preview Section - Responsive sizing */}
        {showPreview && fileInfo.type === 'image' && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative aspect-video max-h-32 sm:max-h-40 md:max-h-48 rounded overflow-hidden">
              <img
                src={fileUrl}
                alt={file.alt || displayName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Additional Info - Responsive spacing */}
        {(file.caption || file.alt) && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            {file.alt && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium">Alt:</span> {file.alt}
              </p>
            )}
            {file.caption && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                {file.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
