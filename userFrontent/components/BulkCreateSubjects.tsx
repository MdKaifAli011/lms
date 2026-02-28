'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@payloadcms/ui'

interface Exam {
  id: string
  title: string
  order?: number
}

interface BulkCreateSubjectsProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function BulkCreateSubjects({ isExpanded: isExpandedProp, onExpandChange }: BulkCreateSubjectsProps = {}) {
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjectNamesPerExam, setSubjectNamesPerExam] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [results, setResults] = useState<{ created: number; skipped: number; errors: string[]; perExam?: Record<string, { created: number; skipped: number }> } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)

  const isControlled = isExpandedProp !== undefined && onExpandChange !== undefined
  const isExpanded = isControlled ? isExpandedProp : isExpandedInternal
  const setExpanded = (open: boolean) => {
    onExpandChange?.(open)
    if (!isControlled) setIsExpandedInternal(open)
  }

  // Load exams on mount and when expanded
  useEffect(() => {
    if (isExpanded) {
      loadExams()
    }
  }, [isExpanded])

  const loadExams = async () => {
    setIsLoadingExams(true)
    try {
      const response = await fetch('/api/exams?limit=1000&depth=0&sort=order')
      const data = await response.json()
      if (data.docs) {
        const mappedExams = data.docs.map((exam: { id: string; title: string; order?: number }) => ({
          id: exam.id,
          title: exam.title,
          order: exam.order ?? 0,
        }))
        mappedExams.sort((a: Exam, b: Exam) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setExams(mappedExams)
      }
    } catch (_err) {
      setError('Failed to load exams')
    } finally {
      setIsLoadingExams(false)
    }
  }

  const handleExamToggle = (examId: string) => {
    setSelectedExamIds((prev) => {
      if (prev.includes(examId)) {
        // Remove exam and clear its subject names
        setSubjectNamesPerExam((prevNames) => {
          const newNames = { ...prevNames }
          delete newNames[examId]
          return newNames
        })
        return prev.filter((id) => id !== examId)
      } else {
        return [...prev, examId]
      }
    })
    setError(null)
    setResults(null)
  }

  const handleSelectAllExams = () => {
    if (selectedExamIds.length === exams.length) {
      setSelectedExamIds([])
      setSubjectNamesPerExam({})
    } else {
      setSelectedExamIds(exams.map((exam) => exam.id))
    }
    setError(null)
    setResults(null)
  }

  const handleSubjectNamesChange = (examId: string, value: string) => {
    setSubjectNamesPerExam((prev) => ({
      ...prev,
      [examId]: value,
    }))
    setError(null)
    setResults(null)
  }

  const handleCreateSubjects = async () => {
    if (selectedExamIds.length === 0) {
      setError('Please select at least one exam')
      return
    }

    // Validate that each selected exam has at least one subject name
    const examSubjects: Record<string, string[]> = {}
    for (const examId of selectedExamIds) {
      const subjectNames = subjectNamesPerExam[examId] || ''
      const parsedNames = subjectNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (parsedNames.length === 0) {
        const exam = exams.find((e) => e.id === examId)
        setError(`Please enter at least one subject name for "${exam?.title || examId}"`)
        return
      }

      examSubjects[examId] = parsedNames
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-create-subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examSubjects }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subjects')
      }

      setResults(data.results)
      setSubjectNamesPerExam({}) // Clear inputs on success

      // Refresh the page after 1.5 seconds to show new subjects
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subjects')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isExpanded) {
    return (
      <div style={{ marginBottom: 0 }}>
        <Button
          onClick={() => setExpanded(true)}
          buttonStyle="secondary"
          icon="plus"
          size="small"
        >
          Quick Create Multiple Subjects
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
            Quick Create Subjects
          </h3>
        </div>
        <Button
          onClick={() => {
            setExpanded(false)
            setSelectedExamIds([])
            setSubjectNamesPerExam({})
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
          Select one or more exams and enter subject names for each exam separately (one per line). Each exam will have its own input box. Content and SEO can be added later.
        </p>

        {/* Exam Multi-Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(var(--base) * 0.5)' }}>
            <label
              htmlFor="exam-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Exams <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            {exams.length > 0 && (
              <button
                onClick={handleSelectAllExams}
                type="button"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-success-500)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'calc(var(--base) * 0.25) calc(var(--base) * 0.5)',
                  borderRadius: 'var(--style-radius-s)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--theme-success-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
              >
                {selectedExamIds.length === exams.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div
            style={{
              border: '1px solid var(--theme-border-color)',
              borderRadius: 'var(--style-radius-s)',
              padding: 'calc(var(--base) * 0.5)',
              background: 'var(--theme-elevation-0)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {isLoadingExams ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Loading exams...
              </div>
            ) : exams.length === 0 ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                No exams found
              </div>
            ) : (
              exams.map((exam) => (
                <label
                  key={exam.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'calc(var(--base) * 0.5)',
                    cursor: 'pointer',
                    borderRadius: 'var(--style-radius-s)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--theme-elevation-50)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedExamIds.includes(exam.id)}
                    onChange={() => handleExamToggle(exam.id)}
                    style={{
                      marginRight: 'calc(var(--base) * 0.5)',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--theme-success-500)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--theme-text)',
                      flex: 1,
                    }}
                  >
                    {exam.title}
                  </span>
                  {selectedExamIds.includes(exam.id) && (
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--theme-success-500)',
                        marginLeft: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
          {selectedExamIds.length > 0 && (
            <div
              style={{
                marginTop: 'calc(var(--base) * 0.5)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-success-500)',
                fontWeight: 500,
              }}
            >
              {selectedExamIds.length} exam{selectedExamIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Subject Names Textareas - One per selected exam */}
        {selectedExamIds.length > 0 && (
          <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 1)',
              }}
            >
              Subject Names <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 1.5)' }}>
              {selectedExamIds.map((examId) => {
                const exam = exams.find((e) => e.id === examId)
                if (!exam) return null

                return (
                  <div
                    key={examId}
                    style={{
                      border: '1px solid var(--theme-border-color)',
                      borderRadius: 'var(--style-radius-s)',
                      padding: 'calc(var(--base) * 1)',
                      background: 'var(--theme-elevation-50)',
                    }}
                  >
                    <label
                      htmlFor={`subject-names-input-${examId}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                        marginBottom: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      {exam.title} <span style={{ color: 'var(--theme-error-500)' }}>*</span>
                    </label>
                    <textarea
                      id={`subject-names-input-${examId}`}
                      value={subjectNamesPerExam[examId] || ''}
                      onChange={(e) => handleSubjectNamesChange(examId, e.target.value)}
                      placeholder="Physics&#10;Chemistry&#10;Mathematics&#10;Biology"
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
                        cursor: 'text',
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
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.5)', alignItems: 'center' }}>
          <Button
            onClick={handleCreateSubjects}
            disabled={
              isCreating ||
              selectedExamIds.length === 0 ||
              selectedExamIds.some((examId) => !subjectNamesPerExam[examId]?.trim())
            }
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : `Create Subjects${selectedExamIds.length > 0 ? ` (${selectedExamIds.length} exam${selectedExamIds.length !== 1 ? 's' : ''})` : ''}`}
          </Button>
          <Button
            onClick={() => {
              setSubjectNamesPerExam({})
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={Object.values(subjectNamesPerExam).every((names) => !names.trim()) || isCreating}
          >
            Clear All
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.5)', marginBottom: results.errors.length > 0 || results.perExam ? 'var(--base)' : 0 }}>
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
            {results.perExam && Object.keys(results.perExam).length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Per Exam Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.5)' }}>
                  {Object.entries(results.perExam).map(([examId, stats]) => {
                    const exam = exams.find((e) => e.id === examId)
                    if (!exam || (stats.created === 0 && stats.skipped === 0)) return null
                    return (
                      <div
                        key={examId}
                        style={{
                          padding: 'calc(var(--base) * 0.5)',
                          background: 'var(--theme-elevation-100)',
                          borderRadius: 'var(--style-radius-s)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--theme-text)', marginBottom: 'calc(var(--base) * 0.25)' }}>
                          {exam.title}
                        </div>
                        <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.5)', flexWrap: 'wrap' }}>
                          {stats.created > 0 && (
                            <span style={{ color: 'var(--theme-success-500)' }}>✓ Created: {stats.created}</span>
                          )}
                          {stats.skipped > 0 && (
                            <span style={{ color: 'var(--theme-warning-500)' }}>⏭ Skipped: {stats.skipped}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {results.errors.length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
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
