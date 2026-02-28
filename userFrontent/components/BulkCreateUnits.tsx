'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@payloadcms/ui'

interface Exam {
  id: string
  title: string
  order?: number
}

interface Subject {
  id: string
  title: string
  order?: number
}

interface BulkCreateUnitsProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function BulkCreateUnits({ isExpanded: isExpandedProp, onExpandChange }: BulkCreateUnitsProps = {}) {
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [unitNamesPerSubject, setUnitNamesPerSubject] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [results, setResults] = useState<{ created: number; skipped: number; errors: string[]; perSubject?: Record<string, { created: number; skipped: number }> } | null>(null)
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

  // Load subjects when exam is selected
  useEffect(() => {
    if (selectedExamId) {
      loadSubjects(selectedExamId)
    } else {
      setSubjects([])
      setSelectedSubjectIds([])
      setUnitNamesPerSubject({})
    }
  }, [selectedExamId])

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

  const loadSubjects = async (examId: string) => {
    setIsLoadingSubjects(true)
    try {
      const response = await fetch(`/api/subjects?where[exam][equals]=${examId}&limit=1000&depth=0&sort=order`)
      const data = await response.json()
      if (data.docs) {
        // Map subjects and sort by order (ascending)
        const mappedSubjects = data.docs.map((subject: { id: string; title: string; order?: number }) => ({
          id: subject.id,
          title: subject.title,
          order: subject.order ?? 0,
        }))
        // Sort by order (ascending), then by title if order is the same
        mappedSubjects.sort((a: Subject, b: Subject) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setSubjects(mappedSubjects)
      } else {
        setSubjects([])
      }
    } catch (_err) {
      setError('Failed to load subjects')
      setSubjects([])
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(subjectId)) {
        // Remove subject and clear its unit names
        setUnitNamesPerSubject((prevNames) => {
          const newNames = { ...prevNames }
          delete newNames[subjectId]
          return newNames
        })
        return prev.filter((id) => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
    setError(null)
    setResults(null)
  }

  const handleSelectAllSubjects = () => {
    if (selectedSubjectIds.length === subjects.length) {
      setSelectedSubjectIds([])
      setUnitNamesPerSubject({})
    } else {
      setSelectedSubjectIds(subjects.map((subject) => subject.id))
    }
    setError(null)
    setResults(null)
  }

  const handleUnitNamesChange = (subjectId: string, value: string) => {
    setUnitNamesPerSubject((prev) => ({
      ...prev,
      [subjectId]: value,
    }))
    setError(null)
    setResults(null)
  }

  const handleCreateUnits = async () => {
    if (!selectedExamId) {
      setError('Please select an exam first')
      return
    }

    if (selectedSubjectIds.length === 0) {
      setError('Please select at least one subject')
      return
    }

    // Validate that each selected subject has at least one unit name
    const subjectUnits: Record<string, string[]> = {}
    for (const subjectId of selectedSubjectIds) {
      const unitNames = unitNamesPerSubject[subjectId] || ''
      const parsedNames = unitNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (parsedNames.length === 0) {
        const subject = subjects.find((s) => s.id === subjectId)
        setError(`Please enter at least one unit name for "${subject?.title || subjectId}"`)
        return
      }

      subjectUnits[subjectId] = parsedNames
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-create-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId: selectedExamId, subjectUnits }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create units')
      }

      setResults(data.results)
      setUnitNamesPerSubject({}) // Clear inputs on success

      // Refresh the page after 1.5 seconds to show new units
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create units')
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
          Quick Create Multiple Units
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
            Quick Create Units
          </h3>
        </div>
        <Button
          onClick={() => {
            setExpanded(false)
            setSelectedExamId('')
            setSelectedSubjectIds([])
            setUnitNamesPerSubject({})
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
          Select an exam and one or more subjects, then enter unit names for each subject separately (one per line). Each subject will have its own input box. Content and SEO can be added later.
        </p>

        {/* Exam Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <label
            htmlFor="exam-select"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--theme-text)',
              marginBottom: 'calc(var(--base) * 0.5)',
            }}
          >
            Exam <span style={{ color: 'var(--theme-error-500)' }}>*</span>
          </label>
          <select
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value)
              setSelectedSubjectIds([]) // Reset subjects when exam changes
              setUnitNamesPerSubject({}) // Clear unit names when exam changes
              setError(null)
              setResults(null)
            }}
            disabled={isLoadingExams}
            style={{
              width: '100%',
              padding: 'calc(var(--base) * 0.75)',
              border: '1px solid var(--theme-border-color)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: 'var(--font-size-s)',
              background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)',
              cursor: isLoadingExams ? 'not-allowed' : 'pointer',
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
          >
            <option value="">Select an exam...</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Multi-Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(var(--base) * 0.5)' }}>
            <label
              htmlFor="subject-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Subjects <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            {subjects.length > 0 && selectedExamId && (
              <button
                onClick={handleSelectAllSubjects}
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
                {selectedSubjectIds.length === subjects.length ? 'Deselect All' : 'Select All'}
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
            {!selectedExamId ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Select an exam first...
              </div>
            ) : isLoadingSubjects ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                No subjects found for this exam
              </div>
            ) : (
              subjects.map((subject) => (
                <label
                  key={subject.id}
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
                    checked={selectedSubjectIds.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
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
                    {subject.title}
                  </span>
                  {selectedSubjectIds.includes(subject.id) && (
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
          {selectedSubjectIds.length > 0 && (
            <div
              style={{
                marginTop: 'calc(var(--base) * 0.5)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-success-500)',
                fontWeight: 500,
              }}
            >
              {selectedSubjectIds.length} subject{selectedSubjectIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Unit Names Textareas - One per selected subject */}
        {selectedSubjectIds.length > 0 && (
          <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 1)',
              }}
            >
              Unit Names <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 1.5)' }}>
              {selectedSubjectIds.map((subjectId) => {
                const subject = subjects.find((s) => s.id === subjectId)
                if (!subject) return null

                return (
                  <div
                    key={subjectId}
                    style={{
                      border: '1px solid var(--theme-border-color)',
                      borderRadius: 'var(--style-radius-s)',
                      padding: 'calc(var(--base) * 1)',
                      background: 'var(--theme-elevation-50)',
                    }}
                  >
                    <label
                      htmlFor={`unit-names-input-${subjectId}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                        marginBottom: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      {subject.title} <span style={{ color: 'var(--theme-error-500)' }}>*</span>
                    </label>
                    <textarea
                      id={`unit-names-input-${subjectId}`}
                      value={unitNamesPerSubject[subjectId] || ''}
                      onChange={(e) => handleUnitNamesChange(subjectId, e.target.value)}
                      placeholder="Mechanics&#10;Thermodynamics&#10;Optics&#10;Electromagnetism"
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
            onClick={handleCreateUnits}
            disabled={
              isCreating ||
              !selectedExamId ||
              selectedSubjectIds.length === 0 ||
              selectedSubjectIds.some((subjectId) => !unitNamesPerSubject[subjectId]?.trim())
            }
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : `Create Units${selectedSubjectIds.length > 0 ? ` (${selectedSubjectIds.length} subject${selectedSubjectIds.length !== 1 ? 's' : ''})` : ''}`}
          </Button>
          <Button
            onClick={() => {
              setUnitNamesPerSubject({})
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={Object.values(unitNamesPerSubject).every((names) => !names.trim()) || isCreating}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.5)', marginBottom: results.errors.length > 0 || results.perSubject ? 'var(--base)' : 0 }}>
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
            {results.perSubject && Object.keys(results.perSubject).length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Per Subject Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.5)' }}>
                  {Object.entries(results.perSubject).map(([subjectId, stats]) => {
                    const subject = subjects.find((s) => s.id === subjectId)
                    if (!subject || (stats.created === 0 && stats.skipped === 0)) return null
                    return (
                      <div
                        key={subjectId}
                        style={{
                          padding: 'calc(var(--base) * 0.5)',
                          background: 'var(--theme-elevation-100)',
                          borderRadius: 'var(--style-radius-s)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--theme-text)', marginBottom: 'calc(var(--base) * 0.25)' }}>
                          {subject.title}
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
