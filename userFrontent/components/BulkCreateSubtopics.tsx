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

interface Topic {
  id: string
  title: string
  order?: number
}

interface BulkCreateSubtopicsProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function BulkCreateSubtopics({ isExpanded: isExpandedProp, onExpandChange }: BulkCreateSubtopicsProps = {}) {
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subtopicNamesPerTopic, setSubtopicNamesPerTopic] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [results, setResults] = useState<{ created: number; skipped: number; errors: string[]; perTopic?: Record<string, { created: number; skipped: number }> } | null>(null)
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
      setSelectedChapterId('')
      setTopics([])
      setSelectedTopicIds([])
      setSubtopicNamesPerTopic({})
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
      setSelectedChapterId('')
      setTopics([])
      setSelectedTopicIds([])
      setSubtopicNamesPerTopic({})
    }
  }, [selectedSubjectId])

  // Load chapters when unit is selected
  useEffect(() => {
    if (selectedUnitId) {
      loadChapters(selectedUnitId)
    } else {
      setChapters([])
      setSelectedChapterId('')
      setTopics([])
      setSelectedTopicIds([])
      setSubtopicNamesPerTopic({})
    }
  }, [selectedUnitId])

  // Load topics when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      loadTopics(selectedChapterId)
    } else {
      setTopics([])
      setSelectedTopicIds([])
      setSubtopicNamesPerTopic({})
    }
  }, [selectedChapterId])

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
        const mappedChapters = data.docs.map((chapter: { id: string; title: string; order?: number }) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.order ?? 0,
        }))
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

  const loadTopics = async (chapterId: string) => {
    setIsLoadingTopics(true)
    try {
      const response = await fetch(`/api/topics?where[chapter][equals]=${chapterId}&limit=1000&depth=0&sort=order`)
      const data = await response.json()
      if (data.docs) {
        // Map topics and sort by order (ascending)
        const mappedTopics = data.docs.map((topic: { id: string; title: string; order?: number }) => ({
          id: topic.id,
          title: topic.title,
          order: topic.order ?? 0,
        }))
        // Sort by order (ascending), then by title if order is the same
        mappedTopics.sort((a: Topic, b: Topic) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setTopics(mappedTopics)
      } else {
        setTopics([])
      }
    } catch (_err) {
      setError('Failed to load topics')
      setTopics([])
    } finally {
      setIsLoadingTopics(false)
    }
  }

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(topicId)) {
        // Remove topic and clear its subtopic names
        setSubtopicNamesPerTopic((prevNames) => {
          const newNames = { ...prevNames }
          delete newNames[topicId]
          return newNames
        })
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
    setError(null)
    setResults(null)
  }

  const handleSelectAllTopics = () => {
    if (selectedTopicIds.length === topics.length) {
      setSelectedTopicIds([])
      setSubtopicNamesPerTopic({})
    } else {
      setSelectedTopicIds(topics.map((topic) => topic.id))
    }
    setError(null)
    setResults(null)
  }

  const handleSubtopicNamesChange = (topicId: string, value: string) => {
    setSubtopicNamesPerTopic((prev) => ({
      ...prev,
      [topicId]: value,
    }))
    setError(null)
    setResults(null)
  }

  const handleCreateSubtopics = async () => {
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

    if (!selectedChapterId) {
      setError('Please select a chapter')
      return
    }

    if (selectedTopicIds.length === 0) {
      setError('Please select at least one topic')
      return
    }

    // Validate that each selected topic has at least one subtopic name
    const topicSubtopics: Record<string, string[]> = {}
    for (const topicId of selectedTopicIds) {
      const subtopicNames = subtopicNamesPerTopic[topicId] || ''
      const parsedNames = subtopicNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (parsedNames.length === 0) {
        const topic = topics.find((t) => t.id === topicId)
        setError(`Please enter at least one subtopic name for "${topic?.title || topicId}"`)
        return
      }

      topicSubtopics[topicId] = parsedNames
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-create-subtopics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId: selectedExamId, subjectId: selectedSubjectId, unitId: selectedUnitId, chapterId: selectedChapterId, topicSubtopics }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subtopics')
      }

      setResults(data.results)
      setSubtopicNamesPerTopic({}) // Clear inputs on success

      // Refresh the page after 1.5 seconds to show new subtopics
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtopics')
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
          Quick Create Multiple Subtopics
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
            Quick Create Subtopics
          </h3>
        </div>
        <Button
          onClick={() => {
            setExpanded(false)
            setSelectedExamId('')
            setSelectedSubjectId('')
            setSelectedUnitId('')
            setSelectedChapterId('')
            setSelectedTopicIds([])
            setSubtopicNamesPerTopic({})
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
          Select an exam, subject, unit, and chapter, then select one or more topics and enter subtopic names for each topic separately (one per line). Each topic will have its own input box. Content and SEO can be added later.
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
                setSelectedChapterId('') // Reset chapter when exam changes
                setSelectedTopicIds([]) // Reset topics when exam changes
                setSubtopicNamesPerTopic({}) // Clear subtopic names when exam changes
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
                setSelectedChapterId('') // Reset chapter when subject changes
                setSelectedTopicIds([]) // Reset topics when subject changes
                setSubtopicNamesPerTopic({}) // Clear subtopic names when subject changes
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
                setSelectedChapterId('') // Reset chapter when unit changes
                setSelectedTopicIds([]) // Reset topics when unit changes
                setSubtopicNamesPerTopic({}) // Clear subtopic names when unit changes
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

          {/* Chapter Selector */}
          <div style={{ flex: '1 1 0', minWidth: '150px' }}>
            <label
              htmlFor="chapter-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 0.5)',
              }}
            >
              Chapter <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            <select
              id="chapter-select"
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value)
                setSelectedTopicIds([]) // Reset topics when chapter changes
                setSubtopicNamesPerTopic({}) // Clear subtopic names when chapter changes
                setError(null)
                setResults(null)
              }}
              disabled={!selectedUnitId || isLoadingChapters}
              style={{
                width: '100%',
                padding: 'calc(var(--base) * 0.75)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 'var(--style-radius-s)',
                fontSize: 'var(--font-size-s)',
                background: selectedUnitId ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                cursor: selectedUnitId && !isLoadingChapters ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (selectedUnitId) {
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
                {!selectedUnitId
                  ? 'Select Chapter'
                  : isLoadingChapters
                    ? 'Loading...'
                    : chapters.length === 0
                      ? 'No chapters'
                      : 'Select Chapter'}
              </option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Multi-Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(var(--base) * 0.5)' }}>
            <label
              htmlFor="topic-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Topics <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            {topics.length > 0 && selectedChapterId && (
              <button
                onClick={handleSelectAllTopics}
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
                {selectedTopicIds.length === topics.length ? 'Deselect All' : 'Select All'}
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
            {!selectedChapterId ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Select a chapter first...
              </div>
            ) : isLoadingTopics ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Loading topics...
              </div>
            ) : topics.length === 0 ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                No topics found for this chapter
              </div>
            ) : (
              topics.map((topic) => (
                <label
                  key={topic.id}
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
                    checked={selectedTopicIds.includes(topic.id)}
                    onChange={() => handleTopicToggle(topic.id)}
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
                    {topic.title}
                  </span>
                  {selectedTopicIds.includes(topic.id) && (
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
          {selectedTopicIds.length > 0 && (
            <div
              style={{
                marginTop: 'calc(var(--base) * 0.5)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-success-500)',
                fontWeight: 500,
              }}
            >
              {selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Subtopic Names Textareas - One per selected topic */}
        {selectedTopicIds.length > 0 && (
          <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 1)',
              }}
            >
              Subtopic Names <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 1.5)' }}>
              {selectedTopicIds.map((topicId) => {
                const topic = topics.find((t) => t.id === topicId)
                if (!topic) return null

                return (
                  <div
                    key={topicId}
                    style={{
                      border: '1px solid var(--theme-border-color)',
                      borderRadius: 'var(--style-radius-s)',
                      padding: 'calc(var(--base) * 1)',
                      background: 'var(--theme-elevation-50)',
                    }}
                  >
                    <label
                      htmlFor={`subtopic-names-input-${topicId}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                        marginBottom: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      {topic.title} <span style={{ color: 'var(--theme-error-500)' }}>*</span>
                    </label>
                    <textarea
                      id={`subtopic-names-input-${topicId}`}
                      value={subtopicNamesPerTopic[topicId] || ''}
                      onChange={(e) => handleSubtopicNamesChange(topicId, e.target.value)}
                      placeholder="Linear Motion&#10;Circular Motion&#10;Projectile Motion&#10;Rotational Motion"
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
            onClick={handleCreateSubtopics}
            disabled={
              isCreating ||
              !selectedExamId ||
              !selectedSubjectId ||
              !selectedUnitId ||
              !selectedChapterId ||
              selectedTopicIds.length === 0 ||
              selectedTopicIds.some((topicId) => !subtopicNamesPerTopic[topicId]?.trim())
            }
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : `Create Subtopics${selectedTopicIds.length > 0 ? ` (${selectedTopicIds.length} topic${selectedTopicIds.length !== 1 ? 's' : ''})` : ''}`}
          </Button>
          <Button
            onClick={() => {
              setSubtopicNamesPerTopic({})
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={Object.values(subtopicNamesPerTopic).every((names) => !names.trim()) || isCreating}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.5)', marginBottom: results.errors.length > 0 || results.perTopic ? 'var(--base)' : 0 }}>
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
            {results.perTopic && Object.keys(results.perTopic).length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Per Topic Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.5)' }}>
                  {Object.entries(results.perTopic).map(([topicId, stats]) => {
                    const topic = topics.find((t) => t.id === topicId)
                    if (!topic || (stats.created === 0 && stats.skipped === 0)) return null
                    return (
                      <div
                        key={topicId}
                        style={{
                          padding: 'calc(var(--base) * 0.5)',
                          background: 'var(--theme-elevation-100)',
                          borderRadius: 'var(--style-radius-s)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--theme-text)', marginBottom: 'calc(var(--base) * 0.25)' }}>
                          {topic.title}
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
