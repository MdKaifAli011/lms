"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Search, GripVertical, Edit, Trash2, Check, Power, ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { capitalize } from "@/lib/utils"

const EXAMS_API = "/api/exams"
const SUBJECTS_API = "/api/subjects"

type ExamOption = {
  id: string
  name: string
  status?: "Active" | "Inactive"
}

type Subject = {
  id: string
  name: string
  examId: string
  slug: string
  status: "Active" | "Inactive"
  meta: string
  content: string
  visits: number
  uniqueVisits: number
  today: number
  orderNumber: number
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Search + filters.
  const [searchTerm, setSearchTerm] = React.useState("")
  const [metaStatusFilter, setMetaStatusFilter] = React.useState<"all" | "filled" | "not-filled">("all")
  const [examFilter, setExamFilter] = React.useState<"all" | string>("all")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  // Dialog state (single create, bulk create, edit, delete).
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isQuickCreateSheetOpen, setIsQuickCreateSheetOpen] = React.useState(false)
  const [isSingleAddDialogOpen, setIsSingleAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const [subjectToDelete, setSubjectToDelete] = React.useState<Subject | null>(null)
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null)

  // Explicit reordering mode + drag state.
  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [draggedSubject, setDraggedSubject] = React.useState<Subject | null>(null)
  const [dragOverSubject, setDragOverSubject] = React.useState<Subject | null>(null)

  const [quickCreateSelectedExamIds, setQuickCreateSelectedExamIds] = React.useState<string[]>([])
  const [quickCreateSubjectsByExamId, setQuickCreateSubjectsByExamId] = React.useState<Record<string, string>>({})

  const [singleNewSubject, setSingleNewSubject] = React.useState<{ name: string; examId: string | null }>({
    name: "",
    examId: null,
  })

  const getExamName = (examId: string) => exams.find((e) => e.id === examId)?.name ?? "-"

  const getExamStatus = (examId: string): "Active" | "Inactive" => {
    const exam = exams.find((e) => e.id === examId)
    return exam?.status ?? "Active"
  }

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
      setSubjects(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subjects")
    }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchExams(), fetchSubjects()])
    setLoading(false)
  }, [fetchExams, fetchSubjects])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleSubjectStatus = async (id: string) => {
    const subject = subjects.find((s) => s.id === id)
    if (!subject) return
    const examStatus = getExamStatus(subject.examId)
    if (examStatus === "Inactive") return
    const nextStatus: Subject["status"] = subject.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${SUBJECTS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update status")
        return
      }
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)))
    } catch {
      toast.error("Failed to update status")
    }
  }

  const getNextOrderNumber = (examId: string) => {
    const maxOrder = Math.max(...subjects.filter((s) => s.examId === examId).map((s) => s.orderNumber || 0), 0)
    return maxOrder + 1
  }

  const normalizeOrderNumbers = (list: Subject[]) => {
    const ordered: Subject[] = []
    exams.forEach((exam) => {
      const items = list
        .filter((s) => s.examId === exam.id)
        .slice()
        .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
      items.forEach((s, idx) => ordered.push({ ...s, orderNumber: idx + 1 }))
    })
    list.filter((s) => !exams.some((e) => e.id === s.examId)).forEach((s) => ordered.push(s))
    return ordered
  }

  const filteredSubjects = subjects
    .slice()
    .sort((a, b) => {
      const examA = exams.findIndex((e) => e.id === a.examId)
      const examB = exams.findIndex((e) => e.id === b.examId)
      if (examA !== examB) return examA - examB
      return (a.orderNumber || 0) - (b.orderNumber || 0)
    })
    .filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExam = examFilter === "all" || s.examId === examFilter
      const matchesMeta =
        metaStatusFilter === "all" ||
        (metaStatusFilter === "filled" && s.meta !== "-") ||
        (metaStatusFilter === "not-filled" && s.meta === "-")
      return matchesSearch && matchesExam && matchesMeta
    })

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, metaStatusFilter, examFilter, pageSize])

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedSubjects = filteredSubjects.slice(startIndex, startIndex + pageSize)

  const resetQuickCreate = () => {
    setQuickCreateSelectedExamIds([])
    setQuickCreateSubjectsByExamId({})
  }

  const toggleExamSelection = (examId: string) => {
    setQuickCreateSelectedExamIds((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    )
  }

  const toggleSelectAll = () => {
    setQuickCreateSelectedExamIds((prev) =>
      prev.length === exams.length ? [] : exams.map((e) => e.id)
    )
  }

  const handleBulkCreateSubjects = async () => {
    if (quickCreateSelectedExamIds.length === 0) return
    const toCreate: { name: string; examId: string }[] = []
    quickCreateSelectedExamIds.forEach((examId) => {
      const raw = quickCreateSubjectsByExamId[examId] || ""
      const names = raw
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      names.forEach((name) => toCreate.push({ name, examId }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { name, examId } of toCreate) {
      try {
        const res = await fetch(SUBJECTS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, examId }),
        })
        if (res.status === 409) {
          duplicate++
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create subject")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create subject")
      }
    }
    if (created) {
      await fetchSubjects()
      toast.success(`${created} subject(s) created`)
    }
    if (duplicate) toast.warning(`${duplicate} skipped (already exist in this exam)`)
    setIsQuickCreateSheetOpen(false)
    resetQuickCreate()
  }

  const resetSingleCreate = () => {
    setSingleNewSubject({ name: "", examId: null })
  }

  const handleSingleCreateSubject = async () => {
    if (!singleNewSubject.name.trim() || !singleNewSubject.examId) return
    try {
      const res = await fetch(SUBJECTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: singleNewSubject.name.trim(),
          examId: singleNewSubject.examId,
        }),
      })
      if (res.status === 409) {
        toast.error("A subject with this name already exists in this exam")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to create subject")
        return
      }
      await fetchSubjects()
      toast.success("Subject created")
      setIsSingleAddDialogOpen(false)
      resetSingleCreate()
    } catch {
      toast.error("Failed to create subject")
    }
  }

  const openEditDialog = (subject: Subject) => {
    // Clone the object so edits are staged until Save.
    setEditingSubject({ ...subject })
    setIsEditDialogOpen(true)
  }

  const handleEditSubject = async () => {
    if (!editingSubject) return
    try {
      const res = await fetch(`${SUBJECTS_API}/${editingSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingSubject.name,
          examId: editingSubject.examId,
          status: editingSubject.status,
          orderNumber: editingSubject.orderNumber,
        }),
      })
      if (res.status === 409) {
        toast.error("A subject with this name already exists in this exam")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to update subject")
        return
      }
      await fetchSubjects()
      toast.success("Subject updated")
      setIsEditDialogOpen(false)
      setEditingSubject(null)
    } catch {
      toast.error("Failed to update subject")
    }
  }

  const handleDeleteSubject = (id: string) => {
    const subject = subjects.find((s) => s.id === id)
    if (subject) {
      setSubjectToDelete(subject)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return
    try {
      const res = await fetch(`${SUBJECTS_API}/${subjectToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to delete subject")
        return
      }
      setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id))
      setIsDeleteDialogOpen(false)
      setSubjectToDelete(null)
      toast.success("Subject deleted")
    } catch {
      toast.error("Failed to delete subject")
    }
  }

  const cancelDeleteSubject = () => {
    setIsDeleteDialogOpen(false)
    setSubjectToDelete(null)
  }

  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => {
    // Exit reordering mode and clear drag UI state.
    setIsReorderingEnabled(false)
    setDraggedSubject(null)
    setDragOverSubject(null)
  }

  const saveReorderedSubjects = async () => {
    const ordered = subjects
      .slice()
      .sort((a, b) => {
        const examA = exams.findIndex((e) => e.id === a.examId)
        const examB = exams.findIndex((e) => e.id === b.examId)
        if (examA !== examB) return examA - examB
        return (a.orderNumber || 0) - (b.orderNumber || 0)
      })
      .map((s) => ({ id: s.id, orderNumber: s.orderNumber }))
    try {
      const res = await fetch(`${SUBJECTS_API}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ordered }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? "Failed to save order")
        return
      }
      await fetchSubjects()
      toast.success("Order saved")
      disableReordering()
    } catch {
      toast.error("Failed to save order")
    }
  }

  const handleDragStart = (e: React.DragEvent, subject: Subject) => {
    // Only active when user explicitly enables reordering.
    // This prevents accidental drag-and-drop actions.
    if (!isReorderingEnabled) return
    // Store the subject being dragged for later reference.
    setDraggedSubject(subject)
    // Allow the drag operation to proceed.
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Prevent default behavior to allow our custom handling.
    e.preventDefault()
    // Only active when user explicitly enables reordering.
    if (!isReorderingEnabled) return
    // Allow the drop operation to proceed.
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (subject: Subject) => {
    // Used to show a visual highlight for the potential drop target.
    // Only active when user explicitly enables reordering.
    if (!isReorderingEnabled) return
    // Prevent self-reordering (i.e., dragging an item onto itself).
    if (!draggedSubject || draggedSubject.id === subject.id) return
    // Store the subject being hovered over for later reference.
    setDragOverSubject(subject)
  }

  const handleDragLeave = () => {
    // Used to remove the visual highlight when the user drags away from a potential drop target.
    // Only active when user explicitly enables reordering.
    if (!isReorderingEnabled) return
    // Clear the stored subject being hovered over.
    setDragOverSubject(null)
  }

  const handleDrop = (e: React.DragEvent, target: Subject) => {
    // Reorders within the *same exam group* only.
    // Prevents reordering across different exam groups.
    e.preventDefault()
    // Only active when user explicitly enables reordering.
    if (!isReorderingEnabled) return
    // Prevent self-reordering (i.e., dragging an item onto itself).
    if (!draggedSubject || draggedSubject.id === target.id) return
    // Prevent reordering across different exam groups.
    if (draggedSubject.examId !== target.examId) return

    // Reorder the subjects within the same exam group.
    setSubjects((prev) => {
      // Separate subjects into two groups: those not being reordered and those being reordered.
      const other = prev.filter((s) => s.examId !== target.examId)
      const group = prev
        .filter((s) => s.examId === target.examId)
        // Sort the group by order number to maintain the correct order.
        .slice()
        .sort((a, b) => a.orderNumber - b.orderNumber)

      const fromIndex = group.findIndex((s) => s.id === draggedSubject.id)
      const toIndex = group.findIndex((s) => s.id === target.id)
      if (fromIndex === -1 || toIndex === -1) return prev

      const [moved] = group.splice(fromIndex, 1)
      group.splice(toIndex, 0, moved)

      const reordered = group.map((s, idx) => ({ ...s, orderNumber: idx + 1 }))
      return normalizeOrderNumbers([...other, ...reordered])
    })

    setDraggedSubject(null)
    setDragOverSubject(null)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading subjects…</p>
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
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
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
                    <BreadcrumbPage>Subjects</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isSingleAddDialogOpen} onOpenChange={setIsSingleAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>
                      Create a single subject and attach it to an exam.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="single-subject-name">Subject Name *</Label>
                      <Input
                        id="single-subject-name"
                        placeholder="Enter subject name (e.g., Mathematics)"
                        value={singleNewSubject.name}
                        onChange={(e) => setSingleNewSubject((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Exam *</Label>
                      <Select
                        value={singleNewSubject.examId ?? ""}
                        onValueChange={(v) => setSingleNewSubject((p) => ({ ...p, examId: v || null }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {capitalize(e.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Order Number</Label>
                      <Input
                        value={String(singleNewSubject.examId ? getNextOrderNumber(singleNewSubject.examId) : "-")}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-[11px] text-muted-foreground">Auto-calculated</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setIsSingleAddDialogOpen(false)
                        resetSingleCreate()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSingleCreateSubject}>
                      Add Subject
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

          <div className="flex-1 space-y-4 p-4 pt-4">
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
                        resetQuickCreate()
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to list
                    </Button>
                  </div>
                  <CardTitle className="text-xl">Quick Create Subjects</CardTitle>
                  <CardDescription>
                    Select one or more exams and enter subject names for each exam separately (one per line). Content and
                    SEO can be added later.
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Exams *</Label>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto px-0"
                          type="button"
                          onClick={toggleSelectAll}
                        >
                          {quickCreateSelectedExamIds.length === exams.length ? "Clear All" : "Select All"}
                        </Button>
                      </div>
                      <div className="rounded-md border bg-background">
                        <div className="max-h-56 overflow-auto p-2">
                          {exams.map((exam) => {
                            const checked = quickCreateSelectedExamIds.includes(exam.id)
                            return (
                              <label
                                key={exam.id}
                                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleExamSelection(exam.id)}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm">{capitalize(exam.name)}</span>
                              </label>
                            )
                          })}
                        </div>
                        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                          {quickCreateSelectedExamIds.length} exams selected
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label>Subject Names *</Label>
                      {quickCreateSelectedExamIds.length === 0 ? (
                        <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                          Select at least one exam to start adding subjects.
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {quickCreateSelectedExamIds.map((examId) => (
                            <div key={examId} className="rounded-md border p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {getExamName(examId)} <span className="text-destructive">*</span>
                                </div>
                                <div className="text-xs text-muted-foreground">One subject per line</div>
                              </div>
                              <Textarea
                                value={quickCreateSubjectsByExamId[examId] || ""}
                                onChange={(e) =>
                                  setQuickCreateSubjectsByExamId((prev) => ({
                                    ...prev,
                                    [examId]: e.target.value,
                                  }))
                                }
                                placeholder="Physics\nChemistry\nMathematics\nBiology"
                                className="min-h-[110px]"
                              />
                            </div>
                          ))}
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
                        resetQuickCreate()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleBulkCreateSubjects}>
                      Create Subjects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Subjects</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{subjects.length}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All subjects in system</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Active Subjects</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {subjects.filter((s) => s.status === "Active").length}
                  </div>
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
                  <div className="text-xl font-bold leading-none">
                    {subjects.reduce((sum, s) => sum + (s.visits || 0), 0)}
                  </div>
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
                  <div className="text-xl font-bold leading-none">
                    {subjects.reduce((sum, s) => sum + (s.today || 0), 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visits today</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">Subjects List</CardTitle>
                    <CardDescription className="text-sm">
                      Manage subjects, organize content, and configure learning paths
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isReorderingEnabled ? (
                      <Button variant="outline" size="sm" className="h-9 px-3" onClick={enableReordering}>
                        <GripVertical className="mr-2 h-4 w-4" />
                        Enable Reordering
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={disableReordering}>
                          Cancel
                        </Button>
                        <Button size="sm" className="h-9 px-3" onClick={saveReorderedSubjects}>
                          Save Order
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>

                  <Select value={examFilter} onValueChange={setExamFilter}>
                    <SelectTrigger className="w-[180px] h-10">
                      <SelectValue placeholder="Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {exams.map((e) => (
<SelectItem key={e.id} value={String(e.id)}>
                            {capitalize(e.name)}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={metaStatusFilter}
                    onValueChange={(v: "all" | "filled" | "not-filled") => setMetaStatusFilter(v)}
                  >
                    <SelectTrigger className="w-[180px] h-10">
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

              <CardContent>
                <div className="space-y-4">
                  {exams
                    .filter((exam) => pagedSubjects.some((s) => s.examId === exam.id))
                    .map((exam) => {
                      const rows = pagedSubjects
                        .filter((s) => s.examId === exam.id)
                        .slice()
                        .sort((a, b) => a.orderNumber - b.orderNumber)

                      return (
                        <Card key={exam.id} className="shadow-sm">
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex items-center gap-2">
                              <Badge className="rounded-full px-2 py-0.5 text-xs">{capitalize(exam.name)}</Badge>
                              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                {rows.length} Subject{rows.length === 1 ? "" : "s"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <Table className="table-fixed">
                              <TableHeader>
                                <TableRow className="border-b-2">
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[88px]">Order</TableHead>
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[320px]">Subject Name</TableHead>
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[180px]">Content</TableHead>
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[80px]">Meta</TableHead>
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[120px]">Visits</TableHead>
                                  <TableHead className="font-semibold text-xs uppercase tracking-wider w-[80px]">Today</TableHead>
                                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-[120px] pr-2">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rows.map((subject) => (
                                  <TableRow
                                    key={subject.id}
                                    className={`
                                      ${subject.status === "Inactive" ? "opacity-60" : ""}
                                      ${dragOverSubject?.id === subject.id ? "border-2 border-blue-400 bg-blue-50" : ""}
                                    `}
                                    draggable={isReorderingEnabled}
                                    onDragStart={(e) => handleDragStart(e, subject)}
                                    onDragOver={handleDragOver}
                                    onDragEnter={() => handleDragEnter(subject)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, subject)}
                                  >
                                    <TableCell className="py-3 pr-3">
                                      <div
                                        className={
                                          isReorderingEnabled
                                            ? "flex items-center justify-center gap-2 text-muted-foreground cursor-grab"
                                            : "flex items-center justify-center"
                                        }
                                        title={isReorderingEnabled ? "Drag to reorder" : undefined}
                                      >
                                        {isReorderingEnabled && <GripVertical className="h-4 w-4" />}
                                        <span className="min-w-6 text-center font-medium text-foreground">{subject.orderNumber}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                      <Link
                                        href={`/self-study/subjects/${subject.id}`}
                                        className={`font-semibold hover:underline hover:text-primary ${
                                          subject.status === "Inactive" ? "line-through text-muted-foreground" : ""
                                        }`}
                                      >
                                        {capitalize(subject.name)}
                                      </Link>
                                    </TableCell>
                                    <TableCell className="py-3 text-muted-foreground">
                                      {subject.content !== "-" ? subject.content : (
                                        <span className="italic">unavailable</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {subject.meta !== "-" ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {subject.visits > 0 ? (
                                        <div>
                                          <div className="font-semibold leading-none">{subject.visits}</div>
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            ({subject.uniqueVisits} unique)
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      {subject.visits > 0 || subject.today > 0 ? (
                                        <div className="font-medium">{subject.today}</div>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right py-3 pr-2">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          disabled={getExamStatus(subject.examId) === "Inactive"}
                                          className={`h-8 w-8 transition-colors ${
                                            getExamStatus(subject.examId) === "Inactive"
                                              ? "text-gray-300"
                                              : subject.status === "Active"
                                                ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                          }`}
                                          onClick={() => handleToggleSubjectStatus(subject.id)}
                                          title={`Turn ${subject.status === "Active" ? "Off" : "On"}`}
                                        >
                                          <Power className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                          onClick={() => openEditDialog(subject)}
                                          title="Edit Subject"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => handleDeleteSubject(subject.id)}
                                          title="Delete Subject"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="w-[110px] h-9">
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
                      {filteredSubjects.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredSubjects.length)} of {filteredSubjects.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
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
              </CardContent>
            </Card>
            </>
            )}
          </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Subject</DialogTitle>
                  <DialogDescription>Update subject details.</DialogDescription>
                </DialogHeader>

                {editingSubject && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-subject-name">Subject Name *</Label>
                      <Input
                        id="edit-subject-name"
                        value={editingSubject.name}
                        onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Exam *</Label>
                      <Select
                        value={editingSubject.examId}
                        onValueChange={(v) => setEditingSubject({ ...editingSubject, examId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {capitalize(e.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditSubject}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the subject &quot;{subjectToDelete?.name}&quot;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={cancelDeleteSubject}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteSubject}>
                    Delete Subject
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </>
  )
}
