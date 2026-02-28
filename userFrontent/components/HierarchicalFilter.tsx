'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Button } from '@payloadcms/ui'
import { Filter, X } from 'lucide-react'

interface Entity {
  id: string
  title: string
}

interface HierarchicalFilterProps {
  collectionSlug: 'subjects' | 'units' | 'chapters' | 'topics' | 'subtopics' | 'definitions'
  /** When provided with onExpandChange, expand state is controlled by parent (e.g. ListBar). */
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
}

const LEVEL_LABELS: Record<string, string> = {
  exam: 'Exam',
  subject: 'Subject',
  unit: 'Unit',
  chapter: 'Chapter',
  topic: 'Topic',
  subtopic: 'Subtopic',
}

function HierarchicalFilterInner({ collectionSlug, isExpanded: isExpandedProp, onExpandChange }: HierarchicalFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [exams, setExams] = useState<Entity[]>([])
  const [subjects, setSubjects] = useState<Entity[]>([])
  const [units, setUnits] = useState<Entity[]>([])
  const [chapters, setChapters] = useState<Entity[]>([])
  const [topics, setTopics] = useState<Entity[]>([])
  const [subtopics, setSubtopics] = useState<Entity[]>([])

  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('')

  const [_isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)

  const isControlled = isExpandedProp !== undefined && onExpandChange !== undefined
  const isExpanded = isControlled ? isExpandedProp : isExpandedInternal
  const setExpanded = useCallback(
    (open: boolean) => {
      if (onExpandChange) onExpandChange(open)
      if (!isControlled) setIsExpandedInternal(open)
    },
    [onExpandChange, isControlled],
  )

  const levels = useMemo(() => {
    const mapping: Record<string, string[]> = {
      subjects: ['exam'],
      units: ['exam', 'subject'],
      chapters: ['exam', 'subject', 'unit'],
      topics: ['exam', 'subject', 'unit', 'chapter'],
      subtopics: ['exam', 'subject', 'unit', 'chapter', 'topic'],
      definitions: ['exam', 'subject', 'unit', 'chapter', 'topic', 'subtopic'],
    }
    return mapping[collectionSlug] || []
  }, [collectionSlug])

  const updateFilters = useCallback(
    (newFilters: Record<string, string>) => {
      if (!searchParams) return
      const params = new URLSearchParams(searchParams.toString())
      const otherFilters: { key: string; value: string }[] = []
      const hierarchyKeys = ['[exam]', '[subject]', '[unit]', '[chapter]', '[topic]', '[subtopic]']

      params.forEach((value, key) => {
        const isHierarchy = hierarchyKeys.some((hk) => key.includes(hk))
        if (!isHierarchy && key.startsWith('where[')) {
          otherFilters.push({ key, value })
        }
      })

      Array.from(params.keys()).forEach((key) => {
        if (key.startsWith('where[')) params.delete(key)
      })

      let index = 0
      otherFilters.forEach((f) => {
        const newKey = f.key.replace(/where\[and\]\[\d+\]/, `where[and][${index}]`)
        params.set(newKey, f.value)
        index++
      })

      Object.entries(newFilters).forEach(([field, value]) => {
        if (value) {
          params.set(`where[and][${index}][${field}][equals]`, value)
          index++
        }
      })

      const newQueryString = params.toString()
      if (newQueryString !== searchParams.toString()) {
        router.push(`${pathname}?${newQueryString}`)
      }
    },
    [searchParams, pathname, router],
  )

  useEffect(() => {
    if (!searchParams) return
    const findValue = (key: string) => {
      for (let i = 0; i < 10; i++) {
        const val = searchParams.get(`where[and][${i}][${key}][equals]`)
        if (val) return val
      }
      return ''
    }
    const exam = findValue('exam')
    const subject = findValue('subject')
    const unit = findValue('unit')
    const chapter = findValue('chapter')
    const topic = findValue('topic')
    const subtopic = findValue('subtopic')
    setSelectedExam(exam)
    setSelectedSubject(subject || '')
    setSelectedUnit(unit || '')
    setSelectedChapter(chapter || '')
    setSelectedTopic(topic || '')
    setSelectedSubtopic(subtopic || '')
    if (exam || subject || unit || chapter || topic || subtopic) setExpanded(true)
  }, [searchParams])

  const fetchData = useCallback(async (slug: string, query: string) => {
    setIsLoading((prev) => ({ ...prev, [slug]: true }))
    try {
      const finalQuery = query.startsWith('?') ? query.slice(1) : query
      const url = `/api/${slug}${finalQuery ? '?' + finalQuery + '&' : '?'}limit=1000&depth=0&sort=order`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return data.docs || []
    } catch (e) {
      console.error(`Fetch error for ${slug}:`, e)
      return []
    } finally {
      setIsLoading((prev) => ({ ...prev, [slug]: false }))
    }
  }, [])

  useEffect(() => {
    if (isExpanded) fetchData('exams', '').then(setExams)
  }, [fetchData, isExpanded])

  useEffect(() => {
    if (isExpanded && selectedExam && levels.includes('subject')) {
      fetchData('subjects', `where[exam][equals]=${selectedExam}`).then(setSubjects)
    } else setSubjects([])
  }, [selectedExam, levels, fetchData, isExpanded])

  useEffect(() => {
    if (isExpanded && selectedSubject && levels.includes('unit')) {
      fetchData('units', `where[subject][equals]=${selectedSubject}`).then(setUnits)
    } else setUnits([])
  }, [selectedSubject, levels, fetchData, isExpanded])

  useEffect(() => {
    if (isExpanded && selectedUnit && levels.includes('chapter')) {
      fetchData('chapters', `where[unit][equals]=${selectedUnit}`).then(setChapters)
    } else setChapters([])
  }, [selectedUnit, levels, fetchData, isExpanded])

  useEffect(() => {
    if (isExpanded && selectedChapter && levels.includes('topic')) {
      fetchData('topics', `where[chapter][equals]=${selectedChapter}`).then(setTopics)
    } else setTopics([])
  }, [selectedChapter, levels, fetchData, isExpanded])

  useEffect(() => {
    if (isExpanded && selectedTopic && levels.includes('subtopic')) {
      fetchData('subtopics', `where[topic][equals]=${selectedTopic}`).then(setSubtopics)
    } else setSubtopics([])
  }, [selectedTopic, levels, fetchData, isExpanded])

  const handleClear = () => {
    setSelectedExam('')
    setSelectedSubject('')
    setSelectedUnit('')
    setSelectedChapter('')
    setSelectedTopic('')
    setSelectedSubtopic('')
    updateFilters({})
  }

  const hasActiveFilters =
    selectedExam || selectedSubject || selectedUnit || selectedChapter || selectedTopic || selectedSubtopic

  if (levels.length === 0) return null

  const baseSelectStyle: React.CSSProperties = {
    padding: '6px 28px 6px 10px',
    borderRadius: 'var(--style-radius-s)',
    border: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
    fontSize: '13px',
    minWidth: '140px',
    maxWidth: '200px',
    width: '100%',
    minHeight: '32px',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    appearance: 'auto',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--theme-elevation-500)',
    marginBottom: '6px',
    display: 'block',
  }

  if (!isExpanded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
        <Button
          size="small"
          buttonStyle="secondary"
          onClick={() => setExpanded(true)}
        >
          <Filter style={{ width: 14, height: 14 }} />
          Quick filters
          {hasActiveFilters && (
            <span
              style={{
                background: 'var(--theme-success-500)',
                color: 'white',
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 999,
              }}
            >
              On
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div
      data-hierarchical-filter
      style={{
        padding: '12px 16px 16px',
        background: 'var(--theme-elevation-0)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        marginBottom: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        width: '100%',
      }}
    >
      {/* Header: compact */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--theme-elevation-150)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-text)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Filter style={{ width: 14, height: 14, color: 'var(--theme-elevation-500)' }} />
            Quick Selection Filters
          </h4>
          <Button
            size="small"
            buttonStyle="secondary"
            onClick={() => hasActiveFilters && handleClear()}
            disabled={!hasActiveFilters}
          >
            Clear all
          </Button>
        </div>
        <Button
          size="small"
          buttonStyle="none"
          onClick={() => setExpanded(false)}
        >
          <X style={{ width: 12, height: 12 }} />
          Close
        </Button>
      </div>

      {/* Dropdowns row: tighter spacing, clear hierarchy */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          alignItems: 'flex-end',
        }}
      >
        {/* Exam */}
        <div style={{ minWidth: 140 }}>
          <label style={labelStyle}>{LEVEL_LABELS.exam}</label>
          <select
            className="hierarchical-filter-select"
            style={baseSelectStyle}
            value={selectedExam}
            onChange={(e) => {
              const val = e.target.value
              setSelectedExam(val)
              updateFilters({ exam: val })
            }}
            aria-label="Filter by exam"
          >
            <option value="">Select exam</option>
            {(exams || []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {levels.includes('subject') && (
          <div style={{ minWidth: 140 }}>
            <label style={{ ...labelStyle, opacity: selectedExam ? 1 : 0.5 }}>{LEVEL_LABELS.subject}</label>
            <select
              className="hierarchical-filter-select"
              style={{ ...baseSelectStyle, opacity: selectedExam ? 1 : 0.6 }}
              disabled={!selectedExam}
              value={selectedSubject}
              onChange={(e) => {
                const val = e.target.value
                setSelectedSubject(val)
                updateFilters({ exam: selectedExam, subject: val })
              }}
              aria-label="Filter by subject"
            >
              <option value="">Select subject</option>
              {(subjects || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {levels.includes('unit') && (
          <div style={{ minWidth: 140 }}>
            <label style={{ ...labelStyle, opacity: selectedSubject ? 1 : 0.5 }}>{LEVEL_LABELS.unit}</label>
            <select
              className="hierarchical-filter-select"
              style={{ ...baseSelectStyle, opacity: selectedSubject ? 1 : 0.6 }}
              disabled={!selectedSubject}
              value={selectedUnit}
              onChange={(e) => {
                const val = e.target.value
                setSelectedUnit(val)
                updateFilters({
                  exam: selectedExam,
                  subject: selectedSubject,
                  unit: val,
                })
              }}
              aria-label="Filter by unit"
            >
              <option value="">Select unit</option>
              {(units || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {levels.includes('chapter') && (
          <div style={{ minWidth: 140 }}>
            <label style={{ ...labelStyle, opacity: selectedUnit ? 1 : 0.5 }}>{LEVEL_LABELS.chapter}</label>
            <select
              className="hierarchical-filter-select"
              style={{ ...baseSelectStyle, opacity: selectedUnit ? 1 : 0.6 }}
              disabled={!selectedUnit}
              value={selectedChapter}
              onChange={(e) => {
                const val = e.target.value
                setSelectedChapter(val)
                updateFilters({
                  exam: selectedExam,
                  subject: selectedSubject,
                  unit: selectedUnit,
                  chapter: val,
                })
              }}
              aria-label="Filter by chapter"
            >
              <option value="">Select chapter</option>
              {(chapters || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {levels.includes('topic') && (
          <div style={{ minWidth: 140 }}>
            <label style={{ ...labelStyle, opacity: selectedChapter ? 1 : 0.5 }}>{LEVEL_LABELS.topic}</label>
            <select
              className="hierarchical-filter-select"
              style={{ ...baseSelectStyle, opacity: selectedChapter ? 1 : 0.6 }}
              disabled={!selectedChapter}
              value={selectedTopic}
              onChange={(e) => {
                const val = e.target.value
                setSelectedTopic(val)
                updateFilters({
                  exam: selectedExam,
                  subject: selectedSubject,
                  unit: selectedUnit,
                  chapter: selectedChapter,
                  topic: val,
                })
              }}
              aria-label="Filter by topic"
            >
              <option value="">Select topic</option>
              {(topics || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {levels.includes('subtopic') && (
          <div style={{ minWidth: 140 }}>
            <label style={{ ...labelStyle, opacity: selectedTopic ? 1 : 0.5 }}>{LEVEL_LABELS.subtopic}</label>
            <select
              className="hierarchical-filter-select"
              style={{ ...baseSelectStyle, opacity: selectedTopic ? 1 : 0.6 }}
              disabled={!selectedTopic}
              value={selectedSubtopic}
              onChange={(e) => {
                const val = e.target.value
                setSelectedSubtopic(val)
                updateFilters({
                  exam: selectedExam,
                  subject: selectedSubject,
                  unit: selectedUnit,
                  chapter: selectedChapter,
                  topic: selectedTopic,
                  subtopic: val,
                })
              }}
              aria-label="Filter by subtopic"
            >
              <option value="">Select subtopic</option>
              {(subtopics || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HierarchicalFilter(props: HierarchicalFilterProps) {
  return (
    <Suspense fallback={null}>
      <HierarchicalFilterInner {...props} />
    </Suspense>
  )
}
