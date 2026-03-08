"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Search,
  Loader2,
  ListChecks,
} from "lucide-react"
import { toast } from "sonner"
import { toTitleCase } from "@/lib/titleCase"

/** Auto: duration = questions × 3 min, total marks = questions × 4. */
const MINUTES_PER_QUESTION = 3
const MARKS_PER_QUESTION = 4

interface LevelWisePractice {
  id: string
  examId: string
  examName?: string
  level: number
  levelName?: string
  subjectId?: string
  subjectName?: string
  unitId?: string
  unitName?: string
  chapterId?: string
  chapterName?: string
  topicId?: string
  topicName?: string
  subtopicId?: string
  subtopicName?: string
  definitionId?: string
  definitionName?: string
  title: string
  slug: string
  description?: string
  durationMinutes: number
  totalMarks: number
  totalQuestions: number
  difficulty: string
  orderNumber: number
  status: string
  locked: boolean
}

interface Exam {
  id: string
  name: string
}

const CONTENT_LEVELS = [
  { value: 1, label: "Level 1 - Exam" },
  { value: 2, label: "Level 2 - Subject" },
  { value: 3, label: "Level 3 - Unit" },
  { value: 4, label: "Level 4 - Chapter" },
  { value: 5, label: "Level 5 - Topic" },
  { value: 6, label: "Level 6 - Subtopic" },
  { value: 7, label: "Level 7 - Definition" },
]

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"]

