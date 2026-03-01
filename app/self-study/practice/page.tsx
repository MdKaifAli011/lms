"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GripVertical,
  Power,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
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

const API_BASE = "/api/practice"
const EXAMS_API = "/api/exams?contextapi=1"
const SUBJECTS_API = "/api/subjects?contextapi=1"
const UNITS_API = "/api/units?contextapi=1"
const CHAPTERS_API = "/api/chapters?contextapi=1"
const TOPICS_API = "/api/topics?contextapi=1"
const SUBTOPICS_API = "/api/subtopics?contextapi=1"
const DEFINITIONS_API = "/api/definitions?contextapi=1"

type PaperType = "practice" | "full_length" | "previous_paper"

interface EntityOption {
  id: string
  name: string
  slug: string
  order: number
  examId?: string
  subjectId?: string
  unitId?: string
  chapterId?: string
  topicId?: string
  subtopicId?: string
}

interface ExamOption {
  id: string
  name: string
  slug: string
  status: string
  order: number
}

interface PracticePaper {
  id: string
  examId: string
  level: number
  subjectId?: string
  unitId?: string
  chapterId?: string
  topicId?: string
  subtopicId?: string
  definitionId?: string
  type: PaperType
  title: string
  slug: string
  description: string
  durationMinutes: number
  totalMarks: number
  totalQuestions: number
  difficulty: string
  year?: number
  orderNumber: number
  status: "Active" | "Inactive"
  locked: boolean
  image?: string
  createdAt?: string
  updatedAt?: string
}

const TYPE_LABELS: Record<PaperType, string> = {
  practice: "Practice",
  full_length: "Full-Length",
  previous_paper: "Previous Paper",
}

/** Seven levels = content hierarchy: Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition */
const LEVEL_NAMES: Record<number, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
}

