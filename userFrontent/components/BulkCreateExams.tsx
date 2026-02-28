'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

export default function BulkCreateExams() {
  const [examNames, setExamNames] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [results, setResults] = useState<{
    created: number
    skipped: number
    errors: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCreateExams = async () => {
    if (!examNames.trim()) {
      setError('Please enter at least one exam name')
      return
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      // Parse exam names (one per line only)
      const names = examNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (names.length === 0) {
        throw new Error('No valid exam names found')
      }

      const response = await fetch('/api/bulk-create-exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examNames: names }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create exams')
      }

      setResults(data.results)
      setExamNames('') // Clear input on success

      // Refresh the page after 1.5 seconds to show new exams
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exams')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isExpanded) {
    return (
      <div
        style={{
          float: 'right',
          marginBottom: 'calc(var(--base) * 1.5)',
          marginLeft: '12px'
        }}
      >
        <Button
          size="small"
          icon="plus"
          buttonStyle="secondary"
          onClick={() => setIsExpanded(true)}
        >
          Quick Create Exams
        </Button>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-0)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: 'var(--style-radius-m)',
        marginBottom: 'calc(var(--base) * 1.5)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Compact Header */}
      <div
        style={{
          padding: 'var(--base) calc(var(--base) * 1.5)',
          borderBottom: '1px solid var(--theme-border-color)',
          background: 'var(--theme-elevation-50)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) * 0.5)' }}>
          <h3
            style={{
              fontSize: 'var(--font-size-s)',
              fontWeight: 600,
              margin: 0,
              color: 'var(--theme-text)',
            }}
          >
            Quick Create Exams
          </h3>
        </div>
        <Button
          onClick={() => {
            setIsExpanded(false)
            setExamNames('')
            setError(null)
            setResults(null)
          }}
          buttonStyle="none"
          icon="x"
          size="small"
          tooltip="Close"
        />
      </div>

      {/* Content */}
      <div style={{ padding: 'calc(var(--base) * 1.5)' }}>
        {/* Description */}
        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--theme-text-50)',
            marginBottom: 'calc(var(--base) * 1.5)',
            lineHeight: '1.5',
            marginTop: 0,
          }}
        >
          Enter multiple exam names (one per line). Images, content, and SEO can be added later.
        </p>

        {/* Textarea Field */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <label
            htmlFor="exam-names-input"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--theme-text)',
              marginBottom: 'calc(var(--base) * 0.5)',
            }}
          >
            Exam Names
          </label>
          <textarea
            id="exam-names-input"
            value={examNames}
            onChange={(e) => {
              setExamNames(e.target.value)
              setError(null)
              setResults(null)
            }}
            placeholder="NEET&#10;JEE&#10;UPSC&#10;SSC&#10;Banking"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'calc(var(--base) * 0.75)',
              border: '1px solid var(--theme-border-color)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: 'var(--font-size-s)',
              fontFamily: 'var(--font-mono)',
              background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)',
              resize: 'vertical',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-success-500)'
              e.target.style.boxShadow = '0 0 0 3px var(--theme-success-100)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border-color)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.5)', alignItems: 'center' }}>
          <Button
            onClick={handleCreateExams}
            disabled={isCreating || !examNames.trim()}
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : 'Create Exams'}
          </Button>
          <Button
            onClick={() => {
              setExamNames('')
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={!examNames.trim() || isCreating}
          >
            Clear
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              marginTop: 'calc(var(--base) * 1.5)',
              padding: 'calc(var(--base) * 0.75)',
              background: 'var(--theme-error-50)',
              border: '1px solid var(--theme-error-200)',
              borderRadius: 'var(--style-radius-s)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'calc(var(--base) * 0.5)',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: '1' }}>⚠️</span>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-error-500)',
                fontWeight: 500,
                flex: 1,
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* Success Results */}
        {results && (
          <div
            style={{
              marginTop: 'calc(var(--base) * 1.5)',
              padding: 'calc(var(--base) * 1.5)',
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-border-color)',
              borderRadius: 'var(--style-radius-s)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'var(--base)',
              }}
            >
              Results
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'calc(var(--base) * 0.5)',
                marginBottom: results.errors.length > 0 ? 'var(--base)' : 0,
              }}
            >
              {results.created > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'calc(var(--base) * 0.25) calc(var(--base) * 0.75)',
                    borderRadius: 'var(--style-radius-s)',
                    background: 'var(--theme-success-500)',
                    color: 'var(--theme-success-text)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 500,
                    lineHeight: '1.5',
                  }}
                >
                  ✓ Created: {results.created}
                </span>
              )}
              {results.skipped > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'calc(var(--base) * 0.25) calc(var(--base) * 0.75)',
                    borderRadius: 'var(--style-radius-s)',
                    background: 'var(--theme-warning-500)',
                    color: 'var(--theme-warning-text)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 500,
                    lineHeight: '1.5',
                  }}
                >
                  ⏭ Skipped: {results.skipped}
                </span>
              )}
            </div>
            {results.errors.length > 0 && (
              <div
                style={{
                  marginTop: 'var(--base)',
                  paddingTop: 'var(--base)',
                  borderTop: '1px solid var(--theme-border-color)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-error-500)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Errors
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 'calc(var(--base) * 1.5)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--theme-error-500)',
                    lineHeight: '1.6',
                  }}
                >
                  {results.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: 'calc(var(--base) * 0.25)' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
