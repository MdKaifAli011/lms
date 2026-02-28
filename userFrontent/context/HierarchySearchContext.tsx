'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

/** Flattened item for search results (client-side or API) */
export interface SearchResultItem {
  type: 'exam' | 'subject' | 'unit' | 'chapter' | 'topic' | 'subtopic' | 'definition'
  id: string
  title: string
  slug: string
  path: string
}

/** Hierarchy node shape matching buildSubjectHierarchy (subjects with nested units, chapters, topics) */
export interface HierarchySubject {
  id: string
  slug?: string
  title?: string
  units?: HierarchyUnit[]
}
export interface HierarchyUnit {
  id: string
  slug?: string
  title?: string
  chapters?: HierarchyChapter[]
}
export interface HierarchyChapter {
  id: string
  slug?: string
  title?: string
  topics?: { id: string; slug?: string; title?: string }[]
}

export interface HierarchySearchContextValue {
  /** When on an exam page: exam slug; otherwise null */
  examSlug: string | null
  /** When on an exam page: full hierarchy for that exam (same as sidebar). Enables client-side search with zero API. */
  subjects: HierarchySubject[] | null
  /** Set by exam layout when hierarchy is available; clear when leaving exam scope. */
  setHierarchy: (examSlug: string | null, subjects: HierarchySubject[] | null) => void
}

const HierarchySearchContext = createContext<HierarchySearchContextValue | null>(null)

export function HierarchySearchProvider({ children }: { children: React.ReactNode }) {
  const [examSlug, setExamSlug] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<HierarchySubject[] | null>(null)

  const setHierarchy = useCallback((slug: string | null, next: HierarchySubject[] | null) => {
    setExamSlug(slug)
    setSubjects(next)
  }, [])

  const value = useMemo<HierarchySearchContextValue>(
    () => ({ examSlug, subjects, setHierarchy }),
    [examSlug, subjects, setHierarchy],
  )

  return (
    <HierarchySearchContext.Provider value={value}>
      {children}
    </HierarchySearchContext.Provider>
  )
}

export function useHierarchySearch(): HierarchySearchContextValue | null {
  return useContext(HierarchySearchContext)
}

/** Flatten hierarchy (exam-scoped) into search result items. Uses same data as sidebar. */
export function flattenHierarchyForSearch(
  examSlug: string,
  subjects: HierarchySubject[],
): SearchResultItem[] {
  const items: SearchResultItem[] = []
  const base = `/exam/${examSlug}`

  for (const s of subjects) {
    const subjectSlug = s.slug || s.id
    items.push({
      type: 'subject',
      id: s.id,
      title: s.title ?? '',
      slug: subjectSlug,
      path: `${base}/${subjectSlug}`,
    })

    for (const u of s.units ?? []) {
      const unitSlug = u.slug || u.id
      items.push({
        type: 'unit',
        id: u.id,
        title: u.title ?? '',
        slug: unitSlug,
        path: `${base}/${subjectSlug}/${unitSlug}`,
      })

      for (const c of u.chapters ?? []) {
        const chapterSlug = c.slug || c.id
        items.push({
          type: 'chapter',
          id: c.id,
          title: c.title ?? '',
          slug: chapterSlug,
          path: `${base}/${subjectSlug}/${unitSlug}/${chapterSlug}`,
        })

        for (const t of c.topics ?? []) {
          const topicSlug = t.slug || t.id
          items.push({
            type: 'topic',
            id: t.id,
            title: t.title ?? '',
            slug: topicSlug,
            path: `${base}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}`,
          })
        }
      }
    }
  }

  return items
}

/** Client-side filter: match query against title/slug (case-insensitive). */
export function filterSearchResults(
  items: SearchResultItem[],
  query: string,
  limit = 20,
): SearchResultItem[] {
  if (!query.trim()) return []
  const q = query.trim().toLowerCase()
  const out: SearchResultItem[] = []
  for (const item of items) {
    if (out.length >= limit) break
    if (
      item.title.toLowerCase().includes(q) ||
      (item.slug && item.slug.toLowerCase().includes(q))
    ) {
      out.push(item)
    }
  }
  return out
}
