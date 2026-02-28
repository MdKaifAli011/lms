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

interface Subtopic {
  id: string
  title: string
  order?: number
}

interface BulkCreateDefinitionsProps {
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

export default function BulkCreateDefinitions({ isExpanded: isExpandedProp, onExpandChange }: BulkCreateDefinitionsProps = {}) {
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [definitionNamesPerSubtopic, setDefinitionNamesPerSubtopic] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false)
  const [results, setResults] = useState<{ created: number; skipped: number; errors: string[]; perSubtopic?: Record<string, { created: number; skipped: number }> } | null>(null)
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
      setSelectedTopicId('')
      setSubtopics([])
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
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
      setSelectedTopicId('')
      setSubtopics([])
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
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
      setSelectedTopicId('')
      setSubtopics([])
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
    }
  }, [selectedUnitId])

  // Load topics when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      loadTopics(selectedChapterId)
    } else {
      setTopics([])
      setSelectedTopicId('')
      setSubtopics([])
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
    }
  }, [selectedChapterId])

  // Load subtopics when topic is selected
  useEffect(() => {
    if (selectedTopicId) {
      loadSubtopics(selectedTopicId)
    } else {
      setSubtopics([])
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
    }
  }, [selectedTopicId])

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
        const mappedTopics = data.docs.map((topic: { id: string; title: string; order?: number }) => ({
          id: topic.id,
          title: topic.title,
          order: topic.order ?? 0,
        }))
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

  const loadSubtopics = async (topicId: string) => {
    setIsLoadingSubtopics(true)
    try {
      const response = await fetch(`/api/subtopics?where[topic][equals]=${topicId}&limit=1000&depth=0&sort=order`)
      const data = await response.json()
      if (data.docs) {
        // Map subtopics and sort by order (ascending)
        const mappedSubtopics = data.docs.map((subtopic: { id: string; title: string; order?: number }) => ({
          id: subtopic.id,
          title: subtopic.title,
          order: subtopic.order ?? 0,
        }))
        // Sort by order (ascending), then by title if order is the same
        mappedSubtopics.sort((a: Subtopic, b: Subtopic) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0)
          }
          return a.title.localeCompare(b.title)
        })
        setSubtopics(mappedSubtopics)
      } else {
        setSubtopics([])
      }
    } catch (_err) {
      setError('Failed to load subtopics')
      setSubtopics([])
    } finally {
      setIsLoadingSubtopics(false)
    }
  }

  const handleSubtopicToggle = (subtopicId: string) => {
    setSelectedSubtopicIds((prev) => {
      if (prev.includes(subtopicId)) {
        // Remove subtopic and clear its definition names
        setDefinitionNamesPerSubtopic((prevNames) => {
          const newNames = { ...prevNames }
          delete newNames[subtopicId]
          return newNames
        })
        return prev.filter((id) => id !== subtopicId)
      } else {
        return [...prev, subtopicId]
      }
    })
    setError(null)
    setResults(null)
  }

  const handleSelectAllSubtopics = () => {
    if (selectedSubtopicIds.length === subtopics.length) {
      setSelectedSubtopicIds([])
      setDefinitionNamesPerSubtopic({})
    } else {
      setSelectedSubtopicIds(subtopics.map((subtopic) => subtopic.id))
    }
    setError(null)
    setResults(null)
  }

  const handleDefinitionNamesChange = (subtopicId: string, value: string) => {
    setDefinitionNamesPerSubtopic((prev) => ({
      ...prev,
      [subtopicId]: value,
    }))
    setError(null)
    setResults(null)
  }

  const handleCreateDefinitions = async () => {
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

    if (!selectedTopicId) {
      setError('Please select a topic')
      return
    }

    if (selectedSubtopicIds.length === 0) {
      setError('Please select at least one subtopic')
      return
    }

    // Validate that each selected subtopic has at least one definition name
    const subtopicDefinitions: Record<string, string[]> = {}
    for (const subtopicId of selectedSubtopicIds) {
      const definitionNames = definitionNamesPerSubtopic[subtopicId] || ''
      const parsedNames = definitionNames
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      if (parsedNames.length === 0) {
        const subtopic = subtopics.find((s) => s.id === subtopicId)
        setError(`Please enter at least one definition name for "${subtopic?.title || subtopicId}"`)
        return
      }

      subtopicDefinitions[subtopicId] = parsedNames
    }

    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-create-definitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId: selectedExamId, subjectId: selectedSubjectId, unitId: selectedUnitId, chapterId: selectedChapterId, topicId: selectedTopicId, subtopicDefinitions }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create definitions')
      }

      setResults(data.results)
      setDefinitionNamesPerSubtopic({}) // Clear inputs on success

      // Refresh the page after 1.5 seconds to show new definitions
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create definitions')
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
          Quick Create Multiple Definitions
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
            Quick Create Definitions
          </h3>
        </div>
        <Button
          onClick={() => {
            setExpanded(false)
            setSelectedExamId('')
            setSelectedSubjectId('')
            setSelectedUnitId('')
            setSelectedChapterId('')
            setSelectedTopicId('')
            setSelectedSubtopicIds([])
            setDefinitionNamesPerSubtopic({})
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
          Select an exam, subject, unit, chapter, and topic, then select one or more subtopics and enter definition names for each subtopic separately (one per line). Each subtopic will have its own input box. Content and SEO can be added later.
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
                setSelectedTopicId('') // Reset topic when exam changes
                setSelectedSubtopicIds([]) // Reset subtopics when exam changes
                setDefinitionNamesPerSubtopic({}) // Clear definition names when exam changes
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
                setSelectedTopicId('') // Reset topic when subject changes
                setSelectedSubtopicIds([]) // Reset subtopics when subject changes
                setDefinitionNamesPerSubtopic({}) // Clear definition names when subject changes
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
                setSelectedTopicId('') // Reset topic when unit changes
                setSelectedSubtopicIds([]) // Reset subtopics when unit changes
                setDefinitionNamesPerSubtopic({}) // Clear definition names when unit changes
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
                setSelectedTopicId('') // Reset topic when chapter changes
                setSelectedSubtopicIds([]) // Reset subtopics when chapter changes
                setDefinitionNamesPerSubtopic({}) // Clear definition names when chapter changes
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

          {/* Topic Selector */}
          <div style={{ flex: '1 1 0', minWidth: '150px' }}>
            <label
              htmlFor="topic-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 0.5)',
              }}
            >
              Topic <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            <select
              id="topic-select"
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value)
                setSelectedSubtopicIds([]) // Reset subtopics when topic changes
                setDefinitionNamesPerSubtopic({}) // Clear definition names when topic changes
                setError(null)
                setResults(null)
              }}
              disabled={!selectedChapterId || isLoadingTopics}
              style={{
                width: '100%',
                padding: 'calc(var(--base) * 0.75)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 'var(--style-radius-s)',
                fontSize: 'var(--font-size-s)',
                background: selectedChapterId ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                cursor: selectedChapterId && !isLoadingTopics ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (selectedChapterId) {
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
                {!selectedChapterId
                  ? 'Select Topic'
                  : isLoadingTopics
                    ? 'Loading...'
                    : topics.length === 0
                      ? 'No topics'
                      : 'Select Topic'}
              </option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subtopic Multi-Selector */}
        <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(var(--base) * 0.5)' }}>
            <label
              htmlFor="subtopic-select"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Subtopics <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </label>
            {subtopics.length > 0 && selectedTopicId && (
              <button
                onClick={handleSelectAllSubtopics}
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
                {selectedSubtopicIds.length === subtopics.length ? 'Deselect All' : 'Select All'}
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
            {!selectedTopicId ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Select a topic first...
              </div>
            ) : isLoadingSubtopics ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                Loading subtopics...
              </div>
            ) : subtopics.length === 0 ? (
              <div
                style={{
                  padding: 'calc(var(--base) * 0.75)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--theme-text-50)',
                  textAlign: 'center',
                }}
              >
                No subtopics found for this topic
              </div>
            ) : (
              subtopics.map((subtopic) => (
                <label
                  key={subtopic.id}
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
                    checked={selectedSubtopicIds.includes(subtopic.id)}
                    onChange={() => handleSubtopicToggle(subtopic.id)}
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
                    {subtopic.title}
                  </span>
                  {selectedSubtopicIds.includes(subtopic.id) && (
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
          {selectedSubtopicIds.length > 0 && (
            <div
              style={{
                marginTop: 'calc(var(--base) * 0.5)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--theme-success-500)',
                fontWeight: 500,
              }}
            >
              {selectedSubtopicIds.length} subtopic{selectedSubtopicIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Definition Names Textareas - One per selected subtopic */}
        {selectedSubtopicIds.length > 0 && (
          <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--theme-text)',
                marginBottom: 'calc(var(--base) * 1)',
              }}
            >
              Definition Names <span style={{ color: 'var(--theme-error-500)' }}>*</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 1.5)' }}>
              {selectedSubtopicIds.map((subtopicId) => {
                const subtopic = subtopics.find((s) => s.id === subtopicId)
                if (!subtopic) return null

                return (
                  <div
                    key={subtopicId}
                    style={{
                      border: '1px solid var(--theme-border-color)',
                      borderRadius: 'var(--style-radius-s)',
                      padding: 'calc(var(--base) * 1)',
                      background: 'var(--theme-elevation-50)',
                    }}
                  >
                    <label
                      htmlFor={`definition-names-input-${subtopicId}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                        marginBottom: 'calc(var(--base) * 0.5)',
                      }}
                    >
                      {subtopic.title} <span style={{ color: 'var(--theme-error-500)' }}>*</span>
                    </label>
                    <textarea
                      id={`definition-names-input-${subtopicId}`}
                      value={definitionNamesPerSubtopic[subtopicId] || ''}
                      onChange={(e) => handleDefinitionNamesChange(subtopicId, e.target.value)}
                      placeholder="Velocity Definition&#10;Acceleration Definition&#10;Force Definition&#10;Momentum Definition"
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
            onClick={handleCreateDefinitions}
            disabled={
              isCreating ||
              !selectedExamId ||
              !selectedSubjectId ||
              !selectedUnitId ||
              !selectedChapterId ||
              !selectedTopicId ||
              selectedSubtopicIds.length === 0 ||
              selectedSubtopicIds.some((subtopicId) => !definitionNamesPerSubtopic[subtopicId]?.trim())
            }
            icon={isCreating ? undefined : 'plus'}
          >
            {isCreating ? 'Creating...' : `Create Definitions${selectedSubtopicIds.length > 0 ? ` (${selectedSubtopicIds.length} subtopic${selectedSubtopicIds.length !== 1 ? 's' : ''})` : ''}`}
          </Button>
          <Button
            onClick={() => {
              setDefinitionNamesPerSubtopic({})
              setError(null)
              setResults(null)
            }}
            buttonStyle="secondary"
            disabled={Object.values(definitionNamesPerSubtopic).every((names) => !names.trim()) || isCreating}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.5)', marginBottom: results.errors.length > 0 || results.perSubtopic ? 'var(--base)' : 0 }}>
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
            {results.perSubtopic && Object.keys(results.perSubtopic).length > 0 && (
              <div style={{ marginTop: 'var(--base)', paddingTop: 'var(--base)', borderTop: '1px solid var(--theme-border-color)' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                  }}
                >
                  Per Subtopic Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.5)' }}>
                  {Object.entries(results.perSubtopic).map(([subtopicId, stats]) => {
                    const subtopic = subtopics.find((s) => s.id === subtopicId)
                    if (!subtopic || (stats.created === 0 && stats.skipped === 0)) return null
                    return (
                      <div
                        key={subtopicId}
                        style={{
                          padding: 'calc(var(--base) * 0.5)',
                          background: 'var(--theme-elevation-100)',
                          borderRadius: 'var(--style-radius-s)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--theme-text)', marginBottom: 'calc(var(--base) * 0.25)' }}>
                          {subtopic.title}
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
