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

interface Unit {
  id: string
  title: string
  order?: number
}

interface Chapter {
  id: string
  title: string
  order?: number
}

interface BulkCreateTopicsProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function BulkCreateTopics({ isExpanded: isExpandedProp, onExpandChange }: BulkCreateTopicsProps = {}) {
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topicNamesPerChapter, setTopicNamesPerChapter] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [results, setResults] = useState<{ created: number; skipped: number; errors: string[]; perChapter?: Record<string, { created: number; skipped: number }> } | null>(null)
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
      setSelectedSubjectId('')
      setUnits([])
      setSelectedUnitId('')
      setChapters([])
      setSelectedChapterIds([])
      setTopicNamesPerChapter({})
    }
  }, [selectedExamId])

  // Load units when subject is selected
  useEffect(() => {
    if (selectedSubjectId) {
      loadUnits(selectedSubjectId)
    } else {
      setUnits([])
      setSelectedUnitId('')
      setChapters([])
      setSelectedChapterIds([])
      setTopicNamesPerChapter({})
    }
  }, [selectedSubjectId])

  // Load chapters when unit is selected
  useEffect(() => {
    if (selectedUnitId) {
      loadChapters(selectedUnitId)
    } else {
      setChapters([])
      setSelectedChapterIds([])
      setTopicNamesPerChapter({})
    }
  }, [selectedUnitId])

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
        const mappedSubjects = data.docs.map((subject: { id: string; title: string; order?: number }) => ({
          id: subject.id,
          title: subject.title,
          order: subject.order ?? 0,
        }))
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

  const loadUnits = async (subjectId: string) => {
    setIsLoadingUnits(true)
    try {
      const response = await fetch(`/api/units?where[subject][equals]=${subjectId}&limit=1000&depth=0&sort=order`)
      const data = await response.json()
      if (data.docs) {
        const mappedUnits = data.docs.map((unit: { id: string; title: string; order?: number }) => ({
          id: unit.id,
          title: unit.title,
          order: unit.order ?? 0,
        }))
        mappedUnits.sort((a: Unit, b: Unit) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setUnits(mappedUnits)
      } else {
        setUnits([])
      }
    } catch (_err) {
      setError('Failed to load units')
      setUnits([])
    } finally {
      setIsLoadingUnits(false)
    }
  }

  const loadChapters = async (unitId: string) => {
    setIsLoadingChapters(true)
    try {
      const response = await fetch(`/api/chapters?where[unit][equals]=${unitId}&limit=1000&depth=0&sort=order`)
      const data = await response.json()
      if (data.docs) {
        // Map chapters and sort by order (ascending)
        const mappedChapters = data.docs.map((chapter: { id: string; title: string; order?: number }) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.order ?? 0,
        }))
        // Sort by order (ascending), then by title if order is the same
        mappedChapters.sort((a: Chapter, b: Chapter) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setChapters(mappedChapters)
      } else {
        setChapters([])
      }
    } catch (_err) {
      setError('Failed to load chapters')
      setChapters([])
    } finally {
      setIsLoadingChapters(false)
    }
  }

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapterIds((prev) => {
      if (prev.includes(chapterId)) {
        // Remove chapter and clear its topic names
        setTopicNamesPerChapter((prevNames) => {
          const newNames = { ...prevNames }
          delete newNames[chapterId]
          return newNames
        })
        return prev.filter((id) => id !== chapterId)
      } else {
        return [...prev, chapterId]
      }
    })
    setError(null)
    setResults(null)
  }

  const handleSelectAllChapters = () => {
    if (selectedChapterIds.length === chapters.length) {
      setSelectedChapterIds([])
      setTopicNamesPerChapter({})
    } else {
      setSelectedChapterIds(chapters.map((chapter) => chapter.id))
    }
    setError(null)
    setResults(null)
  }

  const handleTopicNamesChange = (chapterId: string, value: string) => {
    setTopicNamesPerChapter((prev) => ({
      ...prev,
      [chapterId]: value,
    }))
    setError(null)
    setResults(null)
  }

  const handleCreateTopics = async () => {
    if (!selectedExamId) {
      setError('Please select an exam first')
      return
    }

    if (!selectedSubjectId) {
      setError('Please select a subject')
      return
    }

    if (!selectedUnitId) {
      setError('Please select a unit')
      return
    }

    if (selectedChapterIds.length === 0) {
      setError('Please select at least one chapter')
      return
    }

    // Validate that each selected chapter has at least one topic name
    const chapterTopics: Record<string, string[]> = {}
    for (const chapterId of selectedChapterIds) {
      const topicNames = topicNamesPerChapter[chapterId] || ''
      const parsedNames = topicNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (parsedNames.length === 0) {
        const chapter = chapters.find((c) => c.id === chapterId)
        setError(`Please enter at least one topic name for "${chapter?.title || chapterId}"`)
        return
      }

      chapterTopics[chapterId] = parsedNames
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-create-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId: selectedExamId, subjectId: selectedSubjectId, unitId: selectedUnitId, chapterTopics }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create topics')
      }

      setResults(data.results)
      setTopicNamesPerChapter({}) // Clear inputs on success

      // Refresh the page after 1.5 seconds to show new topics
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topics')
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
          Quick Create Multiple Topics
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
            Quick Create Topics
          </h3>
        </div>
        <Button
          onClick={() => {
            setExpanded(false)
            setSelectedExamId('')
            setSelectedSubjectId('')
            setSelectedUnitId('')
            setSelectedChapterIds([])
            setTopicNamesPerChapter({})
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
          Select an exam, subject, and unit, then select one or more chapters and enter topic names for each chapter separately (one per line). Each chapter will have its own input box. Content and SEO can be added later.
        </p>

        {/* All Selectors in One Row */}
        <div
          style={{
            display: 'flex',
            gap: 'calc(var(--base) * 1)',
            marginBottom: 'calc(var(--base) * 1.5)',
            flexWrap: 'wrap',
          }}
        >
          {/* Exam Selector */}
          <div style={{ flex: '1 1 0', minWidth: '150px' }}>
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
                setSelectedSubjectId('') // Reset subject when exam changes
                setSelectedUnitId('') // Reset unit when exam changes
                setSelectedChapterIds([]) // Reset chapters when exam changes
                setTopicNamesPerChapter({}) // Clear topic names when exam changes
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
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div style={{ flex: '1 1 0', minWidth: '150px' }}>
            <label
              htmlFor="subject-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 0.5)',
              }}
            >
              Subject <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            <select
              id="subject-select"
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value)
                setSelectedUnitId('') // Reset unit when subject changes
                setSelectedChapterIds([]) // Reset chapters when subject changes
                setTopicNamesPerChapter({}) // Clear topic names when subject changes
                setError(null)
                setResults(null)
              }}
              disabled={!selectedExamId || isLoadingSubjects}
              style={{
                width: '100%',
                padding: 'calc(var(--base) * 0.75)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 'var(--style-radius-s)',
                fontSize: 'var(--font-size-s)',
                background: selectedExamId ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                cursor: selectedExamId && !isLoadingSubjects ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (selectedExamId) {
                  e.target.style.borderColor = 'var(--theme-success-500)'
                  e.target.style.boxShadow = '0 0 0 3px var(--theme-success-100)'
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--theme-border-color)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">
                {!selectedExamId
                  ? 'Select Subject'
                  : isLoadingSubjects
                    ? 'Loading...'
                    : subjects.length === 0
                      ? 'No subjects'
                      : 'Select Subject'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selector */}
          <div style={{ flex: '1 1 0', minWidth: '150px' }}>
            <label
              htmlFor="unit-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 0.5)',
              }}
            >
              Unit <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            <select
              id="unit-select"
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value)
                setSelectedChapterIds([]) // Reset chapters when unit changes
                setTopicNamesPerChapter({}) // Clear topic names when unit changes
                setError(null)
                setResults(null)
              }}
              disabled={!selectedSubjectId || isLoadingUnits}
              style={{
                width: '100%',
                padding: 'calc(var(--base) * 0.75)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 'var(--style-radius-s)',
                fontSize: 'var(--font-size-s)',
                background: selectedSubjectId ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                cursor: selectedSubjectId && !isLoadingUnits ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (selectedSubjectId) {
                  e.target.style.borderColor = 'var(--theme-success-500)'
                  e.target.style.boxShadow = '0 0 0 3px var(--theme-success-100)'
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--theme-border-color)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">
                {!selectedSubjectId
                  ? 'Select Unit'
                  : isLoadingUnits
                    ? 'Loading...'
                    : units.length === 0
                      ? 'No units'
                      : 'Select Unit'}
              </option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chapter Multi-Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(var(--base) * 0.5)' }}>
            <label
              htmlFor="chapter-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Chapters <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            {chapters.length > 0 && selectedUnitId && (
              <button
                onClick={handleSelectAllChapters}
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
                {selectedChapterIds.length === chapters.length ? 'Deselect All' : 'Select All'}
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
            {!selectedUnitId ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Select a unit first...
              </div>
            ) : isLoadingChapters ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Loading chapters...
              </div>
            ) : chapters.length === 0 ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                No chapters found for this unit
              </div>
            ) : (
              chapters.map((chapter) => (
                <label
                  key={chapter.id}
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
                    checked={selectedChapterIds.includes(chapter.id)}
                    onChange={() => handleChapterToggle(chapter.id)}
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
                    {chapter.title}
                  </span>
                  {selectedChapterIds.includes(chapter.id) && (
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
          {selectedChapterIds.length > 0 && (
            <div
              style={{
                marginTop: 'calc(var(--base) * 0.5)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-success-500)',
                fontWeight: 500,
              }}
            >
              {selectedChapterIds.length} chapter{selectedChapterIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Topic Names Textareas - One per selected chapter */}
        {selectedChapterIds.length > 0 && (
          <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 1)',
              }}
            >
              Topic Names <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 1.5)' }}>
              {selectedChapterIds.map((chapterId) => {
                const chapter = chapters.find((c) => c.id === chapterId)
                if (!chapter) return null

                return (
                  <div
                    key={chapterId}
                    style={{
                      border: '1px solid var(--theme-border-color)',
                      borderRadius: 'var(--style-radius-s)',
                      padding: 'calc(var(--base) * 1)',
                      background: 'var(--theme-elevation-50)',
                    }}
                  >
                    <label
                      htmlFor={`topic-names-input-${chapterId}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                        marginBottom: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      {chapter.title} <span style={{ color: 'var(--theme-error-500)' }}>*</span>
                    </label>
                    <textarea
                      id={`topic-names-input-${chapterId}`}
                      value={topicNamesPerChapter[chapterId] || ''}
                      onChange={(e) => handleTopicNamesChange(chapterId, e.target.value)}
                      placeholder="Motion&#10;Velocity&#10;Acceleration&#10;Force and Laws of Motion"
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
            onClick={handleCreateTopics}
            disabled={
              isCreating ||
              !selectedExamId ||
              !selectedSubjectId ||
              !selectedUnitId ||
              selectedChapterIds.length === 0 ||
              selectedChapterIds.some((chapterId) => !topicNamesPerChapter[chapterId]?.trim())
            }
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : `Create Topics${selectedChapterIds.length > 0 ? ` (${selectedChapterIds.length} chapter${selectedChapterIds.length !== 1 ? 's' : ''})` : ''}`}
          </Button>
          <Button
            onClick={() => {
              setTopicNamesPerChapter({})
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={Object.values(topicNamesPerChapter).every((names) => !names.trim()) || isCreating}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.5)', marginBottom: results.errors.length > 0 || results.perChapter ? 'var(--base)' : 0 }}>
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
            {results.perChapter && Object.keys(results.perChapter).length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Per Chapter Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.5)' }}>
                  {Object.entries(results.perChapter).map(([chapterId, stats]) => {
                    const chapter = chapters.find((c) => c.id === chapterId)
                    if (!chapter || (stats.created === 0 && stats.skipped === 0)) return null
                    return (
                      <div
                        key={chapterId}
                        style={{
                          padding: 'calc(var(--base) * 0.5)',
                          background: 'var(--theme-elevation-100)',
                          borderRadius: 'var(--style-radius-s)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--theme-text)', marginBottom: 'calc(var(--base) * 0.25)' }}>
                          {chapter.title}
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