export default function LevelWisePracticePage() {
  const [papers, setPapers] = useState<LevelWisePractice[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  
  // Add/Edit dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState<LevelWisePractice | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    examId: "",
    level: "1",
    subjectId: "",
    unitId: "",
    chapterId: "",
    topicId: "",
    subtopicId: "",
    definitionId: "",
    title: "",
    description: "",
    durationMinutes: "60",
    totalMarks: "100",
    totalQuestions: "30",
    difficulty: "Medium",
    status: "Active",
    locked: false,
  })
  const [overrideTotalMarks, setOverrideTotalMarks] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [papersRes, examsRes] = await Promise.all([
          fetch("/api/level-wise-practice"),
          fetch("/api/exams?contextapi=1"),
        ])
        
        if (!papersRes.ok) throw new Error("Failed to fetch practice papers")
        if (!examsRes.ok) throw new Error("Failed to fetch exams")
        
        const papersData = await papersRes.json()
        const examsData = await examsRes.json()
        
        setPapers(Array.isArray(papersData.papers) ? papersData.papers : papersData)
        setExams(Array.isArray(examsData) ? examsData : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.examName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = levelFilter === "all" || paper.level === parseInt(levelFilter)
      return matchesSearch && matchesLevel
    })
  }, [papers, searchTerm, levelFilter])

  // Stats
  const stats = useMemo(() => ({
    total: papers.length,
    active: papers.filter((p) => p.status === "Active").length,
    inactive: papers.filter((p) => p.status === "Inactive").length,
    locked: papers.filter((p) => p.locked).length,
  }), [papers])

  // Handle add
  const handleAdd = async () => {
    setAddSaving(true)
    try {
      const title = toTitleCase((formData.title ?? "").trim())
      if (!title) {
        toast.error("Title is required")
        setAddSaving(false)
        return
      }
      const res = await fetch("/api/level-wise-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title,
          level: parseInt(formData.level),
          durationMinutes: 0,
          totalMarks: 0,
          totalQuestions: 0,
        }),
      })
      
      if (!res.ok) throw new Error("Failed to create")
      
      const newPaper = await res.json()
      setPapers((prev) => [...prev, newPaper])
      setIsAddOpen(false)
      resetForm()
      toast.success("Practice paper created successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setAddSaving(false)
    }
  }

  // Handle edit
  const handleEdit = async () => {
    if (!editingPaper) return
    setEditSaving(true)
    try {
      const totalQuestions = parseInt(formData.totalQuestions, 10) || 0
      const durationMinutes = totalQuestions * MINUTES_PER_QUESTION
      const totalMarks = overrideTotalMarks
        ? parseInt(formData.totalMarks, 10) || 0
        : totalQuestions * MARKS_PER_QUESTION
      const title = toTitleCase((formData.title ?? "").trim())
      if (!title) {
        toast.error("Title is required")
        setEditSaving(false)
        return
      }
      const res = await fetch(`/api/level-wise-practice/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title,
          level: parseInt(formData.level),
          durationMinutes,
          totalMarks,
          totalQuestions,
        }),
      })
      
      if (!res.ok) throw new Error("Failed to update")
      
      const updated = await res.json()
      setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setIsEditOpen(false)
      setEditingPaper(null)
      toast.success("Practice paper updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setEditSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this practice paper?")) return
    try {
      const res = await fetch(`/api/level-wise-practice/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setPapers((prev) => prev.filter((p) => p.id !== id))
      toast.success("Practice paper deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  // Open edit dialog
  const openEdit = (paper: LevelWisePractice) => {
    setEditingPaper(paper)
    const q = paper.totalQuestions || 0
    setFormData({
      examId: paper.examId,
      level: String(paper.level),
      subjectId: paper.subjectId || "",
      unitId: paper.unitId || "",
      chapterId: paper.chapterId || "",
      topicId: paper.topicId || "",
      subtopicId: paper.subtopicId || "",
      definitionId: paper.definitionId || "",
      title: paper.title,
      description: paper.description || "",
      durationMinutes: String(q * MINUTES_PER_QUESTION),
      totalMarks: String(paper.totalMarks),
      totalQuestions: String(paper.totalQuestions),
      difficulty: paper.difficulty,
      status: paper.status,
      locked: paper.locked,
    })
    setOverrideTotalMarks(paper.totalMarks !== q * MARKS_PER_QUESTION)
    setIsEditOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      examId: "",
      level: "1",
      subjectId: "",
      unitId: "",
      chapterId: "",
      topicId: "",
      subtopicId: "",
      definitionId: "",
      title: "",
      description: "",
      durationMinutes: "0",
      totalMarks: "0",
      totalQuestions: "0",
      difficulty: "Medium",
      status: "Active",
      locked: false,
    })
    setOverrideTotalMarks(false)
  }

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {error && (
        <div className="mx-4 mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button>
        </div>
      )}
      {loading && (
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          Loading level-wise practice…
        </div>
      )}
      {!loading && (
        <>
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
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
                    <BreadcrumbLink href="/practice-management">Practice Management</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Level-Wise (Chapter/Unit/Subject)</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Practice
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Level Wise Practice</DialogTitle>
                <DialogDescription>
                  Create a new practice test for a specific level (Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam *</Label>
                    <Select value={formData.examId} onValueChange={(v) => setFormData({ ...formData, examId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter practice title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={addSaving}>
                  {addSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </header>

          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Papers</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{stats.total}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All level-wise papers</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Active</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none text-green-600">{stats.active}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Currently visible</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Inactive</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none text-yellow-600">{stats.inactive}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Hidden from students</p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Locked</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none text-red-600">{stats.locked}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Require unlock</p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Level Wise Practice Papers</CardTitle>
                    <CardDescription>Manage level-wise practice papers by exam and level.</CardDescription>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search papers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Filter by level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {CONTENT_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden">
                <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No practice papers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell>{paper.orderNumber}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/practice-management/level-wise/${paper.id}/questions`}
                          className="text-primary hover:underline focus:underline focus:outline-none"
                        >
                          {toTitleCase(paper.title)}
                        </Link>
                      </TableCell>
                      <TableCell>{paper.examName}</TableCell>
                      <TableCell>{paper.levelName}</TableCell>
                      <TableCell>{paper.durationMinutes} min</TableCell>
                      <TableCell>{paper.totalQuestions}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          paper.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {paper.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild title="Manage questions">
                            <Link href={`/practice-management/level-wise/${paper.id}/questions`}>
                              <ListChecks className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(paper)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(paper.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Level Wise Practice</DialogTitle>
            <DialogDescription>Update the practice paper details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-exam">Exam *</Label>
                <Select value={formData.examId} onValueChange={(v) => setFormData({ ...formData, examId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-questions">Total Questions</Label>
                <Input
                  id="edit-questions"
                  type="number"
                  min={0}
                  value={formData.totalQuestions}
                  onChange={(e) => {
                    const v = e.target.value
                    const q = parseInt(v, 10) || 0
                    setFormData((prev) => ({
                      ...prev,
                      totalQuestions: v,
                      durationMinutes: String(q * MINUTES_PER_QUESTION),
                      ...(overrideTotalMarks ? {} : { totalMarks: String(q * MARKS_PER_QUESTION) }),
                    }))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (min) — auto</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  readOnly
                  className="bg-muted"
                  value={String((parseInt(formData.totalQuestions, 10) || 0) * MINUTES_PER_QUESTION)}
                />
                <p className="text-[10px] text-muted-foreground">3 min per question</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-marks">Total Marks</Label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={overrideTotalMarks}
                    onChange={(e) => {
                      setOverrideTotalMarks(e.target.checked)
                      if (!e.target.checked) {
                        const q = parseInt(formData.totalQuestions, 10) || 0
                        setFormData((prev) => ({ ...prev, totalMarks: String(q * MARKS_PER_QUESTION) }))
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-input"
                  />
                  Override
                </label>
                <Input
                  id="edit-marks"
                  type="number"
                  min={0}
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  readOnly={!overrideTotalMarks}
                  className={!overrideTotalMarks ? "bg-muted" : ""}
                />
                {!overrideTotalMarks && (
                  <p className="text-[10px] text-muted-foreground">Auto: 4 marks per question</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editSaving}>
              {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
