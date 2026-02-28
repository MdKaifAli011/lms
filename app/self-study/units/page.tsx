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

type ExamOption = { id: string; name: string; status?: string }
type SubjectOption = { id: string; name: string; examId: string; status?: string; orderNumber?: number }

type Unit = {
  id: string
  subjectId: string
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

export default function UnitsPage() {
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [units, setUnits] = React.useState<Unit[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [examFilter, setExamFilter] = React.useState<string>("all")
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all")
  const [metaFilter, setMetaFilter] = React.useState<"all" | "filled" | "not-filled">("all")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isQuickCreateSheetOpen, setIsQuickCreateSheetOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null)
  const [addUnitRows, setAddUnitRows] = React.useState<{ name: string; orderNumber: number }[]>([
    { name: "Unit 1", orderNumber: 1 },
  ])

  const [editingUnit, setEditingUnit] = React.useState<Unit | null>(null)
  const [unitToDelete, setUnitToDelete] = React.useState<Unit | null>(null)

  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [draggedUnit, setDraggedUnit] = React.useState<Unit | null>(null)
  const [dragOverUnit, setDragOverUnit] = React.useState<Unit | null>(null)

  const [quickCreateSelectedSubjectIds, setQuickCreateSelectedSubjectIds] = React.useState<string[]>([])
  const [quickCreateUnitsBySubjectId, setQuickCreateUnitsBySubjectId] = React.useState<Record<string, string>>({})

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
      setUnits(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load units")
    }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchExams(), fetchSubjects(), fetchUnits()])
    setLoading(false)
  }, [fetchExams, fetchSubjects, fetchUnits])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const availableExams = React.useMemo(() => exams.filter((e) => e.status !== "Inactive"), [exams])
  const subjectsForSelectedExam = React.useMemo(
    () => subjects.filter((s) => s.examId === selectedExamId && s.status !== "Inactive"),
    [subjects, selectedExamId]
  )
  const subjectsForExamFilter = React.useMemo(() => {
    if (examFilter === "all") return []
    return subjects.filter((s) => s.examId === examFilter)
  }, [subjects, examFilter])

  const quickCreateAvailableSubjects = React.useMemo(
    () => subjects.filter((s) => availableExams.some((e) => e.id === s.examId) && s.status !== "Inactive"),
    [subjects, availableExams]
  )

  const getExamName = (examId: string) => capitalize(exams.find((e) => e.id === examId)?.name ?? "-")
  const getSubjectName = (subjectId: string) => capitalize(subjects.find((s) => s.id === subjectId)?.name ?? "-")

  const quickCreateSelectedSubjectsSorted = React.useMemo(() => {
    return quickCreateAvailableSubjects
      .filter((s) => quickCreateSelectedSubjectIds.includes(s.id))
      .sort((a, b) => {
        const examA = getExamName(a.examId)
        const examB = getExamName(b.examId)
        if (examA !== examB) return examA.localeCompare(examB)
        return a.name.localeCompare(b.name)
      })
  }, [quickCreateAvailableSubjects, quickCreateSelectedSubjectIds, exams, subjects])

  const updateAddRow = (index: number, field: "name" | "orderNumber", value: string | number) => {
    setAddUnitRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeAddRow = (index: number) => {
    setAddUnitRows((prev) => prev.filter((_, i) => i !== index))
  }

  const getNextOrderForSubject = (subjectId: string) => {
    const max = Math.max(
      ...units.filter((u) => u.subjectId === subjectId).map((u) => u.orderNumber),
      0
    )
    return max + 1
  }

  // When subject is selected, auto-fill order numbers from next available for that subject
  React.useEffect(() => {
    if (!selectedSubjectId) return
    const startOrder = getNextOrderForSubject(selectedSubjectId)
    setAddUnitRows((prev) =>
      prev.map((row, index) => ({ ...row, orderNumber: startOrder + index }))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only when subject changes
  }, [selectedSubjectId])

  const addMoreRow = () => {
    const nextOrder = selectedSubjectId
      ? getNextOrderForSubject(selectedSubjectId) + addUnitRows.length
      : addUnitRows.reduce((m, r) => Math.max(m, r.orderNumber), 0) + 1
    setAddUnitRows((prev) => [
      ...prev,
      { name: `Unit ${prev.length + 1}`, orderNumber: nextOrder },
    ])
  }

  const handleAddUnits = async () => {
    if (!selectedSubjectId) return
    const toCreate = addUnitRows.filter((r) => r.name.trim() !== "")
    if (toCreate.length === 0) return
    let created = 0
    for (const row of toCreate) {
      try {
        const res = await fetch(UNITS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.name.trim(), subjectId: selectedSubjectId }),
        })
        if (res.status === 409) {
          toast.warning(`"${row.name.trim()}" already exists in this subject`)
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create unit")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create unit")
      }
    }
    if (created) {
      await fetchUnits()
      toast.success(`${created} unit(s) created`)
    }
    setIsAddDialogOpen(false)
    setSelectedExamId(null)
    setSelectedSubjectId(null)
    setAddUnitRows([{ name: "Unit 1", orderNumber: 1 }])
  }

  const toggleQuickCreateSubject = (subjectId: string) => {
    setQuickCreateSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    )
  }

  const toggleQuickCreateSelectAll = () => {
    setQuickCreateSelectedSubjectIds((prev) =>
      prev.length === quickCreateAvailableSubjects.length
        ? []
        : quickCreateAvailableSubjects.map((s) => s.id)
    )
  }

  const quickCreateExamsGrouped = React.useMemo(() => {
    const byExam = new Map<string, { examId: string; examName: string; subjectIds: string[] }>()
    quickCreateAvailableSubjects.forEach((s) => {
      if (!byExam.has(s.examId)) {
        byExam.set(s.examId, { examId: s.examId, examName: getExamName(s.examId), subjectIds: [] })
      }
      byExam.get(s.examId)!.subjectIds.push(s.id)
    })
    return Array.from(byExam.values())
  }, [quickCreateAvailableSubjects, exams])

  const toggleQuickCreateByExam = (examId: string) => {
    const group = quickCreateExamsGrouped.find((g) => g.examId === examId)
    if (!group) return
    setQuickCreateSelectedSubjectIds((prev) => {
      const allSelected = group.subjectIds.every((id) => prev.includes(id))
      if (allSelected) return prev.filter((id) => !group.subjectIds.includes(id))
      const added = new Set(prev)
      group.subjectIds.forEach((id) => added.add(id))
      return Array.from(added)
    })
  }

  const resetQuickCreateUnits = () => {
    setQuickCreateSelectedSubjectIds([])
    setQuickCreateUnitsBySubjectId({})
  }

  const handleBulkCreateUnits = async () => {
    if (quickCreateSelectedSubjectIds.length === 0) return
    const toCreate: { subjectId: string; name: string }[] = []
    quickCreateSelectedSubjectIds.forEach((subjectId) => {
      const raw = quickCreateUnitsBySubjectId[subjectId] || ""
      const names = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      names.forEach((name) => toCreate.push({ subjectId, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { subjectId, name } of toCreate) {
      try {
        const res = await fetch(UNITS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, subjectId }),
        })
        if (res.status === 409) {
          duplicate++
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create unit")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create unit")
      }
    }
    if (created) {
      await fetchUnits()
      toast.success(`${created} unit(s) created`)
    }
    if (duplicate) toast.warning(`${duplicate} skipped (already exist in this subject)`)
    setIsQuickCreateSheetOpen(false)
    resetQuickCreateUnits()
  }

  const openEditDialog = (unit: Unit) => {
    setEditingUnit({ ...unit })
    setIsEditDialogOpen(true)
  }

  const handleEditUnit = async () => {
    if (!editingUnit) return
    try {
      const res = await fetch(`${UNITS_API}/${editingUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingUnit.name, subjectId: editingUnit.subjectId, status: editingUnit.status, orderNumber: editingUnit.orderNumber }),
      })
      if (res.status === 409) {
        toast.error("A unit with this name already exists in this subject")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update unit")
        return
      }
      await fetchUnits()
      toast.success("Unit updated")
      setIsEditDialogOpen(false)
      setEditingUnit(null)
    } catch {
      toast.error("Failed to update unit")
    }
  }

  const handleDeleteUnit = (unit: Unit) => {
    setUnitToDelete(unit)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUnit = async () => {
    if (!unitToDelete) return
    try {
      const res = await fetch(`${UNITS_API}/${unitToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to delete unit")
        return
      }
      setUnits((prev) => prev.filter((u) => u.id !== unitToDelete.id))
      setIsDeleteDialogOpen(false)
      setUnitToDelete(null)
      toast.success("Unit deleted")
    } catch {
      toast.error("Failed to delete unit")
    }
  }

  const handleToggleStatus = async (id: string) => {
    const unit = units.find((u) => u.id === id)
    if (!unit) return
    const nextStatus = unit.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${UNITS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update status")
        return
      }
      setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)))
    } catch {
      toast.error("Failed to update status")
    }
  }

  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => {
    setIsReorderingEnabled(false)
    setDraggedUnit(null)
    setDragOverUnit(null)
  }
  const saveReorderedUnits = async () => {
    const ordered = units
      .slice()
      .sort((a, b) => {
        const subjA = subjects.findIndex((s) => s.id === a.subjectId)
        const subjB = subjects.findIndex((s) => s.id === b.subjectId)
        if (subjA !== subjB) return subjA - subjB
        return a.orderNumber - b.orderNumber
      })
      .map((u) => ({ id: u.id, orderNumber: u.orderNumber }))
    try {
      const res = await fetch(`${UNITS_API}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ordered }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to save order")
        return
      }
      await fetchUnits()
      toast.success("Order saved")
      disableReordering()
    } catch {
      toast.error("Failed to save order")
    }
  }

  const handleUnitDragStart = (e: React.DragEvent, unit: Unit) => {
    if (!isReorderingEnabled) return
    setDraggedUnit(unit)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleUnitDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isReorderingEnabled) return
    e.dataTransfer.dropEffect = "move"
  }
  const handleUnitDragEnter = (unit: Unit) => {
    if (!isReorderingEnabled) return
    if (!draggedUnit || draggedUnit.id === unit.id) return
    setDragOverUnit(unit)
  }
  const handleUnitDragLeave = () => {
    if (!isReorderingEnabled) return
    setDragOverUnit(null)
  }
  const handleUnitDrop = (e: React.DragEvent, target: Unit) => {
    e.preventDefault()
    if (!isReorderingEnabled) return
    if (!draggedUnit || draggedUnit.id === target.id) return
    if (draggedUnit.subjectId !== target.subjectId) return

    setUnits((prev) => {
      const other = prev.filter((u) => u.subjectId !== target.subjectId)
      const group = prev
        .filter((u) => u.subjectId === target.subjectId)
        .slice()
        .sort((a, b) => a.orderNumber - b.orderNumber)
      const fromIndex = group.findIndex((u) => u.id === draggedUnit.id)
      const toIndex = group.findIndex((u) => u.id === target.id)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = group.splice(fromIndex, 1)
      group.splice(toIndex, 0, moved)
      const reordered = group.map((u, idx) => ({ ...u, orderNumber: idx + 1 }))
      return [...other, ...reordered]
    })
    setDraggedUnit(null)
    setDragOverUnit(null)
  }

  const filteredUnits = React.useMemo(() => {
    return units.filter((u) => {
      const subject = subjects.find((s) => s.id === u.subjectId)
      if (!subject) return false
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExam = examFilter === "all" || String(subject.examId) === examFilter
      const matchesSubject = subjectFilter === "all" || String(u.subjectId) === subjectFilter
      const matchesMeta =
        metaFilter === "all" ||
        (metaFilter === "filled" && u.meta !== "-") ||
        (metaFilter === "not-filled" && u.meta === "-")
      return matchesSearch && matchesExam && matchesSubject && matchesMeta
    })
  }, [units, subjects, searchTerm, examFilter, subjectFilter, metaFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, examFilter, subjectFilter, metaFilter, pageSize])

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]
  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedUnits = filteredUnits.slice(startIndex, startIndex + pageSize)

  const groupedPaged = React.useMemo(() => {
    const map = new Map<string, { examId: string; subjectId: string; units: Unit[] }>()
    pagedUnits.forEach((u) => {
      const subject = subjects.find((s) => s.id === u.subjectId)
      if (!subject) return
      const key = `${subject.examId}-${u.subjectId}`
      if (!map.has(key)) {
        map.set(key, { examId: subject.examId, subjectId: u.subjectId, units: [] })
      }
      map.get(key)!.units.push(u)
    })
    map.forEach((v) => {
      v.units.sort((a, b) => a.orderNumber - b.orderNumber)
    })
    return Array.from(map.values())
  }, [pagedUnits, subjects])

  const totalUnits = units.length
  const activeUnits = units.filter((u) => u.status === "Active").length
  const totalVisits = units.reduce((s, u) => s + u.visits, 0)
  const todayVisits = units.reduce((s, u) => s + u.today, 0)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading units…</p>
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
                <BreadcrumbPage>Units</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Units
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Units</DialogTitle>
              <DialogDescription>
                Select exam and subject, then add one or more units.
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
                  onValueChange={(v) => setSelectedSubjectId(v || null)}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Units</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMoreRow}>
                    Add More
                  </Button>
                </div>
                <div className="max-h-[240px] space-y-3 overflow-y-auto rounded-md border p-3">
                  {addUnitRows.map((row, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Unit Name *"
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
                      {addUnitRows.length > 1 && (
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
                {selectedSubjectId && (
                  <p className="text-xs text-muted-foreground">
                    Order Number: next will start at {getNextOrderForSubject(selectedSubjectId)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddUnits}
                disabled={!selectedSubjectId || addUnitRows.every((r) => !r.name.trim())}
              >
                Add Units
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setIsQuickCreateSheetOpen(true)}
          >
            Quick Create
          </Button>
        </div>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
        {isQuickCreateSheetOpen ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 shrink-0"
                  onClick={() => {
                    setIsQuickCreateSheetOpen(false)
                    resetQuickCreateUnits()
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to list
                </Button>
              </div>
              <CardTitle className="text-xl">Quick Create Units</CardTitle>
              <CardDescription>
                Select one or more subjects and enter unit names for each subject separately (one per line). Content and meta can be added later.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Subjects *</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-muted-foreground"
                        type="button"
                        onClick={toggleQuickCreateSelectAll}
                      >
                        {quickCreateSelectedSubjectIds.length === quickCreateAvailableSubjects.length
                          ? "Clear all"
                          : "Select all"}
                      </Button>
                      {quickCreateExamsGrouped.length > 1 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          {quickCreateExamsGrouped.map(({ examId, examName, subjectIds }) => {
                            const allIn = subjectIds.every((id) =>
                              quickCreateSelectedSubjectIds.includes(id)
                            )
                            return (
                              <Button
                                key={examId}
                                type="button"
                                variant={allIn ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 rounded-full px-3 text-xs font-medium"
                                onClick={() => toggleQuickCreateByExam(examId)}
                              >
                                {allIn ? "✓ " : ""}{examName}
                              </Button>
                            )
                          })}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click an exam name to select or clear all its subjects at once.
                  </p>
                  <div className="rounded-md border bg-background">
                    <div className="max-h-56 overflow-auto p-2">
                      {quickCreateAvailableSubjects.map((subject) => {
                        const checked = quickCreateSelectedSubjectIds.includes(subject.id)
                        return (
                          <label
                            key={subject.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuickCreateSubject(subject.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">
                              {getExamName(subject.examId)} &gt; {capitalize(subject.name)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                      {quickCreateSelectedSubjectIds.length} subject
                      {quickCreateSelectedSubjectIds.length === 1 ? "" : "s"} selected
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Unit Names *</Label>
                  {quickCreateSelectedSubjectsSorted.length === 0 ? (
                    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                      Select at least one subject to start adding units.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {quickCreateSelectedSubjectsSorted.map((subject) => {
                        const subjectId = subject.id
                        const label = `${getExamName(subject.examId)} > ${capitalize(subject.name)}`
                        return (
                          <div key={subjectId} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {label} <span className="text-destructive">*</span>
                              </div>
                              <div className="text-xs text-muted-foreground">One unit per line</div>
                            </div>
                            <Textarea
                              value={quickCreateUnitsBySubjectId[subjectId] ?? ""}
                              onChange={(e) =>
                                setQuickCreateUnitsBySubjectId((prev) => ({
                                  ...prev,
                                  [subjectId]: e.target.value,
                                }))
                              }
                              placeholder={"Unit 1\nUnit 2\nUnit 3\n..."}
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
                    setIsQuickCreateSheetOpen(false)
                    resetQuickCreateUnits()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    await handleBulkCreateUnits()
                  }}
                  disabled={
                    quickCreateSelectedSubjectIds.length === 0 ||
                    quickCreateSelectedSubjectIds.every(
                      (id) => !(quickCreateUnitsBySubjectId[id] || "").trim()
                    )
                  }
                >
                  Create Units
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
              <CardTitle className="text-[13px] font-medium">Total Units</CardTitle>
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-xl font-bold leading-none">{totalUnits}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">All units in system</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
              <CardTitle className="text-[13px] font-medium">Active Units</CardTitle>
              <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-xl font-bold leading-none">{activeUnits}</div>
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
                <CardTitle className="text-xl font-semibold tracking-tight">Units Management</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Manage and organize your units, create new units, and track unit performance across
                  your educational platform.
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
                    Enable Reordering
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
                    <Button size="sm" className="h-9 px-3" onClick={saveReorderedUnits}>
                      Save Order
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
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
                onValueChange={setSubjectFilter}
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
                  <p className="text-sm font-medium text-foreground">No units yet</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Add units by choosing an exam and subject above, or use Quick Create to add units for multiple subjects at once.
                  </p>
                </div>
              ) : (
                groupedPaged.map(({ examId, subjectId, units: groupUnits }) => (
                  <Card key={`${examId}-${subjectId}`} className="border-border/60 shadow-sm">
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
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                          {groupUnits.length} unit{groupUnits.length === 1 ? "" : "s"}
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
                                Unit Name
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
                            {groupUnits.map((unit) => (
                              <TableRow
                                key={unit.id}
                                className={`
                                  transition-colors
                                  ${unit.status === "Inactive" ? "opacity-60" : "hover:bg-muted/40"}
                                  ${dragOverUnit?.id === unit.id ? "border-2 border-primary/30 bg-primary/5" : ""}
                                  ${isReorderingEnabled ? "cursor-move" : "cursor-default"}
                                `}
                                draggable={isReorderingEnabled}
                                onDragStart={(e) => handleUnitDragStart(e, unit)}
                                onDragOver={handleUnitDragOver}
                                onDragEnter={() => handleUnitDragEnter(unit)}
                                onDragLeave={handleUnitDragLeave}
                                onDrop={(e) => handleUnitDrop(e, unit)}
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
                                      {unit.orderNumber}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/self-study/units/${unit.id}`}
                                    className={
                                      unit.status === "Inactive"
                                        ? "line-through text-muted-foreground hover:underline hover:text-primary"
                                        : "hover:underline hover:text-primary"
                                    }
                                  >
                                    {capitalize(unit.name)}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {unit.content !== "-" ? unit.content : "unavailable"}
                                </TableCell>
                                <TableCell>
                                  {unit.meta !== "-" ? (
                                    <Check className="inline h-4 w-4 text-green-500" />
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {unit.visits > 0 ? (
                                    <div>
                                      <div className="font-medium">{unit.visits}</div>
                                      <div className="text-xs text-muted-foreground">
                                        ({unit.uniqueVisits} unique)
                                      </div>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>{unit.today > 0 ? unit.today : "-"}</TableCell>
                                <TableCell className="text-right pr-2">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600"
                                      title="View"
                                      asChild
                                    >
                                      <Link href={`/self-study/units/${unit.id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                                      title="Edit"
                                      onClick={() => openEditDialog(unit)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-8 w-8 transition-colors ${
                                        unit.status === "Active"
                                          ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                      }`}
                                      title={unit.status === "Active" ? "Turn Off" : "Turn On"}
                                      onClick={() => handleToggleStatus(unit.id)}
                                    >
                                      <Power className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                      title="Delete"
                                      onClick={() => handleDeleteUnit(unit)}
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
                    {filteredUnits.length === 0
                      ? 0
                      : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredUnits.length)} of ${filteredUnits.length}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {safePage} of {totalPages}
                  </span>
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
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Update unit details.</DialogDescription>
          </DialogHeader>
          {editingUnit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-unit-name">Unit Name *</Label>
                <Input
                  id="edit-unit-name"
                  value={editingUnit.name}
                  onChange={(e) =>
                    setEditingUnit((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit-order">Order Number</Label>
                <Input
                  id="edit-unit-order"
                  type="number"
                  value={editingUnit.orderNumber}
                  onChange={(e) =>
                    setEditingUnit((prev) =>
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
            <Button onClick={handleEditUnit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the unit &quot;{unitToDelete ? capitalize(unitToDelete.name) : ""}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUnit}>
              Delete Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
