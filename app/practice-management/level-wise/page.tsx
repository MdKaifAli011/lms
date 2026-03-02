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
} from "lucide-react"
import { toast } from "sonner"

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
      const res = await fetch("/api/level-wise-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          level: parseInt(formData.level),
          durationMinutes: parseInt(formData.durationMinutes),
          totalMarks: parseInt(formData.totalMarks),
          totalQuestions: parseInt(formData.totalQuestions),
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
      const res = await fetch(`/api/level-wise-practice/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          level: parseInt(formData.level),
          durationMinutes: parseInt(formData.durationMinutes),
          totalMarks: parseInt(formData.totalMarks),
          totalQuestions: parseInt(formData.totalQuestions),
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
      durationMinutes: String(paper.durationMinutes),
      totalMarks: String(paper.totalMarks),
      totalQuestions: String(paper.totalQuestions),
      difficulty: paper.difficulty,
      status: paper.status,
      locked: paper.locked,
    })
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
      durationMinutes: "60",
      totalMarks: "100",
      totalQuestions: "30",
      difficulty: "Medium",
      status: "Active",
      locked: false,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Practice Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Level Wise</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.locked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Level Wise Practice Papers</CardTitle>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marks">Total Marks</Label>
                    <Input
                      id="marks"
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="questions">Total Questions</Label>
                    <Input
                      id="questions"
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                    />
                  </div>
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
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
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

          {/* Table */}
          <div className="rounded-md border">
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
                      <TableCell className="font-medium">{paper.title}</TableCell>
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
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-marks">Total Marks</Label>
                <Input
                  id="edit-marks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-questions">Total Questions</Label>
                <Input
                  id="edit-questions"
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                />
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