export default function PracticePage() {
  const [papers, setPapers] = React.useState<PracticePaper[]>([])
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [allSubjects, setAllSubjects] = React.useState<EntityOption[]>([])
  const [allUnits, setAllUnits] = React.useState<EntityOption[]>([])
  const [allChapters, setAllChapters] = React.useState<EntityOption[]>([])
  const [allTopics, setAllTopics] = React.useState<EntityOption[]>([])
  const [allSubtopics, setAllSubtopics] = React.useState<EntityOption[]>([])
  const [allDefinitions, setAllDefinitions] = React.useState<EntityOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [examFilter, setExamFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [paperToDelete, setPaperToDelete] = React.useState<PracticePaper | null>(null)
  const [editingPaper, setEditingPaper] = React.useState<PracticePaper | null>(null)
  const [draggedPaper, setDraggedPaper] = React.useState<PracticePaper | null>(null)
  const [dragOverPaper, setDragOverPaper] = React.useState<PracticePaper | null>(null)
  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [newPaper, setNewPaper] = React.useState({
    examId: "",
    title: "",
    type: "practice" as PaperType,
    level: 1,
    subjectId: "",
    unitId: "",
    chapterId: "",
    topicId: "",
    subtopicId: "",
    definitionId: "",
    description: "",
    durationMinutes: 60,
    totalMarks: 100,
    totalQuestions: 30,
    difficulty: "Medium",
    year: new Date().getFullYear(),
    status: "Active" as "Active" | "Inactive",
    locked: false,
  })

  const fetchExams = React.useCallback(async () => {
    try {
      const res = await fetch(EXAMS_API)
      if (!res.ok) return
      const data = (await res.json()) as { id: string; name: string; slug: string; status: string; order: number }[]
      setExams(Array.isArray(data) ? data : [])
    } catch {
      setExams([])
    }
  }, [])

  const fetchHierarchy = React.useCallback(async () => {
    try {
      const [s, u, c, t, st, d] = await Promise.all([
        fetch(SUBJECTS_API).then((r) => r.ok ? r.json() : []),
        fetch(UNITS_API).then((r) => r.ok ? r.json() : []),
        fetch(CHAPTERS_API).then((r) => r.ok ? r.json() : []),
        fetch(TOPICS_API).then((r) => r.ok ? r.json() : []),
        fetch(SUBTOPICS_API).then((r) => r.ok ? r.json() : []),
        fetch(DEFINITIONS_API).then((r) => r.ok ? r.json() : []),
      ])
      setAllSubjects(Array.isArray(s) ? s : [])
      setAllUnits(Array.isArray(u) ? u : [])
      setAllChapters(Array.isArray(c) ? c : [])
      setAllTopics(Array.isArray(t) ? t : [])
      setAllSubtopics(Array.isArray(st) ? st : [])
      setAllDefinitions(Array.isArray(d) ? d : [])
    } catch {
      setAllSubjects([])
      setAllUnits([])
      setAllChapters([])
      setAllTopics([])
      setAllSubtopics([])
      setAllDefinitions([])
    }
  }, [])

  const fetchPapers = React.useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(API_BASE)
      if (!res.ok) throw new Error(res.statusText || "Failed to fetch")
      const data = (await res.json()) as PracticePaper[]
      setPapers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load practice papers")
      setPapers([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchExams()
  }, [fetchExams])

  React.useEffect(() => {
    fetchHierarchy()
  }, [fetchHierarchy])

  React.useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const getExamName = (examId: string) => {
    const exam = exams.find((e) => e.id === examId)
    return exam?.name ?? examId
  }

  const subjectsForExam = React.useMemo(
    () => allSubjects.filter((s) => (s as { examId?: string }).examId === newPaper.examId),
    [allSubjects, newPaper.examId]
  )
  const unitsForSubject = React.useMemo(
    () => allUnits.filter((u) => (u as { subjectId?: string }).subjectId === newPaper.subjectId),
    [allUnits, newPaper.subjectId]
  )
  const chaptersForUnit = React.useMemo(
    () => allChapters.filter((ch) => (ch as { unitId?: string }).unitId === newPaper.unitId),
    [allChapters, newPaper.unitId]
  )
  const topicsForChapter = React.useMemo(
    () => allTopics.filter((t) => (t as { chapterId?: string }).chapterId === newPaper.chapterId),
    [allTopics, newPaper.chapterId]
  )
  const subtopicsForTopic = React.useMemo(
    () => allSubtopics.filter((st) => (st as { topicId?: string }).topicId === newPaper.topicId),
    [allSubtopics, newPaper.topicId]
  )
  const definitionsForSubtopic = React.useMemo(
    () => allDefinitions.filter((d) => (d as { subtopicId?: string }).subtopicId === newPaper.subtopicId),
    [allDefinitions, newPaper.subtopicId]
  )

  const editSubjects = React.useMemo(
    () => (editingPaper?.examId ? allSubjects.filter((s) => (s as { examId?: string }).examId === editingPaper.examId) : []),
    [allSubjects, editingPaper?.examId]
  )
  const editUnits = React.useMemo(
    () => (editingPaper?.subjectId ? allUnits.filter((u) => (u as { subjectId?: string }).subjectId === editingPaper.subjectId) : []),
    [allUnits, editingPaper?.subjectId]
  )
  const editChapters = React.useMemo(
    () => (editingPaper?.unitId ? allChapters.filter((ch) => (ch as { unitId?: string }).unitId === editingPaper.unitId) : []),
    [allChapters, editingPaper?.unitId]
  )
  const editTopics = React.useMemo(
    () => (editingPaper?.chapterId ? allTopics.filter((t) => (t as { chapterId?: string }).chapterId === editingPaper.chapterId) : []),
    [allTopics, editingPaper?.chapterId]
  )
  const editSubtopics = React.useMemo(
    () => (editingPaper?.topicId ? allSubtopics.filter((st) => (st as { topicId?: string }).topicId === editingPaper.topicId) : []),
    [allSubtopics, editingPaper?.topicId]
  )
  const editDefinitions = React.useMemo(
    () => (editingPaper?.subtopicId ? allDefinitions.filter((d) => (d as { subtopicId?: string }).subtopicId === editingPaper.subtopicId) : []),
    [allDefinitions, editingPaper?.subtopicId]
  )

  const getScopeName = (paper: PracticePaper): string => {
    if (paper.level === 1) return getExamName(paper.examId)
    if (paper.level === 2 && paper.subjectId) {
      const s = allSubjects.find((x) => x.id === paper.subjectId)
      return s?.name ?? paper.subjectId
    }
    if (paper.level === 3 && paper.unitId) {
      const u = allUnits.find((x) => x.id === paper.unitId)
      return u?.name ?? paper.unitId
    }
    if (paper.level === 4 && paper.chapterId) {
      const ch = allChapters.find((x) => x.id === paper.chapterId)
      return ch?.name ?? paper.chapterId
    }
    if (paper.level === 5 && paper.topicId) {
      const t = allTopics.find((x) => x.id === paper.topicId)
      return t?.name ?? paper.topicId
    }
    if (paper.level === 6 && paper.subtopicId) {
      const st = allSubtopics.find((x) => x.id === paper.subtopicId)
      return st?.name ?? paper.subtopicId
    }
    if (paper.level === 7 && paper.definitionId) {
      const d = allDefinitions.find((x) => x.id === paper.definitionId)
      return d?.name ?? paper.definitionId
    }
    return LEVEL_NAMES[paper.level] ?? ""
  }

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExam = examFilter === "all" || paper.examId === examFilter
    const matchesType = typeFilter === "all" || paper.type === typeFilter
    const matchesStatus = statusFilter === "all" || paper.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesExam && matchesType && matchesStatus
  })

  const handleDragStart = (e: React.DragEvent, paper: PracticePaper) => {
    if (!isReorderingEnabled) {
      e.preventDefault()
      return
    }
    setDraggedPaper(paper)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (paper: PracticePaper) => {
    if (!isReorderingEnabled) return
    setDragOverPaper(paper)
  }

  const handleDragLeave = () => setDragOverPaper(null)

  const handleDrop = (e: React.DragEvent, target: PracticePaper) => {
    e.preventDefault()
    if (!isReorderingEnabled || !draggedPaper || draggedPaper.id === target.id) {
      setDraggedPaper(null)
      setDragOverPaper(null)
      return
    }
    const newPapers = [...papers]
    const draggedIndex = newPapers.findIndex((p) => p.id === draggedPaper.id)
    const targetIndex = newPapers.findIndex((p) => p.id === target.id)
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPaper(null)
      setDragOverPaper(null)
      return
    }
    newPapers.splice(draggedIndex, 1)
    newPapers.splice(targetIndex, 0, draggedPaper)
    newPapers.forEach((p, i) => {
      p.orderNumber = i + 1
    })
    setPapers(newPapers)
    setDraggedPaper(null)
    setDragOverPaper(null)
  }

  const [addSaving, setAddSaving] = React.useState(false)
  const handleAddPaper = async () => {
    if (!newPaper.examId || !newPaper.title.trim()) {
      toast.error("Exam and title are required")
      return
    }
    if (newPaper.level >= 2 && !newPaper.subjectId) {
      toast.error(`Please select a ${LEVEL_NAMES[2]}`)
      return
    }
    if (newPaper.level >= 3 && !newPaper.unitId) {
      toast.error(`Please select a ${LEVEL_NAMES[3]}`)
      return
    }
    if (newPaper.level >= 4 && !newPaper.chapterId) {
      toast.error(`Please select a ${LEVEL_NAMES[4]}`)
      return
    }
    if (newPaper.level >= 5 && !newPaper.topicId) {
      toast.error(`Please select a ${LEVEL_NAMES[5]}`)
      return
    }
    if (newPaper.level >= 6 && !newPaper.subtopicId) {
      toast.error(`Please select a ${LEVEL_NAMES[6]}`)
      return
    }
    if (newPaper.level >= 7 && !newPaper.definitionId) {
      toast.error(`Please select a ${LEVEL_NAMES[7]}`)
      return
    }
    setAddSaving(true)
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: newPaper.examId,
          title: newPaper.title.trim(),
          type: newPaper.type,
          level: newPaper.level,
          subjectId: newPaper.level >= 2 ? newPaper.subjectId || undefined : undefined,
          unitId: newPaper.level >= 3 ? newPaper.unitId || undefined : undefined,
          chapterId: newPaper.level >= 4 ? newPaper.chapterId || undefined : undefined,
          topicId: newPaper.level >= 5 ? newPaper.topicId || undefined : undefined,
          subtopicId: newPaper.level >= 6 ? newPaper.subtopicId || undefined : undefined,
          definitionId: newPaper.level >= 7 ? newPaper.definitionId || undefined : undefined,
          description: newPaper.description || undefined,
          durationMinutes: newPaper.durationMinutes,
          totalMarks: newPaper.totalMarks,
          totalQuestions: newPaper.totalQuestions,
          difficulty: newPaper.difficulty,
          year: newPaper.type === "previous_paper" ? newPaper.year : undefined,
          status: newPaper.status,
          locked: newPaper.locked,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = res.status === 409
          ? (data.error || "A paper with this title already exists for this exam.")
          : (data.error || res.statusText)
        throw new Error(msg)
      }
      const created = data as PracticePaper
      setPapers((prev) => [...prev, created])
      setNewPaper({
        examId: exams[0]?.id ?? "",
        title: "",
        type: "practice",
        level: 1,
        subjectId: "",
        unitId: "",
        chapterId: "",
        topicId: "",
        subtopicId: "",
        definitionId: "",
        description: "",
        durationMinutes: 60,
        totalMarks: 100,
        totalQuestions: 30,
        difficulty: "Medium",
        year: new Date().getFullYear(),
        status: "Active",
        locked: false,
      })
      setIsAddDialogOpen(false)
      toast.success("Practice paper created")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create")
    } finally {
      setAddSaving(false)
    }
  }

  const [editSaving, setEditSaving] = React.useState(false)
  const handleEditPaper = async () => {
    if (!editingPaper) return
    if (editingPaper.level >= 2 && !editingPaper.subjectId) {
      toast.error(`Please select a ${LEVEL_NAMES[2]}`)
      return
    }
    if (editingPaper.level >= 3 && !editingPaper.unitId) {
      toast.error(`Please select a ${LEVEL_NAMES[3]}`)
      return
    }
    if (editingPaper.level >= 4 && !editingPaper.chapterId) {
      toast.error(`Please select a ${LEVEL_NAMES[4]}`)
      return
    }
    if (editingPaper.level >= 5 && !editingPaper.topicId) {
      toast.error(`Please select a ${LEVEL_NAMES[5]}`)
      return
    }
    if (editingPaper.level >= 6 && !editingPaper.subtopicId) {
      toast.error(`Please select a ${LEVEL_NAMES[6]}`)
      return
    }
    if (editingPaper.level >= 7 && !editingPaper.definitionId) {
      toast.error(`Please select a ${LEVEL_NAMES[7]}`)
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch(`${API_BASE}/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingPaper.title.trim(),
          type: editingPaper.type,
          level: editingPaper.level,
          subjectId: editingPaper.level >= 2 ? editingPaper.subjectId || null : null,
          unitId: editingPaper.level >= 3 ? editingPaper.unitId || null : null,
          chapterId: editingPaper.level >= 4 ? editingPaper.chapterId || null : null,
          topicId: editingPaper.level >= 5 ? editingPaper.topicId || null : null,
          subtopicId: editingPaper.level >= 6 ? editingPaper.subtopicId || null : null,
          definitionId: editingPaper.level >= 7 ? editingPaper.definitionId || null : null,
          description: editingPaper.description || undefined,
          durationMinutes: editingPaper.durationMinutes,
          totalMarks: editingPaper.totalMarks,
          totalQuestions: editingPaper.totalQuestions,
          difficulty: editingPaper.difficulty,
          year: editingPaper.type === "previous_paper" ? editingPaper.year : undefined,
          status: editingPaper.status,
          locked: editingPaper.locked,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to update")
      const updated = data as PracticePaper
      setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setIsEditDialogOpen(false)
      setEditingPaper(null)
      toast.success("Practice paper updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeletePaper = (paper: PracticePaper) => {
    setPaperToDelete(paper)
    setIsDeleteDialogOpen(true)
  }

  const [deleteSaving, setDeleteSaving] = React.useState(false)
  const confirmDelete = async () => {
    if (!paperToDelete) return
    setDeleteSaving(true)
    try {
      const res = await fetch(`${API_BASE}/${paperToDelete.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
      setPapers((prev) => prev.filter((p) => p.id !== paperToDelete.id))
      setIsDeleteDialogOpen(false)
      setPaperToDelete(null)
      toast.success("Practice paper deleted")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    } finally {
      setDeleteSaving(false)
    }
  }

  const handleToggleStatus = async (paper: PracticePaper) => {
    const nextStatus = paper.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${API_BASE}/${paper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
      const updated = (await res.json()) as PracticePaper
      setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      toast.success(`Status set to ${nextStatus}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status")
    }
  }

  const [reorderSaving, setReorderSaving] = React.useState(false)
  const saveReordered = async () => {
    setReorderSaving(true)
    try {
      const order = papers.map((p, i) => ({ id: p.id, orderNumber: i + 1 }))
      const res = await fetch(`${API_BASE}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      })
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
      await fetchPapers()
      setIsReorderingEnabled(false)
      toast.success("Order saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save order")
    } finally {
      setReorderSaving(false)
    }
  }

  React.useEffect(() => {
    if (exams.length > 0 && !newPaper.examId) {
      setNewPaper((prev) => ({ ...prev, examId: exams[0].id }))
    }
  }, [exams])

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {error && (
        <div className="mx-4 mt-2 flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button>
        </div>
      )}
      {loading && (
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">Loading…</div>
      )}
      {!loading && (
        <>
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
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
                    <BreadcrumbPage>Practice</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={exams.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Practice Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[96vw] max-w-[1100px] p-0 sm:rounded-2xl">
                <DialogHeader className="space-y-1.5 border-b px-6 py-5">
                  <DialogTitle className="text-xl">Add Practice Paper</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    Create a practice test, full-length mock, or previous year paper. Level 1–7 = Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-5">
                <div className="grid gap-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Exam *</Label>
                      <Select
                        value={newPaper.examId}
                        onValueChange={(v) => setNewPaper({
                          ...newPaper,
                          examId: v,
                          subjectId: "",
                          unitId: "",
                          chapterId: "",
                          topicId: "",
                          subtopicId: "",
                          definitionId: "",
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Title *</Label>
                      <Input
                        placeholder="e.g. NEET Full Length Mock 01"
                        value={newPaper.title}
                        onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Type</Label>
                      <Select
                        value={newPaper.type}
                        onValueChange={(v: PaperType) => setNewPaper({ ...newPaper, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="full_length">Full-Length</SelectItem>
                          <SelectItem value="previous_paper">Previous Paper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Level (1–7)</Label>
                      <Select
                        value={String(newPaper.level)}
                        onValueChange={(v) => {
                          const l = Number(v)
                          setNewPaper({
                            ...newPaper,
                            level: l,
                            subjectId: l >= 2 ? newPaper.subjectId : "",
                            unitId: l >= 3 ? newPaper.unitId : "",
                            chapterId: l >= 4 ? newPaper.chapterId : "",
                            topicId: l >= 5 ? newPaper.topicId : "",
                            subtopicId: l >= 6 ? newPaper.subtopicId : "",
                            definitionId: l >= 7 ? newPaper.definitionId : "",
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((l) => (
                            <SelectItem key={l} value={String(l)}>
                              {l} – {LEVEL_NAMES[l]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> </div>
                  </div>
                  {newPaper.type === "previous_paper" && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Year</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 2024"
                          value={newPaper.year}
                          onChange={(e) => setNewPaper({ ...newPaper, year: parseInt(e.target.value, 10) || new Date().getFullYear() })}
                        />
                      </div>
                    </div>
                  )}
                  {(newPaper.level >= 2 || newPaper.level >= 3 || newPaper.level >= 4 || newPaper.level >= 5) && (
                    <div className="grid grid-cols-4 gap-4">
                      {newPaper.level >= 2 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[2]} *</Label>
                          <Select
                            value={newPaper.subjectId}
                            onValueChange={(v) => setNewPaper({
                              ...newPaper,
                              subjectId: v,
                              unitId: "",
                              chapterId: "",
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[2]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {subjectsForExam.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {newPaper.level >= 3 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[3]} *</Label>
                          <Select
                            value={newPaper.unitId}
                            onValueChange={(v) => setNewPaper({
                              ...newPaper,
                              unitId: v,
                              chapterId: "",
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[3]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {unitsForSubject.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {newPaper.level >= 4 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[4]} *</Label>
                          <Select
                            value={newPaper.chapterId}
                            onValueChange={(v) => setNewPaper({
                              ...newPaper,
                              chapterId: v,
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[4]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {chaptersForUnit.map((ch) => (
                                <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {newPaper.level >= 5 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[5]} *</Label>
                          <Select
                            value={newPaper.topicId}
                            onValueChange={(v) => setNewPaper({
                              ...newPaper,
                              topicId: v,
                              subtopicId: "",
                              definitionId: "",
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[5]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {topicsForChapter.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  {(newPaper.level >= 6 || newPaper.level >= 7) && (
                    <div className="grid grid-cols-4 gap-4">
                      {newPaper.level >= 6 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[6]} *</Label>
                          <Select
                            value={newPaper.subtopicId}
                            onValueChange={(v) => setNewPaper({
                              ...newPaper,
                              subtopicId: v,
                              definitionId: "",
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[6]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {subtopicsForTopic.map((st) => (
                                <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {newPaper.level >= 7 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[7]} *</Label>
                          <Select
                            value={newPaper.definitionId}
                            onValueChange={(v) => setNewPaper({ ...newPaper, definitionId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${LEVEL_NAMES[7]}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {definitionsForSubtopic.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="border-t pt-5">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Test details</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Duration (min)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={newPaper.durationMinutes}
                          onChange={(e) => setNewPaper({ ...newPaper, durationMinutes: parseInt(e.target.value, 10) || 60 })}
                        />
                      </div>
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Marks</Label>
                        <Input
                          type="number"
                          min={0}
                          value={newPaper.totalMarks}
                          onChange={(e) => setNewPaper({ ...newPaper, totalMarks: parseInt(e.target.value, 10) || 100 })}
                        />
                      </div>
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Questions</Label>
                        <Input
                          type="number"
                          min={0}
                          value={newPaper.totalQuestions}
                          onChange={(e) => setNewPaper({ ...newPaper, totalQuestions: parseInt(e.target.value, 10) || 30 })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Difficulty</Label>
                      <Select
                        value={newPaper.difficulty}
                        onValueChange={(v) => setNewPaper({ ...newPaper, difficulty: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Status</Label>
                      <Select
                        value={newPaper.status}
                        onValueChange={(v: "Active" | "Inactive") => setNewPaper({ ...newPaper, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="new-locked"
                        className="h-4 w-4 rounded border-input"
                        checked={newPaper.locked}
                        onChange={(e) => setNewPaper({ ...newPaper, locked: e.target.checked })}
                      />
                      <Label htmlFor="new-locked" className="cursor-pointer text-sm font-normal">Locked (show as &quot;Unlocks later&quot;)</Label>
                    </div>
                  </div>
                </div>
                </div>
                <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:justify-end">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPaper} disabled={addSaving}>{addSaving ? "Saving…" : "Add paper"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Papers</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-2xl font-bold">{papers.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Full-Length</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-2xl font-bold">{papers.filter((p) => p.type === "full_length").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Previous Year</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-2xl font-bold">{papers.filter((p) => p.type === "previous_paper").length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">Practice Papers</CardTitle>
                    <CardDescription>Manage practice tests, full-length mocks, and previous year papers. Level 1–7 = Exam, Subject, Unit, Chapter, Topic, Subtopic, Definition.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isReorderingEnabled ? (
                      <Button variant="outline" size="sm" onClick={() => setIsReorderingEnabled(true)}>
                        <GripVertical className="mr-2 h-4 w-4" />
                        Reorder
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsReorderingEnabled(false)}>Cancel</Button>
                        <Button size="sm" onClick={saveReordered} disabled={reorderSaving}>
                          {reorderSaving ? "Saving…" : "Save order"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={examFilter} onValueChange={setExamFilter}>
                      <SelectTrigger className="h-10 w-[160px]">
                        <SelectValue placeholder="Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All exams</SelectItem>
                        {exams.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-10 w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                        <SelectItem value="full_length">Full-Length</SelectItem>
                        <SelectItem value="previous_paper">Previous</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10 w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2">
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead className="min-w-[180px]">Title</TableHead>
                      <TableHead className="w-28">Exam</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="w-20">Level</TableHead>
                      <TableHead className="min-w-[140px]">Scope</TableHead>
                      <TableHead className="w-20">Duration</TableHead>
                      <TableHead className="w-16">Marks</TableHead>
                      <TableHead className="w-16">Q</TableHead>
                      <TableHead className="w-16">Year</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.map((paper) => (
                      <TableRow
                        key={paper.id}
                        className={`
                          ${paper.status === "Inactive" ? "opacity-60" : ""}
                          ${dragOverPaper?.id === paper.id ? "border-2 border-primary bg-primary/5" : ""}
                          ${isReorderingEnabled ? "cursor-move" : ""}
                        `}
                        draggable={isReorderingEnabled}
                        onDragStart={(e) => handleDragStart(e, paper)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(paper)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, paper)}
                      >
                        <TableCell className="font-medium">{paper.orderNumber}</TableCell>
                        <TableCell className="font-medium">{paper.title}</TableCell>
                        <TableCell className="text-muted-foreground">{getExamName(paper.examId)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{TYPE_LABELS[paper.type]}</Badge>
                        </TableCell>
                        <TableCell>{paper.level} – {LEVEL_NAMES[paper.level]}</TableCell>
                        <TableCell className="text-muted-foreground">{getScopeName(paper)}</TableCell>
                        <TableCell>{paper.durationMinutes}m</TableCell>
                        <TableCell>{paper.totalMarks}</TableCell>
                        <TableCell>{paper.totalQuestions}</TableCell>
                        <TableCell>{paper.type === "previous_paper" && paper.year ? paper.year : "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={paper.status === "Active" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(paper)}
                          >
                            {paper.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-amber-500 hover:bg-amber-50"
                              onClick={() => {
                                setEditingPaper({ ...paper })
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                              onClick={() => handleToggleStatus(paper)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => handleDeletePaper(paper)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredPapers.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">No practice papers match the filters.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[96vw] max-w-[1100px] p-0 sm:rounded-2xl">
              <DialogHeader className="space-y-1.5 border-b px-6 py-5">
                <DialogTitle className="text-xl">Edit Practice Paper</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">Update paper details. Level = content hierarchy (Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition).</DialogDescription>
              </DialogHeader>
              {editingPaper && (
                <>
                <div className="px-6 py-5">
                <div className="grid gap-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 grid gap-2.5">
                      <Label className="text-muted-foreground">Title *</Label>
                      <Input
                        value={editingPaper.title}
                        onChange={(e) => setEditingPaper({ ...editingPaper, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Type</Label>
                      <Select
                        value={editingPaper.type}
                        onValueChange={(v: PaperType) => setEditingPaper({ ...editingPaper, type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="full_length">Full-Length</SelectItem>
                          <SelectItem value="previous_paper">Previous Paper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Level (1–7)</Label>
                      <Select
                        value={String(editingPaper.level)}
                        onValueChange={(v) => {
                          const l = Number(v)
                          setEditingPaper({
                            ...editingPaper,
                            level: l,
                            subjectId: l >= 2 ? editingPaper.subjectId : undefined,
                            unitId: l >= 3 ? editingPaper.unitId : undefined,
                            chapterId: l >= 4 ? editingPaper.chapterId : undefined,
                            topicId: l >= 5 ? editingPaper.topicId : undefined,
                            subtopicId: l >= 6 ? editingPaper.subtopicId : undefined,
                            definitionId: l >= 7 ? editingPaper.definitionId : undefined,
                          })
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((l) => (
                            <SelectItem key={l} value={String(l)}>{l} – {LEVEL_NAMES[l]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editingPaper.type === "previous_paper" ? (
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Year</Label>
                        <Input
                          type="number"
                          value={editingPaper.year ?? ""}
                          onChange={(e) => setEditingPaper({ ...editingPaper, year: parseInt(e.target.value, 10) || undefined })}
                        />
                      </div>
                    ) : null}
                  </div>
                  {(editingPaper.level >= 2 || editingPaper.level >= 3 || editingPaper.level >= 4 || editingPaper.level >= 5) && (
                    <div className="grid grid-cols-4 gap-4">
                      {editingPaper.level >= 2 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[2]} *</Label>
                      <Select
                        value={editingPaper.subjectId ?? ""}
                        onValueChange={(v) => setEditingPaper({
                          ...editingPaper,
                          subjectId: v,
                          unitId: undefined,
                          chapterId: undefined,
                          topicId: undefined,
                          subtopicId: undefined,
                          definitionId: undefined,
                        })}
                      >
                        <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[2]}`} /></SelectTrigger>
                        <SelectContent>
                          {editSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {editingPaper.level >= 3 && (
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Choose {LEVEL_NAMES[3]} *</Label>
                      <Select
                        value={editingPaper.unitId ?? ""}
                        onValueChange={(v) => setEditingPaper({
                          ...editingPaper,
                          unitId: v,
                          chapterId: undefined,
                          topicId: undefined,
                          subtopicId: undefined,
                          definitionId: undefined,
                        })}
                      >
                        <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[3]}`} /></SelectTrigger>
                        <SelectContent>
                          {editUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {editingPaper.level >= 4 && (
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Choose {LEVEL_NAMES[4]} *</Label>
                      <Select
                        value={editingPaper.chapterId ?? ""}
                        onValueChange={(v) => setEditingPaper({
                          ...editingPaper,
                          chapterId: v,
                          topicId: undefined,
                          subtopicId: undefined,
                          definitionId: undefined,
                        })}
                      >
                        <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[4]}`} /></SelectTrigger>
                        <SelectContent>
                          {editChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {editingPaper.level >= 5 && (
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Choose {LEVEL_NAMES[5]} *</Label>
                      <Select
                        value={editingPaper.topicId ?? ""}
                        onValueChange={(v) => setEditingPaper({
                          ...editingPaper,
                          topicId: v,
                          subtopicId: undefined,
                          definitionId: undefined,
                        })}
                      >
                        <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[5]}`} /></SelectTrigger>
                        <SelectContent>
                          {editTopics.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                    </div>
                  )}
                  {(editingPaper.level >= 6 || editingPaper.level >= 7) && (
                    <div className="grid grid-cols-4 gap-4">
                      {editingPaper.level >= 6 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[6]} *</Label>
                      <Select
                        value={editingPaper.subtopicId ?? ""}
                        onValueChange={(v) => setEditingPaper({
                          ...editingPaper,
                          subtopicId: v,
                          definitionId: undefined,
                        })}
                      >
                        <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[6]}`} /></SelectTrigger>
                        <SelectContent>
                          {editSubtopics.map((st) => (
                            <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                      {editingPaper.level >= 7 && (
                        <div className="grid gap-2.5">
                          <Label className="text-muted-foreground">Choose {LEVEL_NAMES[7]} *</Label>
                          <Select
                            value={editingPaper.definitionId ?? ""}
                            onValueChange={(v) => setEditingPaper({ ...editingPaper, definitionId: v })}
                          >
                            <SelectTrigger><SelectValue placeholder={`Select ${LEVEL_NAMES[7]}`} /></SelectTrigger>
                            <SelectContent>
                              {editDefinitions.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="border-t pt-5">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Test details</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Duration (min)</Label>
                        <Input
                        type="number"
                        min={1}
                        value={editingPaper.durationMinutes}
                        onChange={(e) => setEditingPaper({ ...editingPaper, durationMinutes: parseInt(e.target.value, 10) || 60 })}
                      />
                      </div>
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Marks</Label>
                        <Input
                        type="number"
                        min={0}
                        value={editingPaper.totalMarks}
                        onChange={(e) => setEditingPaper({ ...editingPaper, totalMarks: parseInt(e.target.value, 10) || 100 })}
                      />
                      </div>
                      <div className="grid gap-2.5">
                        <Label className="text-muted-foreground">Questions</Label>
                        <Input
                        type="number"
                        min={0}
                        value={editingPaper.totalQuestions}
                        onChange={(e) => setEditingPaper({ ...editingPaper, totalQuestions: parseInt(e.target.value, 10) || 30 })}
                      />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Difficulty</Label>
                      <Select
                        value={editingPaper.difficulty}
                        onValueChange={(v) => setEditingPaper({ ...editingPaper, difficulty: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2.5">
                      <Label className="text-muted-foreground">Status</Label>
                      <Select
                        value={editingPaper.status}
                        onValueChange={(v: "Active" | "Inactive") => setEditingPaper({ ...editingPaper, status: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="edit-locked"
                        className="h-4 w-4 rounded border-input"
                        checked={editingPaper.locked}
                        onChange={(e) => setEditingPaper({ ...editingPaper, locked: e.target.checked })}
                      />
                      <Label htmlFor="edit-locked" className="cursor-pointer text-sm font-normal">Locked</Label>
                    </div>
                  </div>
                </div>
                </div>
                <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:justify-end">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditPaper} disabled={editSaving}>{editSaving ? "Saving…" : "Update"}</Button>
                </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete practice paper</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{paperToDelete?.title}&quot;? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setPaperToDelete(null) }}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleteSaving}>
                  {deleteSaving ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
