'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  Loader2,
  BookOpen,
  Layers,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  useHierarchySearch,
  flattenHierarchyForSearch,
  filterSearchResults,
  type SearchResultItem,
} from '@/context'

const DEBOUNCE_MS = 350
const MIN_QUERY_LENGTH = 2
const CACHE_TTL_MS = 120_000

const typeConfig: Record<
  SearchResultItem['type'],
  { label: string; icon: React.ElementType; className: string }
> = {
  exam: {
    label: 'Exam',
    icon: GraduationCap,
    className:
      'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20',
  },
  subject: {
    label: 'Subject',
    icon: BookOpen,
    className:
      'bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20',
  },
  unit: {
    label: 'Unit',
    icon: Layers,
    className:
      'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20',
  },
  chapter: {
    label: 'Chapter',
    icon: FileText,
    className:
      'bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/20',
  },
  topic: {
    label: 'Topic',
    icon: FileText,
    className:
      'bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20',
  },
  subtopic: {
    label: 'Subtopic',
    icon: FileText,
    className:
      'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-400 border border-sky-200/50 dark:border-sky-500/20',
  },
  definition: {
    label: 'Definition',
    icon: FileText,
    className:
      'bg-slate-500/10 text-slate-700 dark:bg-slate-400/15 dark:text-slate-400 border border-slate-200/50 dark:border-slate-500/20',
  },
}

export function GlobalSearch() {
  const router = useRouter()
  const ctx = useHierarchySearch()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Map<string, { data: SearchResultItem[]; at: number }>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setResults([])
        return
      }

      if (ctx?.examSlug && ctx?.subjects?.length) {
        const flat = flattenHierarchyForSearch(ctx.examSlug, ctx.subjects)
        const filtered = filterSearchResults(flat, trimmed, 20)
        setResults(filtered)
        setLoading(false)
        return
      }

      const cacheKey = `global:${trimmed.toLowerCase()}`
      const cached = cacheRef.current.get(cacheKey)
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        setResults(cached.data)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=20`
        )
        const json = (await res.json()) as { results?: SearchResultItem[] }
        const data = json.results ?? []
        setResults(data)
        cacheRef.current.set(cacheKey, { data, at: Date.now() })
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [ctx?.examSlug, ctx?.subjects]
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      runSearch(query)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleSelect = (item: SearchResultItem) => {
    router.push(item.path)
    setOpen(false)
  }

  const isExamScope = Boolean(ctx?.examSlug && ctx?.subjects?.length)
  const scopeLabel = isExamScope
    ? 'Searching in this exam'
    : 'Searching across all exams & content'
  const hasQuery = query.trim().length >= MIN_QUERY_LENGTH
  const showEmpty = !loading && hasQuery && results.length === 0
  const showResults = !loading && results.length > 0

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="top"
          className="rounded-none border-0 p-0 gap-0 max-h-[88vh] flex flex-col overflow-hidden bg-transparent shadow-none [&>button]:hidden"
        >
          {/* Centered modal panel (overlay comes from Sheet) */}
          <div
            className={cn(
              'relative z-50 w-full max-w-2xl mx-auto mt-[12vh] rounded-2xl overflow-hidden',
              'bg-white dark:bg-gray-900',
              'shadow-2xl shadow-black/20 dark:shadow-black/40',
              'ring-1 ring-black/5 dark:ring-white/10',
              'flex flex-col max-h-[70vh]',
              'animate-in fade-in-0 slide-in-from-top-4 duration-200'
            )}
          >
            {/* Search input area */}
            <div className="flex-shrink-0 p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none"
                    strokeWidth={2}
                  />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search exams, subjects, topics..."
                    className={cn(
                      'h-12 pl-12 pr-4 rounded-xl text-base font-medium',
                      'bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700',
                      'placeholder:text-muted-foreground/70',
                      'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50',
                      'transition-shadow duration-200'
                    )}
                    aria-label="Search"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                    isExamScope
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'bg-muted/80 text-muted-foreground'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {scopeLabel}
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[10px]">Esc</kbd> to close
                </span>
              </div>
            </div>

            {/* Results area */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 pb-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Loader2 className="h-5 w-5 text-primary absolute inset-0 m-auto animate-spin" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Searching...</p>
                  </div>
                )}

                {showEmpty && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted/80 flex items-center justify-center">
                      <Search className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">No results found</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Try a different keyword or check the spelling
                      </p>
                    </div>
                  </div>
                )}

                {showResults && (
                  <ul className="space-y-1">
                    {results.map((item, index) => {
                      const config = typeConfig[item.type]
                      const Icon = config.icon
                      return (
                        <li
                          key={`${item.type}-${item.id}`}
                          className="animate-in fade-in-0 slide-in-from-top-1 duration-200"
                          style={{ animationDelay: `${Math.min(index * 25, 200)}ms`, animationFillMode: 'backwards' }}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(item)}
                            className={cn(
                              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left',
                              'hover:bg-gray-50 dark:hover:bg-gray-800/80',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
                              'transition-all duration-150 group'
                            )}
                          >
                            <span
                              className={cn(
                                'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider border',
                                config.className
                              )}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                              {config.label}
                            </span>
                            <span className="flex-1 min-w-0 truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {!hasQuery && !loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                      <Search className="h-7 w-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Search your content</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Type at least 2 characters to search exams, subjects, units, and more
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
