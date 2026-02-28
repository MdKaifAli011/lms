"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Search, Eye, Edit, Trash2, Power, Check, GripVertical, ArrowLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { capitalize } from "@/lib/utils"

const EXAMS_API = "/api/exams"
const SUBJECTS_API = "/api/subjects"
const UNITS_API = "/api/units"
const CHAPTERS_API = "/api/chapters"
const TOPICS_API = "/api/topics"

type ExamOption = { id: string; name: string; status?: string }
type SubjectOption = { id: string; name: string; examId: string; status?: string; orderNumber?: number }
type UnitOption = { id: string; name: string; subjectId: string; status?: string; orderNumber?: number }
type ChapterOption = {
  id: string
  unitId: string
  name: string
  orderNumber: number
  status: "Active" | "Inactive"
}

type Topic = {
  id: string
  chapterId: string
  name: string
  slug: string
  orderNumber: number
  content: string
  meta: string
  visits: number
  uniqueVisits: number
  today: number
  status: "Active" | "Inactive"
}

export default function TopicsPage() {
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [units, setUnits] = React.useState<UnitOption[]>([])
  const [chapters, setChapters] = React.useState<ChapterOption[]>([])
  const [topics, setTopics] = React.useState<Topic[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [examFilter, setExamFilter] = React.useState<string>("all")
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all")
  const [unitFilter, setUnitFilter] = React.useState<string>("all")
  const [chapterFilter, setChapterFilter] = React.useState<string>("all")
  const [metaFilter, setMetaFilter] = React.useState<"all" | "filled" | "not-filled">("all")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(null)
  const [addTopicRows, setAddTopicRows] = React.useState<{ chapterId: string | null; topicNames: string }[]>([
    { chapterId: null, topicNames: "" },
  ])

  const [editingTopic, setEditingTopic] = React.useState<Topic | null>(null)
  const [topicToDelete, setTopicToDelete] = React.useState<Topic | null>(null)

  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [draggedTopic, setDraggedTopic] = React.useState<Topic | null>(null)
  const [dragOverTopic, setDragOverTopic] = React.useState<Topic | null>(null)

  const [quickCreateSelectedChapterIds, setQuickCreateSelectedChapterIds] = React.useState<string[]>([])
  const [quickCreateTopicsByChapterId, setQuickCreateTopicsByChapterId] = React.useState<Record<string, string>>({})

  const fetchExams = React.useCallback(async () => {
    try {
      const res = await fetch(`${EXAMS_API}?contextapi=1`)
      if (!res.ok) throw new Error("Failed to load exams")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.exams ?? [])
      setExams(list.map((e: { id: string; name: string; status?: string }) => ({ id: e.id, name: e.name, status: e.status })))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load exams")
    }
  }, [])

  const fetchSubjects = React.useCallback(async () => {
    try {
      const res = await fetch(SUBJECTS_API)
      if (!res.ok) throw new Error("Failed to load subjects")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.subjects ?? [])
      setSubjects(list.map((s: { id: string; name: string; examId: string; status?: string; orderNumber?: number }) => ({ id: s.id, name: s.name, examId: s.examId, status: s.status, orderNumber: s.orderNumber })))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subjects")
    }
  }, [])

  const fetchUnits = React.useCallback(async () => {
    try {
      const res = await fetch(UNITS_API)
      if (!res.ok) throw new Error("Failed to load units")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.units ?? [])
      setUnits(list.map((u: { id: string; name: string; subjectId: string; status?: string; orderNumber?: number }) => ({ id: u.id, name: u.name, subjectId: u.subjectId, status: u.status, orderNumber: u.orderNumber })))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load units")
    }
  }, [])

  const fetchChapters = React.useCallback(async () => {
    try {
      const res = await fetch(CHAPTERS_API)
      if (!res.ok) throw new Error("Failed to load chapters")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.chapters ?? [])
      setChapters(list.map((c: { id: string; unitId: string; name: string; orderNumber: number; status?: string }) => ({ id: c.id, unitId: c.unitId, name: c.name, orderNumber: c.orderNumber ?? 0, status: c.status ?? "Active" })))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chapters")
    }
  }, [])

  const fetchTopics = React.useCallback(async () => {
    try {
      const res = await fetch(TOPICS_API)
      if (!res.ok) throw new Error("Failed to load topics")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.topics ?? [])
      setTopics(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topics")
    }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchExams(), fetchSubjects(), fetchUnits(), fetchChapters(), fetchTopics()])
    setLoading(false)
  }, [fetchExams, fetchSubjects, fetchUnits, fetchChapters, fetchTopics])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const availableExams = React.useMemo(
    () => exams.filter((e) => e.status !== "Inactive"),
    [exams]
  )
  const subjectsForSelectedExam = React.useMemo(
    () => subjects.filter((s) => s.examId === selectedExamId && s.status !== "Inactive"),
    [subjects, selectedExamId]
  )
  const unitsForSelectedSubject = React.useMemo(
    () => units.filter((u) => u.subjectId === selectedSubjectId && u.status !== "Inactive"),
    [units, selectedSubjectId]
  )
  const chaptersForSelectedUnit = React.useMemo(
    () => chapters.filter((c) => c.unitId === selectedUnitId && c.status !== "Inactive").sort((a, b) => a.orderNumber - b.orderNumber),
    [chapters, selectedUnitId]
  )

  const subjectsForExamFilter = React.useMemo(() => {
    if (examFilter === "all") return []
    return subjects.filter((s) => String(s.examId) === examFilter)
  }, [subjects, examFilter])

  const unitsForSubjectFilter = React.useMemo(() => {
    if (subjectFilter === "all") return []
    return units.filter((u) => String(u.subjectId) === subjectFilter)
  }, [units, subjectFilter])

  const chaptersForUnitFilter = React.useMemo(() => {
    if (unitFilter === "all") return []
    return chapters.filter((c) => String(c.unitId) === unitFilter).sort((a, b) => a.orderNumber - b.orderNumber)
  }, [chapters, unitFilter])

  const quickCreateAvailableChapters = React.useMemo(() => {
    return chapters.filter((c) => {
      const unit = units.find((u) => u.id === c.unitId)
      if (!unit) return false
      const subject = subjects.find((s) => s.id === unit.subjectId)
      return subject && availableExams.some((e) => e.id === subject.examId) && c.status !== "Inactive"
    })
  }, [chapters, units, subjects, availableExams])

  const getExamName = (examId: string) => capitalize(exams.find((e) => e.id === examId)?.name ?? "-")
  const getSubjectName = (subjectId: string) => capitalize(subjects.find((s) => s.id === subjectId)?.name ?? "-")
  const getUnitName = (unitId: string) => capitalize(units.find((u) => u.id === unitId)?.name ?? "-")
  const getChapterName = (chapterId: string) => capitalize(chapters.find((c) => c.id === chapterId)?.name ?? "-")

  const quickCreateSelectedChaptersSorted = React.useMemo(() => {
    return quickCreateAvailableChapters
      .filter((c) => quickCreateSelectedChapterIds.includes(c.id))
      .sort((a, b) => {
        const uA = units.find((u) => u.id === a.unitId)
        const uB = units.find((u) => u.id === b.unitId)
        if (!uA || !uB) return 0
        const sA = subjects.find((s) => s.id === uA.subjectId)
        const sB = subjects.find((s) => s.id === uB.subjectId)
        if (!sA || !sB) return 0
        if (getExamName(sA.examId) !== getExamName(sB.examId))
          return getExamName(sA.examId).localeCompare(getExamName(sB.examId))
        if (sA.name !== sB.name) return sA.name.localeCompare(sB.name)
        if (uA.name !== uB.name) return uA.name.localeCompare(uB.name)
        return a.orderNumber - b.orderNumber
      })
  }, [quickCreateAvailableChapters, quickCreateSelectedChapterIds, units, subjects])

  const quickCreateUnitsGrouped = React.useMemo(() => {
    const byUnit = new Map<string, { unitId: string; label: string; chapterIds: string[] }>()
    quickCreateAvailableChapters.forEach((c) => {
      const unit = units.find((u) => u.id === c.unitId)
      if (!unit) return
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return
      if (!byUnit.has(c.unitId)) {
        byUnit.set(c.unitId, {
          unitId: c.unitId,
          label: `${getExamName(subject.examId)} > ${capitalize(subject.name)} > ${capitalize(unit.name)}`,
          chapterIds: [],
        })
      }
      byUnit.get(c.unitId)!.chapterIds.push(c.id)
    })
    return Array.from(byUnit.values())
  }, [quickCreateAvailableChapters, units, subjects])

  React.useEffect(() => {
    if (!selectedUnitId) return
    setAddTopicRows([{ chapterId: null, topicNames: "" }])
  }, [selectedUnitId])

  const updateAddRow = (index: number, field: "chapterId" | "topicNames", value: string | null) => {
    setAddTopicRows((prev) => {
      const next = [...prev]
      if (field === "chapterId") next[index] = { ...next[index], chapterId: value }
      else next[index] = { ...next[index], topicNames: value ?? "" }
      return next
    })
  }

  const removeAddRow = (index: number) => {
    setAddTopicRows((prev) => prev.filter((_, i) => i !== index))
  }

  const addAnotherChapterRow = () => {
    setAddTopicRows((prev) => [...prev, { chapterId: null, topicNames: "" }])
  }

  const getNextOrderForChapter = (chapterId: string) => {
    const max = Math.max(
      ...topics.filter((t) => t.chapterId === chapterId).map((t) => t.orderNumber),
      0
    )
    return max + 1
  }

  const handleAddTopics = async () => {
    const toCreate: { chapterId: string; name: string }[] = []
    addTopicRows.forEach((row) => {
      if (!row.chapterId) return
      const names = row.topicNames
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      names.forEach((name) => toCreate.push({ chapterId: row.chapterId!, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { chapterId, name } of toCreate) {
      try {
        const res = await fetch(TOPICS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, chapterId }),
        })
        if (res.status === 409) {
          duplicate++
          toast.warning(`"${name}" already exists in this chapter`)
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create topic")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create topic")
      }
    }
    if (created) {
      await fetchTopics()
      toast.success(`${created} topic(s) created`)
    }
    if (duplicate && !created) toast.warning(`${duplicate} skipped (already exist in this chapter)`)
    setIsAddDialogOpen(false)
    setSelectedExamId(null)
    setSelectedSubjectId(null)
    setSelectedUnitId(null)
    setAddTopicRows([{ chapterId: null, topicNames: "" }])
  }

  const toggleQuickCreateChapter = (chapterId: string) => {
    setQuickCreateSelectedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    )
  }

  const toggleQuickCreateSelectAll = () => {
    setQuickCreateSelectedChapterIds((prev) =>
      prev.length === quickCreateAvailableChapters.length
        ? []
        : quickCreateAvailableChapters.map((c) => c.id)
    )
  }

  const toggleQuickCreateByUnit = (unitId: string) => {
    const group = quickCreateUnitsGrouped.find((g) => g.unitId === unitId)
    if (!group) return
    setQuickCreateSelectedChapterIds((prev) => {
      const allSelected = group.chapterIds.every((id) => prev.includes(id))
      if (allSelected) return prev.filter((id) => !group.chapterIds.includes(id))
      const added = new Set(prev)
      group.chapterIds.forEach((id) => added.add(id))
      return Array.from(added)
    })
  }

  const resetQuickCreate = () => {
    setQuickCreateSelectedChapterIds([])
    setQuickCreateTopicsByChapterId({})
  }

  const handleBulkCreateTopics = async () => {
    if (quickCreateSelectedChapterIds.length === 0) return
    const toCreate: { chapterId: string; name: string }[] = []
    quickCreateSelectedChapterIds.forEach((chapterId) => {
      const raw = quickCreateTopicsByChapterId[chapterId] || ""
      const names = raw
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      names.forEach((name) => toCreate.push({ chapterId, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { chapterId, name } of toCreate) {
      try {
        const res = await fetch(TOPICS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, chapterId }),
        })
        if (res.status === 409) {
          duplicate++
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create topic")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create topic")
      }
    }
    if (created) {
      await fetchTopics()
      toast.success(`${created} topic(s) created`)
    }
    if (duplicate) toast.warning(`${duplicate} skipped (already exist in this chapter)`)
    setIsQuickCreateOpen(false)
    resetQuickCreate()
  }

  const openEditDialog = (topic: Topic) => {
    setEditingTopic({ ...topic })
    setIsEditDialogOpen(true)
  }

  const handleEditTopic = async () => {
    if (!editingTopic) return
    try {
      const res = await fetch(`${TOPICS_API}/${editingTopic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingTopic.name,
          chapterId: editingTopic.chapterId,
          status: editingTopic.status,
          orderNumber: editingTopic.orderNumber,
        }),
      })
      if (res.status === 409) {
        toast.error("A topic with this name already exists in this chapter")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update topic")
        return
      }
      await fetchTopics()
      toast.success("Topic updated")
      setIsEditDialogOpen(false)
      setEditingTopic(null)
    } catch {
      toast.error("Failed to update topic")
    }
  }

  const handleDeleteTopic = (topic: Topic) => {
    setTopicToDelete(topic)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return
    try {
      const res = await fetch(`${TOPICS_API}/${topicToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to delete topic")
        return
      }
      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id))
      setIsDeleteDialogOpen(false)
      setTopicToDelete(null)
      toast.success("Topic deleted")
    } catch {
      toast.error("Failed to delete topic")
    }
  }

  const handleToggleStatus = async (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (!topic) return
    const nextStatus = topic.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${TOPICS_API}/${topicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update status")
        return
      }
      setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, status: nextStatus } : t)))
    } catch {
      toast.error("Failed to update status")
    }
  }

  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => {
    setIsReorderingEnabled(false)
    setDraggedTopic(null)
    setDragOverTopic(null)
  }

  const saveReorderedTopics = async () => {
    const order = topics
      .slice()
      .sort((a, b) => {
        if (a.chapterId !== b.chapterId) return a.chapterId.localeCompare(b.chapterId)
        return a.orderNumber - b.orderNumber
      })
      .map((t) => ({ id: t.id, orderNumber: t.orderNumber }))
    try {
      const res = await fetch(`${TOPICS_API}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to save order")
        return
      }
      await fetchTopics()
      toast.success("Order saved")
      disableReordering()
    } catch {
      toast.error("Failed to save order")
    }
  }

  const handleTopicDragStart = (e: React.DragEvent, topic: Topic) => {
    if (!isReorderingEnabled) return
    setDraggedTopic(topic)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(topic.id))
  }

  const handleTopicDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleTopicDragEnter = (topic: Topic) => setDragOverTopic(topic)
  const handleTopicDragLeave = () => setDragOverTopic(null)

  const handleTopicDrop = (e: React.DragEvent, target: Topic) => {
    e.preventDefault()
    if (!isReorderingEnabled) return
    if (!draggedTopic || draggedTopic.id === target.id) return
    if (draggedTopic.chapterId !== target.chapterId) return

    setTopics((prev) => {
      const other = prev.filter((t) => t.chapterId !== target.chapterId)
      const group = prev
        .filter((t) => t.chapterId === target.chapterId)
        .slice()
        .sort((a, b) => a.orderNumber - b.orderNumber)
      const fromIndex = group.findIndex((t) => t.id === draggedTopic.id)
      const toIndex = group.findIndex((t) => t.id === target.id)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = group.splice(fromIndex, 1)
      group.splice(toIndex, 0, moved)
      const reordered = group.map((t, idx) => ({ ...t, orderNumber: idx + 1 }))
      return [...other, ...reordered]
    })
    setDraggedTopic(null)
    setDragOverTopic(null)
  }

  const filteredTopics = React.useMemo(() => {
    return topics.filter((t) => {
      const chapter = chapters.find((c) => c.id === t.chapterId)
      if (!chapter) return false
      const unit = units.find((u) => u.id === chapter.unitId)
      if (!unit) return false
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return false
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExam = examFilter === "all" || String(subject.examId) === examFilter
      const matchesSubject = subjectFilter === "all" || String(unit.subjectId) === subjectFilter
      const matchesUnit = unitFilter === "all" || String(chapter.unitId) === unitFilter
      const matchesChapter = chapterFilter === "all" || String(t.chapterId) === chapterFilter
      const matchesMeta =
        metaFilter === "all" ||
        (metaFilter === "filled" && t.meta !== "-") ||
        (metaFilter === "not-filled" && t.meta === "-")
      return matchesSearch && matchesExam && matchesSubject && matchesUnit && matchesChapter && matchesMeta
    })
  }, [topics, chapters, units, subjects, searchTerm, examFilter, subjectFilter, unitFilter, chapterFilter, metaFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, examFilter, subjectFilter, unitFilter, chapterFilter, metaFilter, pageSize])

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]
  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedTopics = filteredTopics.slice(startIndex, startIndex + pageSize)

  const groupedPaged = React.useMemo(() => {
    const map = new Map<string, { examId: string; subjectId: string; unitId: string; chapterId: string; topics: Topic[] }>()
    pagedTopics.forEach((t) => {
      const chapter = chapters.find((c) => c.id === t.chapterId)
      if (!chapter) return
      const unit = units.find((u) => u.id === chapter.unitId)
      if (!unit) return
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return
      const key = `${subject.examId}-${unit.subjectId}-chapter-${t.chapterId}`
      if (!map.has(key)) {
        map.set(key, { examId: subject.examId, subjectId: unit.subjectId, unitId: chapter.unitId, chapterId: t.chapterId, topics: [] })
      }
      map.get(key)!.topics.push(t)
    })
    map.forEach((v) => {
      v.topics.sort((a, b) => a.orderNumber - b.orderNumber)
    })
    return Array.from(map.values())
  }, [pagedTopics, chapters, units, subjects])

  const totalTopics = topics.length
  const activeTopics = topics.filter((t) => t.status === "Active").length
  const totalVisits = topics.reduce((s, t) => s + t.visits, 0)
  const todayVisits = topics.reduce((s, t) => s + t.today, 0)

  const canAddTopics = addTopicRows.some((r) => r.chapterId && r.topicNames.trim().split(/\r?\n/).some((l) => l.trim()))

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading topics…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={loadData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 rounded-lg" />
          <Separator orientation="vertical" className="mr-2 h-5 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Topics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Topics
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Add New Topics</DialogTitle>
                <DialogDescription>
                  Select exam, subject, and unit. Then select chapter(s) and enter topic names for each chapter (one per line).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Exam *</Label>
                  <Select
                    value={selectedExamId ?? ""}
                    onValueChange={(v) => {
                      setSelectedExamId(v || null)
                      setSelectedSubjectId(null)
                      setSelectedUnitId(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {capitalize(e.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subject *</Label>
                  <Select
                    value={selectedSubjectId ?? ""}
                    onValueChange={(v) => {
                      setSelectedSubjectId(v || null)
                      setSelectedUnitId(null)
                    }}
                    disabled={!selectedExamId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsForSelectedExam.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {capitalize(s.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unit *</Label>
                  <Select
                    value={selectedUnitId ?? ""}
                    onValueChange={(v) => setSelectedUnitId(v || null)}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsForSelectedSubject.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {capitalize(u.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Chapter(s) and Enter Topics *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAnotherChapterRow}>
                      Add Another Chapter
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select chapters and enter topics for each chapter separately. Each chapter has its own textarea.
                  </p>
                  <div className="max-h-[280px] space-y-4 overflow-y-auto rounded-md border p-3">
                    {addTopicRows.map((row, index) => (
                      <div key={index} className="rounded border bg-muted/20 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="shrink-0 text-xs">Chapter {index + 1} *</Label>
                          <Select
                            value={row.chapterId ?? ""}
                            onValueChange={(v) => updateAddRow(index, "chapterId", v || null)}
                            disabled={!selectedUnitId}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select Chapter" />
                            </SelectTrigger>
                            <SelectContent>
                              {chaptersForSelectedUnit.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {capitalize(c.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {addTopicRows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive"
                              onClick={() => removeAddRow(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          placeholder={"Topic 1\nTopic 2\nTopic 3\n..."}
                          value={row.topicNames}
                          onChange={(e) => updateAddRow(index, "topicNames", e.target.value)}
                          className="min-h-[80px] text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTopics} disabled={!canAddTopics}>
                  Add Topics
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setIsQuickCreateOpen(true)}
          >
            Quick Create
          </Button>
        </div>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
        {isQuickCreateOpen ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 shrink-0"
                  onClick={() => {
                    setIsQuickCreateOpen(false)
                    resetQuickCreate()
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to list
                </Button>
              </div>
              <CardTitle className="text-xl">Quick Create Topics</CardTitle>
              <CardDescription>
                Select one or more chapters and enter topic names for each chapter (one per line). Content and meta can be added later.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Chapters *</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-muted-foreground"
                        type="button"
                        onClick={toggleQuickCreateSelectAll}
                      >
                        {quickCreateSelectedChapterIds.length === quickCreateAvailableChapters.length
                          ? "Clear all"
                          : "Select all"}
                      </Button>
                      {quickCreateUnitsGrouped.length > 1 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          {quickCreateUnitsGrouped.map(({ unitId, label, chapterIds }) => {
                            const allIn = chapterIds.every((id) =>
                              quickCreateSelectedChapterIds.includes(id)
                            )
                            return (
                              <Button
                                key={unitId}
                                type="button"
                                variant={allIn ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 rounded-full px-3 text-xs font-medium"
                                onClick={() => toggleQuickCreateByUnit(unitId)}
                              >
                                {allIn ? "✓ " : ""}{label}
                              </Button>
                            )
                          })}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click a unit to select or clear all its chapters at once.
                  </p>
                  <div className="rounded-md border bg-background">
                    <div className="max-h-56 overflow-auto p-2">
                      {quickCreateAvailableChapters.map((chapter) => {
                        const unit = units.find((u) => u.id === chapter.unitId)
                        const subject = unit ? subjects.find((s) => s.id === unit.subjectId) : null
                        const label = subject && unit
                          ? `${getExamName(subject.examId)} > ${subject.name} > ${unit.name} > ${chapter.name}`
                          : chapter.name
                        const checked = quickCreateSelectedChapterIds.includes(chapter.id)
                        return (
                          <label
                            key={chapter.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuickCreateChapter(chapter.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                      {quickCreateSelectedChapterIds.length} chapter
                      {quickCreateSelectedChapterIds.length === 1 ? "" : "s"} selected
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Topic Names *</Label>
                  {quickCreateSelectedChaptersSorted.length === 0 ? (
                    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                      Select at least one chapter to start adding topics.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {quickCreateSelectedChaptersSorted.map((chapter) => {
                        const unit = units.find((u) => u.id === chapter.unitId)
                        const subject = unit ? subjects.find((s) => s.id === unit.subjectId) : null
                        const label = subject && unit
                          ? `${getExamName(subject.examId)} > ${subject.name} > ${unit.name} > ${chapter.name}`
                          : chapter.name
                        return (
                          <div key={chapter.id} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {label} <span className="text-destructive">*</span>
                              </div>
                              <div className="text-xs text-muted-foreground">One topic per line</div>
                            </div>
                            <Textarea
                              value={quickCreateTopicsByChapterId[chapter.id] ?? ""}
                              onChange={(e) =>
                                setQuickCreateTopicsByChapterId((prev) => ({
                                  ...prev,
                                  [chapter.id]: e.target.value,
                                }))
                              }
                              placeholder={"Topic 1\nTopic 2\n..."}
                              className="min-h-[110px]"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" type="button" onClick={() => { setIsQuickCreateOpen(false); resetQuickCreate(); }}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkCreateTopics}
                  disabled={
                    quickCreateSelectedChapterIds.length === 0 ||
                    quickCreateSelectedChaptersSorted.every((c) => !(quickCreateTopicsByChapterId[c.id] || "").trim())
                  }
                >
                  Create Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Topics</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{totalTopics}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All topics in system</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Active Topics</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{activeTopics}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Currently active</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Visits</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{totalVisits}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All time visits</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Today&apos;s Visits</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{todayVisits}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visits today</p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 border-border/80 shadow-sm">
              <CardHeader className="space-y-6 pb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl font-semibold tracking-tight">Topic Management</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Manage and organize your topics, create new topics, and track topic performance across your educational platform.
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isReorderingEnabled ? (
                      <Button variant="outline" size="sm" className="h-9 px-3" onClick={enableReordering}>
                        <GripVertical className="mr-2 h-4 w-4" />
                        Reorder position
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={disableReordering}>
                          Cancel
                        </Button>
                        <Button size="sm" className="h-9 px-3" onClick={saveReorderedTopics}>
                          Save Order
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex flex-col gap-3 md:flex-row flex-wrap">
                  <div className="relative max-w-sm flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 pl-10 rounded-lg"
                    />
                  </div>
                  <Select
                    value={examFilter}
                    onValueChange={(v) => {
                      setExamFilter(v)
                      setSubjectFilter("all")
                      setUnitFilter("all")
                      setChapterFilter("all")
                    }}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {availableExams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{capitalize(e.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={subjectFilter}
                    onValueChange={(v) => { setSubjectFilter(v); setUnitFilter("all"); setChapterFilter("all"); }}
                    disabled={examFilter === "all"}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder={examFilter === "all" ? "Select exam first" : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsForExamFilter.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{capitalize(s.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={unitFilter}
                    onValueChange={(v) => { setUnitFilter(v); setChapterFilter("all"); }}
                    disabled={subjectFilter === "all"}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder={subjectFilter === "all" ? "Select subject first" : "Select Unit"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {unitsForSubjectFilter.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{capitalize(u.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={chapterFilter}
                    onValueChange={setChapterFilter}
                    disabled={unitFilter === "all"}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder={unitFilter === "all" ? "Select unit first" : "Select Chapter"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chaptersForUnitFilter.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{capitalize(c.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={metaFilter} onValueChange={(v: "all" | "filled" | "not-filled") => setMetaFilter(v)}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder="Meta Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="filled">Meta Filled</SelectItem>
                      <SelectItem value="not-filled">Meta Not Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden">
                <div className="space-y-5">
                  {groupedPaged.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <GripVertical className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No topics yet</p>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Add topics via Add New Topics or Quick Create for multiple chapters at once.
                      </p>
                    </div>
                  ) : (
                    groupedPaged.map(({ examId, subjectId, unitId, chapterId, topics: groupTopics }) => (
                      <Card key={`${examId}-${subjectId}-${unitId}-${chapterId}`} className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getExamName(examId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getSubjectName(subjectId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getUnitName(unitId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getChapterName(chapterId)}</Badge>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                              {groupTopics.length} topic{groupTopics.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="w-full overflow-x-auto">
                            <Table className="table-fixed min-w-[780px] w-full sm:min-w-[980px]">
                              <TableHeader>
                                <TableRow className="border-b border-border/80 hover:bg-transparent">
                                  <TableHead className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[88px]">Order</TableHead>
                                  <TableHead className="min-w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:min-w-[200px]">Topic Name</TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[140px]">Content</TableHead>
                                  <TableHead className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta</TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visits</TableHead>
                                  <TableHead className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</TableHead>
                                  <TableHead className="w-[140px] shrink-0 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[190px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {groupTopics.map((topic) => (
                                  <TableRow
                                    key={topic.id}
                                    className={`transition-colors ${topic.status === "Inactive" ? "opacity-60" : "hover:bg-muted/40"} ${dragOverTopic?.id === topic.id ? "border-2 border-primary/30 bg-primary/5" : ""} ${isReorderingEnabled ? "cursor-move" : "cursor-default"}`}
                                    draggable={isReorderingEnabled}
                                    onDragStart={(e) => handleTopicDragStart(e, topic)}
                                    onDragOver={handleTopicDragOver}
                                    onDragEnter={() => handleTopicDragEnter(topic)}
                                    onDragLeave={handleTopicDragLeave}
                                    onDrop={(e) => handleTopicDrop(e, topic)}
                                  >
                                    <TableCell className="py-3 pr-3">
                                      <div className={isReorderingEnabled ? "flex cursor-grab items-center justify-center gap-2 text-muted-foreground" : "flex items-center justify-center"} title={isReorderingEnabled ? "Drag to reorder" : undefined}>
                                        {isReorderingEnabled && <GripVertical className="h-4 w-4" />}
                                        <span className="min-w-6 text-center font-medium text-foreground">{topic.orderNumber}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                    <Link
                                        href={`/self-study/topics/${topic.id}`}
                                        className={
                                          topic.status === "Inactive"
                                            ? "line-through text-muted-foreground hover:underline hover:text-primary"
                                            : "hover:underline hover:text-primary"
                                        }
                                      >
                                        {capitalize(topic.name)}
                                      </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{topic.content !== "-" ? topic.content : "unavailable"}</TableCell>
                                    <TableCell>{topic.meta !== "-" ? <Check className="inline h-4 w-4 text-green-500" /> : "-"}</TableCell>
                                    <TableCell>
                                      {topic.visits > 0 ? (
                                        <div>
                                          <div className="font-medium">{topic.visits}</div>
                                          <div className="text-xs text-muted-foreground">({topic.uniqueVisits} unique)</div>
                                        </div>
                                      ) : "-"}
                                    </TableCell>
                                    <TableCell>{topic.today > 0 ? topic.today : "-"}</TableCell>
                                    <TableCell className="text-right pr-2">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600" title="View" asChild>
                                          <Link href={`/self-study/topics/${topic.id}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-amber-500 hover:bg-amber-50 hover:text-amber-600" title="Edit" onClick={() => openEditDialog(topic)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className={`h-8 w-8 transition-colors ${topic.status === "Active" ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`} title={topic.status === "Active" ? "Turn Off" : "Turn On"} onClick={() => handleToggleStatus(topic.id)}><Power className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={() => handleDeleteTopic(topic)}><Trash2 className="h-4 w-4" /></Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                        <SelectTrigger className="h-9 w-[110px] rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>{filteredTopics.length === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredTopics.length)} of ${filteredTopics.length}`}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-3" disabled={safePage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>
                      <Button variant="outline" size="sm" className="h-9 px-3" disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>Update topic details.</DialogDescription>
          </DialogHeader>
          {editingTopic && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-topic-name">Topic Name *</Label>
                <Input id="edit-topic-name" value={editingTopic.name} onChange={(e) => setEditingTopic((prev) => (prev ? { ...prev, name: e.target.value } : null))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-topic-order">Order Number</Label>
                <Input id="edit-topic-order" type="number" value={editingTopic.orderNumber} onChange={(e) => setEditingTopic((prev) => (prev ? { ...prev, orderNumber: parseInt(e.target.value, 10) || 0 } : null))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTopic}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete the topic &quot;{topicToDelete?.name}&quot;? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteTopic}>Delete Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
