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

type ExamOption = { id: string; name: string; status?: string }
type SubjectOption = { id: string; name: string; examId: string; status?: string; orderNumber?: number }
type UnitOption = { id: string; name: string; subjectId: string; status?: string; orderNumber?: number }

type Chapter = {
  id: string
  unitId: string
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

export default function ChaptersPage() {
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [units, setUnits] = React.useState<UnitOption[]>([])
  const [chapters, setChapters] = React.useState<Chapter[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [examFilter, setExamFilter] = React.useState<string>("all")
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all")
  const [unitFilter, setUnitFilter] = React.useState<string>("all")
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
  const [addChapterRows, setAddChapterRows] = React.useState<{ name: string; orderNumber: number }[]>([
    { name: "", orderNumber: 1 },
  ])

  const [editingChapter, setEditingChapter] = React.useState<Chapter | null>(null)
  const [chapterToDelete, setChapterToDelete] = React.useState<Chapter | null>(null)

  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [draggedChapter, setDraggedChapter] = React.useState<Chapter | null>(null)
  const [dragOverChapter, setDragOverChapter] = React.useState<Chapter | null>(null)

  const [quickCreateSelectedUnitIds, setQuickCreateSelectedUnitIds] = React.useState<string[]>([])
  const [quickCreateChaptersByUnitId, setQuickCreateChaptersByUnitId] = React.useState<Record<string, string>>({})

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
      setChapters(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chapters")
    }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchExams(), fetchSubjects(), fetchUnits(), fetchChapters()])
    setLoading(false)
  }, [fetchExams, fetchSubjects, fetchUnits, fetchChapters])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const availableExams = React.useMemo(() => exams.filter((e) => e.status !== "Inactive"), [exams])
  const subjectsForSelectedExam = React.useMemo(
    () => subjects.filter((s) => s.examId === selectedExamId && s.status !== "Inactive"),
    [subjects, selectedExamId]
  )
  const unitsForSelectedSubject = React.useMemo(
    () => units.filter((u) => u.subjectId === selectedSubjectId && u.status !== "Inactive"),
    [units, selectedSubjectId]
  )

  const subjectsForExamFilter = React.useMemo(() => {
    if (examFilter === "all") return []
    return subjects.filter((s) => s.examId === examFilter)
  }, [subjects, examFilter])

  const unitsForSubjectFilter = React.useMemo(() => {
    if (subjectFilter === "all") return []
    return units.filter((u) => u.subjectId === subjectFilter)
  }, [units, subjectFilter])

  const quickCreateAvailableUnits = React.useMemo(() => {
    return units.filter((u) => {
      const subject = subjects.find((s) => s.id === u.subjectId)
      return subject && availableExams.some((e) => e.id === subject.examId) && u.status !== "Inactive"
    })
  }, [units, subjects, availableExams])

  const getExamName = (examId: string) => capitalize(exams.find((e) => e.id === examId)?.name ?? "-")
  const getSubjectName = (subjectId: string) => capitalize(subjects.find((s) => s.id === subjectId)?.name ?? "-")
  const getUnitName = (unitId: string) => capitalize(units.find((u) => u.id === unitId)?.name ?? "-")

  const quickCreateSelectedUnitsSorted = React.useMemo(() => {
    return quickCreateAvailableUnits
      .filter((u) => quickCreateSelectedUnitIds.includes(u.id))
      .sort((a, b) => {
        const subA = subjects.find((s) => s.id === a.subjectId)
        const subB = subjects.find((s) => s.id === b.subjectId)
        if (!subA || !subB) return 0
        const examA = getExamName(subA.examId)
        const examB = getExamName(subB.examId)
        if (examA !== examB) return examA.localeCompare(examB)
        if (subA.name !== subB.name) return subA.name.localeCompare(subB.name)
        return (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
      })
  }, [quickCreateAvailableUnits, quickCreateSelectedUnitIds, subjects, exams])

  const quickCreateSubjectsGrouped = React.useMemo(() => {
    const bySubject = new Map<string, { subjectId: string; label: string; unitIds: string[] }>()
    quickCreateAvailableUnits.forEach((u) => {
      const subject = subjects.find((s) => s.id === u.subjectId)
      if (!subject) return
      if (!bySubject.has(u.subjectId)) {
        bySubject.set(u.subjectId, {
          subjectId: u.subjectId,
          label: `${getExamName(subject.examId)} > ${capitalize(subject.name)}`,
          unitIds: [],
        })
      }
      bySubject.get(u.subjectId)!.unitIds.push(u.id)
    })
    return Array.from(bySubject.values())
  }, [quickCreateAvailableUnits, subjects])

  const updateAddRow = (index: number, field: "name" | "orderNumber", value: string | number) => {
    setAddChapterRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeAddRow = (index: number) => {
    setAddChapterRows((prev) => prev.filter((_, i) => i !== index))
  }

  const getNextOrderForUnit = (unitId: string) => {
    const max = Math.max(
      ...chapters.filter((c) => c.unitId === unitId).map((c) => c.orderNumber),
      0
    )
    return max + 1
  }

  React.useEffect(() => {
    if (!selectedUnitId) return
    const startOrder = getNextOrderForUnit(selectedUnitId)
    setAddChapterRows((prev) =>
      prev.map((row, index) => ({ ...row, orderNumber: startOrder + index }))
    )
  }, [selectedUnitId, chapters])

  const addMoreRow = () => {
    const nextOrder = selectedUnitId
      ? getNextOrderForUnit(selectedUnitId) + addChapterRows.length
      : addChapterRows.reduce((m, r) => Math.max(m, r.orderNumber), 0) + 1
    setAddChapterRows((prev) => [
      ...prev,
      { name: "", orderNumber: nextOrder },
    ])
  }

  const handleAddChapters = async () => {
    if (!selectedUnitId) return
    const toCreate = addChapterRows.filter((r) => r.name.trim() !== "")
    if (toCreate.length === 0) return
    let created = 0
    for (const row of toCreate) {
      try {
        const res = await fetch(CHAPTERS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.name.trim(), unitId: selectedUnitId }),
        })
        if (res.status === 409) {
          toast.warning(`"${row.name.trim()}" already exists in this unit`)
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create chapter")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create chapter")
      }
    }
    if (created) {
      await fetchChapters()
      toast.success(`${created} chapter(s) created`)
    }
    setIsAddDialogOpen(false)
    setSelectedExamId(null)
    setSelectedSubjectId(null)
    setSelectedUnitId(null)
    setAddChapterRows([{ name: "", orderNumber: 1 }])
  }

  const toggleQuickCreateUnit = (unitId: string) => {
    setQuickCreateSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    )
  }

  const toggleQuickCreateSelectAll = () => {
    setQuickCreateSelectedUnitIds((prev) =>
      prev.length === quickCreateAvailableUnits.length
        ? []
        : quickCreateAvailableUnits.map((u) => u.id)
    )
  }

  const toggleQuickCreateBySubject = (subjectId: string) => {
    const group = quickCreateSubjectsGrouped.find((g) => g.subjectId === subjectId)
    if (!group) return
    setQuickCreateSelectedUnitIds((prev) => {
      const allSelected = group.unitIds.every((id) => prev.includes(id))
      if (allSelected) return prev.filter((id) => !group.unitIds.includes(id))
      const added = new Set(prev)
      group.unitIds.forEach((id) => added.add(id))
      return Array.from(added)
    })
  }

  const resetQuickCreate = () => {
    setQuickCreateSelectedUnitIds([])
    setQuickCreateChaptersByUnitId({})
  }

  const handleBulkCreateChapters = async () => {
    if (quickCreateSelectedUnitIds.length === 0) return
    const toCreate: { unitId: string; name: string }[] = []
    quickCreateSelectedUnitIds.forEach((unitId) => {
      const raw = quickCreateChaptersByUnitId[unitId] || ""
      const names = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      names.forEach((name) => toCreate.push({ unitId, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { unitId, name } of toCreate) {
      try {
        const res = await fetch(CHAPTERS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, unitId }),
        })
        if (res.status === 409) {
          duplicate++
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create chapter")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create chapter")
      }
    }
    if (created) {
      await fetchChapters()
      toast.success(`${created} chapter(s) created`)
    }
    if (duplicate) toast.warning(`${duplicate} skipped (already exist in this unit)`)
    setIsQuickCreateOpen(false)
    resetQuickCreate()
  }

  const openEditDialog = (chapter: Chapter) => {
    setEditingChapter({ ...chapter })
    setIsEditDialogOpen(true)
  }

  const handleEditChapter = async () => {
    if (!editingChapter) return
    try {
      const res = await fetch(`${CHAPTERS_API}/${editingChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingChapter.name,
          unitId: editingChapter.unitId,
          status: editingChapter.status,
          orderNumber: editingChapter.orderNumber,
        }),
      })
      if (res.status === 409) {
        toast.error("A chapter with this name already exists in this unit")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update chapter")
        return
      }
      await fetchChapters()
      toast.success("Chapter updated")
      setIsEditDialogOpen(false)
      setEditingChapter(null)
    } catch {
      toast.error("Failed to update chapter")
    }
  }

  const handleDeleteChapter = (chapter: Chapter) => {
    setChapterToDelete(chapter)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteChapter = async () => {
    if (!chapterToDelete) return
    try {
      const res = await fetch(`${CHAPTERS_API}/${chapterToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to delete chapter")
        return
      }
      setChapters((prev) => prev.filter((c) => c.id !== chapterToDelete.id))
      setIsDeleteDialogOpen(false)
      setChapterToDelete(null)
      toast.success("Chapter deleted")
    } catch {
      toast.error("Failed to delete chapter")
    }
  }

  const handleToggleStatus = async (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (!chapter) return
    const nextStatus = chapter.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${CHAPTERS_API}/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update status")
        return
      }
      setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, status: nextStatus } : c)))
    } catch {
      toast.error("Failed to update status")
    }
  }

  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => {
    setIsReorderingEnabled(false)
    setDraggedChapter(null)
    setDragOverChapter(null)
  }

  const saveReorderedChapters = async () => {
    const ordered = chapters
      .slice()
      .sort((a, b) => {
        const unitA = units.findIndex((u) => u.id === a.unitId)
        const unitB = units.findIndex((u) => u.id === b.unitId)
        if (unitA !== unitB) return unitA - unitB
        return a.orderNumber - b.orderNumber
      })
      .map((c) => ({ id: c.id, orderNumber: c.orderNumber }))
    try {
      const res = await fetch(`${CHAPTERS_API}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ordered }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to save order")
        return
      }
      await fetchChapters()
      toast.success("Order saved")
      disableReordering()
    } catch {
      toast.error("Failed to save order")
    }
  }

  const handleChapterDragStart = (e: React.DragEvent, chapter: Chapter) => {
    if (!isReorderingEnabled) return
    setDraggedChapter(chapter)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(chapter.id))
  }

  const handleChapterDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleChapterDragEnter = (chapter: Chapter) => {
    setDragOverChapter(chapter)
  }

  const handleChapterDragLeave = () => {
    setDragOverChapter(null)
  }

  const handleChapterDrop = (e: React.DragEvent, target: Chapter) => {
    e.preventDefault()
    if (!isReorderingEnabled) return
    if (!draggedChapter || draggedChapter.id === target.id) return
    if (draggedChapter.unitId !== target.unitId) return

    setChapters((prev) => {
      const other = prev.filter((c) => c.unitId !== target.unitId)
      const group = prev
        .filter((c) => c.unitId === target.unitId)
        .slice()
        .sort((a, b) => a.orderNumber - b.orderNumber)
      const fromIndex = group.findIndex((c) => c.id === draggedChapter.id)
      const toIndex = group.findIndex((c) => c.id === target.id)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = group.splice(fromIndex, 1)
      group.splice(toIndex, 0, moved)
      const reordered = group.map((c, idx) => ({ ...c, orderNumber: idx + 1 }))
      return [...other, ...reordered]
    })
    setDraggedChapter(null)
    setDragOverChapter(null)
  }

  const filteredChapters = React.useMemo(() => {
    return chapters.filter((c) => {
      const unit = units.find((u) => u.id === c.unitId)
      if (!unit) return false
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return false
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExam = examFilter === "all" || String(subject.examId) === examFilter
      const matchesSubject = subjectFilter === "all" || String(unit.subjectId) === subjectFilter
      const matchesUnit = unitFilter === "all" || String(c.unitId) === unitFilter
      const matchesMeta =
        metaFilter === "all" ||
        (metaFilter === "filled" && c.meta !== "-") ||
        (metaFilter === "not-filled" && c.meta === "-")
      return matchesSearch && matchesExam && matchesSubject && matchesUnit && matchesMeta
    })
  }, [chapters, units, subjects, searchTerm, examFilter, subjectFilter, unitFilter, metaFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, examFilter, subjectFilter, unitFilter, metaFilter, pageSize])

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]
  const totalPages = Math.max(1, Math.ceil(filteredChapters.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedChapters = filteredChapters.slice(startIndex, startIndex + pageSize)

  const groupedPaged = React.useMemo(() => {
    const map = new Map<string, { examId: string; subjectId: string; unitId: string; chapters: Chapter[] }>()
    pagedChapters.forEach((c) => {
      const unit = units.find((u) => u.id === c.unitId)
      if (!unit) return
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return
      const key = `${subject.examId}-${unit.subjectId}-${c.unitId}`
      if (!map.has(key)) {
        map.set(key, { examId: subject.examId, subjectId: unit.subjectId, unitId: c.unitId, chapters: [] })
      }
      map.get(key)!.chapters.push(c)
    })
    map.forEach((v) => {
      v.chapters.sort((a, b) => a.orderNumber - b.orderNumber)
    })
    return Array.from(map.values())
  }, [pagedChapters, units, subjects])

  const totalChapters = chapters.length
  const activeChapters = chapters.filter((c) => c.status === "Active").length
  const totalVisits = chapters.reduce((s, c) => s + c.visits, 0)
  const todayVisits = chapters.reduce((s, c) => s + c.today, 0)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading chapters…</p>
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
                <BreadcrumbPage>Chapters</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Chapter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Chapter</DialogTitle>
                <DialogDescription>
                  Select exam, subject, and unit, then add one or more chapters.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Select Exam *</Label>
                  <Select
                    value={selectedExamId ?? ""}
                    onValueChange={(v) => {
                      setSelectedExamId(v || null)
                      setSelectedSubjectId(null)
                      setSelectedUnitId(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Exam --" />
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
                  <Label>Select Subject *</Label>
                  <Select
                    value={selectedSubjectId ?? ""}
                    onValueChange={(v) => {
                      setSelectedSubjectId(v || null)
                      setSelectedUnitId(null)
                    }}
                    disabled={!selectedExamId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Subject --" />
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
                  <Label>Select Unit *</Label>
                  <Select
                    value={selectedUnitId ?? ""}
                    onValueChange={(v) => setSelectedUnitId(v || null)}
                    disabled={!selectedSubjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Unit --" />
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
                  <Label>Chapters</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMoreRow}>
                      Add More
                    </Button>
                  </div>
                  <div className="max-h-[240px] space-y-3 overflow-y-auto rounded-md border p-3">
                    {addChapterRows.map((row, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Chapter Name *"
                          value={row.name}
                          onChange={(e) => updateAddRow(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Order"
                          value={row.orderNumber}
                          onChange={(e) =>
                            updateAddRow(index, "orderNumber", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-24"
                        />
                        {addChapterRows.length > 1 && (
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
                    ))}
                  </div>
                  {selectedUnitId && (
                    <p className="text-xs text-muted-foreground">
                      Order: next will start at {getNextOrderForUnit(selectedUnitId)}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddChapters}
                  disabled={
                    !selectedUnitId || addChapterRows.every((r) => !r.name.trim())
                  }
                >
                  Add Chapters
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
              <CardTitle className="text-xl">Quick Create Chapters</CardTitle>
              <CardDescription>
                Select one or more units and enter chapter names for each unit (one per line). Content and meta can be added later.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Units *</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-muted-foreground"
                        type="button"
                        onClick={toggleQuickCreateSelectAll}
                      >
                        {quickCreateSelectedUnitIds.length === quickCreateAvailableUnits.length
                          ? "Clear all"
                          : "Select all"}
                      </Button>
                      {quickCreateSubjectsGrouped.length > 1 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          {quickCreateSubjectsGrouped.map(({ subjectId, label, unitIds }) => {
                            const allIn = unitIds.every((id) =>
                              quickCreateSelectedUnitIds.includes(id)
                            )
                            return (
                              <Button
                                key={subjectId}
                                type="button"
                                variant={allIn ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 rounded-full px-3 text-xs font-medium"
                                onClick={() => toggleQuickCreateBySubject(subjectId)}
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
                    Click a subject to select or clear all its units at once.
                  </p>
                  <div className="rounded-md border bg-background">
                    <div className="max-h-56 overflow-auto p-2">
                      {quickCreateAvailableUnits.map((unit) => {
                        const subject = subjects.find((s) => s.id === unit.subjectId)
                        const label = subject
                          ? `${getExamName(subject.examId)} > ${subject.name} > ${unit.name}`
                          : unit.name
                        const checked = quickCreateSelectedUnitIds.includes(unit.id)
                        return (
                          <label
                            key={unit.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuickCreateUnit(unit.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                      {quickCreateSelectedUnitIds.length} unit
                      {quickCreateSelectedUnitIds.length === 1 ? "" : "s"} selected
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Chapter Names *</Label>
                  {quickCreateSelectedUnitsSorted.length === 0 ? (
                    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                      Select at least one unit to start adding chapters.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {quickCreateSelectedUnitsSorted.map((unit) => {
                        const subject = subjects.find((s) => s.id === unit.subjectId)
                        const label = subject
                          ? `${getExamName(subject.examId)} > ${subject.name} > ${unit.name}`
                          : unit.name
                        return (
                          <div key={unit.id} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {label} <span className="text-destructive">*</span>
                              </div>
                              <div className="text-xs text-muted-foreground">One chapter per line</div>
                            </div>
                            <Textarea
                              value={quickCreateChaptersByUnitId[unit.id] ?? ""}
                              onChange={(e) =>
                                setQuickCreateChaptersByUnitId((prev) => ({
                                  ...prev,
                                  [unit.id]: e.target.value,
                                }))
                              }
                              placeholder={"Chapter 1\nChapter 2\n..."}
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsQuickCreateOpen(false)
                    resetQuickCreate()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkCreateChapters}
                  disabled={
                    quickCreateSelectedUnitIds.length === 0 ||
                    quickCreateSelectedUnitsSorted.every(
                      (u) => !(quickCreateChaptersByUnitId[u.id] || "").trim()
                    )
                  }
                >
                  Create Chapters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Chapters</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{totalChapters}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All chapters in system</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Active Chapters</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{activeChapters}</div>
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
                    <CardTitle className="text-xl font-semibold tracking-tight">Chapter Management</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Manage and organize your chapters, create new chapters, and track chapter performance across your educational platform.
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isReorderingEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        onClick={enableReordering}
                      >
                        <GripVertical className="mr-2 h-4 w-4" />
                        Reorder position
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={disableReordering}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" className="h-9 px-3" onClick={saveReorderedChapters}>
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
                      placeholder="Search chapters..."
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
                    }}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {availableExams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {capitalize(e.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={subjectFilter}
                    onValueChange={(v) => {
                      setSubjectFilter(v)
                      setUnitFilter("all")
                    }}
                    disabled={examFilter === "all"}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue
                        placeholder={
                          examFilter === "all"
                            ? "Select exam first"
                            : "Select Subject"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsForExamFilter.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {capitalize(s.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={unitFilter}
                    onValueChange={setUnitFilter}
                    disabled={subjectFilter === "all"}
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-lg">
                      <SelectValue
                        placeholder={
                          subjectFilter === "all"
                            ? "Select subject first"
                            : "Select Unit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {unitsForSubjectFilter.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {capitalize(u.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={metaFilter}
                    onValueChange={(v: "all" | "filled" | "not-filled") => setMetaFilter(v)}
                  >
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
                      <p className="text-sm font-medium text-foreground">No chapters yet</p>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Add chapters via Add New Chapter or Quick Create for multiple units at once.
                      </p>
                    </div>
                  ) : (
                    groupedPaged.map(({ examId, subjectId, unitId, chapters: groupChapters }) => (
                      <Card key={`${examId}-${subjectId}-${unitId}`} className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                              {getExamName(examId)}
                            </Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge
                              variant="secondary"
                              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            >
                              {getSubjectName(subjectId)}
                            </Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                              {getUnitName(unitId)}
                            </Badge>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                              {groupChapters.length} chapter{groupChapters.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="w-full overflow-x-auto">
                            <Table className="table-fixed min-w-[780px] w-full sm:min-w-[980px]">
                              <TableHeader>
                                <TableRow className="border-b border-border/80 hover:bg-transparent">
                                  <TableHead className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[88px]">
                                    Order
                                  </TableHead>
                                  <TableHead className="min-w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:min-w-[200px]">
                                    Chapter Name
                                  </TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[140px]">
                                    Content
                                  </TableHead>
                                  <TableHead className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Meta
                                  </TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Visits
                                  </TableHead>
                                  <TableHead className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Today
                                  </TableHead>
                                  <TableHead className="w-[140px] shrink-0 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[190px]">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {groupChapters.map((chapter) => (
                                  <TableRow
                                    key={chapter.id}
                                    className={`
                                      transition-colors
                                      ${chapter.status === "Inactive" ? "opacity-60" : "hover:bg-muted/40"}
                                      ${dragOverChapter?.id === chapter.id ? "border-2 border-primary/30 bg-primary/5" : ""}
                                      ${isReorderingEnabled ? "cursor-move" : "cursor-default"}
                                    `}
                                    draggable={isReorderingEnabled}
                                    onDragStart={(e) => handleChapterDragStart(e, chapter)}
                                    onDragOver={handleChapterDragOver}
                                    onDragEnter={() => handleChapterDragEnter(chapter)}
                                    onDragLeave={handleChapterDragLeave}
                                    onDrop={(e) => handleChapterDrop(e, chapter)}
                                  >
                                    <TableCell className="py-3 pr-3">
                                      <div
                                        className={
                                          isReorderingEnabled
                                            ? "flex cursor-grab items-center justify-center gap-2 text-muted-foreground"
                                            : "flex items-center justify-center"
                                        }
                                        title={isReorderingEnabled ? "Drag to reorder" : undefined}
                                      >
                                        {isReorderingEnabled && <GripVertical className="h-4 w-4" />}
                                        <span className="min-w-6 text-center font-medium text-foreground">
                                          {chapter.orderNumber}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Link
                                        href={`/self-study/chapters/${chapter.id}`}
                                        className={
                                          chapter.status === "Inactive"
                                            ? "line-through text-muted-foreground hover:underline hover:text-primary"
                                            : "hover:underline hover:text-primary"
                                        }
                                      >
                                        {capitalize(chapter.name)}
                                      </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {chapter.content !== "-" ? chapter.content : "unavailable"}
                                    </TableCell>
                                    <TableCell>
                                      {chapter.meta !== "-" ? (
                                        <Check className="inline h-4 w-4 text-green-500" />
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {chapter.visits > 0 ? (
                                        <div>
                                          <div className="font-medium">{chapter.visits}</div>
                                          <div className="text-xs text-muted-foreground">
                                            ({chapter.uniqueVisits} unique)
                                          </div>
                                        </div>
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                    <TableCell>{chapter.today > 0 ? chapter.today : "-"}</TableCell>
                                    <TableCell className="text-right pr-2">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600"
                                          title="View"
                                          asChild
                                        >
                                          <Link href={`/self-study/chapters/${chapter.id}`}>
                                            <Eye className="h-4 w-4" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                                          title="Edit"
                                          onClick={() => openEditDialog(chapter)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 transition-colors ${
                                            chapter.status === "Active"
                                              ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                          }`}
                                          title={chapter.status === "Active" ? "Turn Off" : "Turn On"}
                                          onClick={() => handleToggleStatus(chapter.id)}
                                        >
                                          <Power className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                          title="Delete"
                                          onClick={() => handleDeleteChapter(chapter)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
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
                        <SelectTrigger className="h-9 w-[110px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>
                        {filteredChapters.length === 0
                          ? 0
                          : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredChapters.length)} of ${filteredChapters.length}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </Button>
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
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>Update chapter details.</DialogDescription>
          </DialogHeader>
          {editingChapter && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-chapter-name">Chapter Name *</Label>
                <Input
                  id="edit-chapter-name"
                  value={editingChapter.name}
                  onChange={(e) =>
                    setEditingChapter((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-chapter-order">Order Number</Label>
                <Input
                  id="edit-chapter-order"
                  type="number"
                  value={editingChapter.orderNumber}
                  onChange={(e) =>
                    setEditingChapter((prev) =>
                      prev ? { ...prev, orderNumber: parseInt(e.target.value, 10) || 0 } : null
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChapter}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chapter &quot;{chapterToDelete ? capitalize(chapterToDelete.name) : ""}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteChapter}>
              Delete Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
