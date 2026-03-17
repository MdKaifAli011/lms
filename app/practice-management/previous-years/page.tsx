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
  Search,
  Loader2,
  GripVertical,
  Power,
} from "lucide-react"
import { toast } from "sonner"
import { toTitleCase } from "@/lib/titleCase"

interface PreviousYearPaper {
  id: string
  examId: string
  examName?: string
  title: string
  slug: string
  description?: string
  year: number
  session?: string
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

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"]

export default function PreviousYearPapersPage() {
  const [papers, setPapers] = useState<PreviousYearPaper[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [isReorderingEnabled, setIsReorderingEnabled] = useState(false)
  const [reorderSaving, setReorderSaving] = useState(false)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null)
  const [dragOverPaper, setDragOverPaper] = useState<PreviousYearPaper | null>(null)

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState<PreviousYearPaper | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    examId: "",
    title: "",
    description: "",
    year: String(new Date().getFullYear()),
    session: "",
    durationMinutes: "180",
    totalMarks: "300",
    totalQuestions: "90",
    difficulty: "Mixed",
    status: "Active",
    locked: false,
  })

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [papersRes, examsRes] = await Promise.all([
          fetch("/api/previous-year-paper"),
          fetch("/api/exams?contextapi=1"),
        ])
        
        if (!papersRes.ok) throw new Error("Failed to fetch previous year papers")
        if (!examsRes.ok) throw new Error("Failed to fetch exams")
        
        const papersData = await papersRes.json()
        const examsData = await examsRes.json()
        
        setPapers(Array.isArray(papersData) ? papersData : [])
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

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
    return years
  }, [papers])

  // Filter and sort papers
  const filteredPapers = useMemo(() => {
    const list = papers.filter((paper) => {
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.examName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesYear = yearFilter === "all" || paper.year === parseInt(yearFilter)
      return matchesSearch && matchesYear
    })
    return [...list].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
  }, [papers, searchTerm, yearFilter])

  // Stats
  const stats = useMemo(() => ({
    total: papers.length,
    active: papers.filter((p) => p.status === "Active").length,
    inactive: papers.filter((p) => p.status === "Inactive").length,
    locked: papers.filter((p) => p.locked).length,
  }), [papers])

  // Handle add (only required/simple fields; API uses defaults for rest)
  const handleAdd = async () => {
    setAddSaving(true)
    try {
      const res = await fetch("/api/previous-year-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: formData.examId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          year: parseInt(formData.year, 10),
          session: formData.session.trim(),
          status: formData.status,
        }),
      })
      
      if (!res.ok) throw new Error("Failed to create")
      
      const newPaper = await res.json()
      setPapers((prev) => [...prev, newPaper])
      setIsAddOpen(false)
      resetForm()
      toast.success("Previous year paper created successfully")
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
      const res = await fetch(`/api/previous-year-paper/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
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
      toast.success("Previous year paper updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setEditSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this previous year paper?")) return
    try {
      const res = await fetch(`/api/previous-year-paper/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setPapers((prev) => prev.filter((p) => p.id !== id))
      toast.success("Previous year paper deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  // Toggle status (Active/Inactive)
  const handleToggleStatus = async (id: string) => {
    const paper = papers.find((p) => p.id === id)
    if (!paper) return
    const nextStatus = paper.status === "Active" ? "Inactive" : "Active"
    setTogglingStatusId(id)
    try {
      const res = await fetch(`/api/previous-year-paper/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      const updated = await res.json()
      setPapers((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast.success(`Status set to ${nextStatus}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setTogglingStatusId(null)
    }
  }

  // Reorder
  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => setIsReorderingEnabled(false)
  const saveReorderedPapers = async () => {
    setReorderSaving(true)
    try {
      const items = filteredPapers.map((p, i) => ({ id: p.id, orderNumber: i + 1 }))
      const res = await fetch("/api/previous-year-paper/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error("Failed to save order")
      const updated = papers.map((p) => {
        const idx = filteredPapers.findIndex((f) => f.id === p.id)
        return idx >= 0 ? { ...p, orderNumber: idx + 1 } : p
      })
      setPapers(updated)
      setIsReorderingEnabled(false)
      toast.success("Order saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save order")
    } finally {
      setReorderSaving(false)
    }
  }
  const handleDragStart = (e: React.DragEvent, paper: PreviousYearPaper) => {
    e.dataTransfer.setData("text/plain", paper.id)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDragEnter = (paper: PreviousYearPaper) => setDragOverPaper(paper)
  const handleDragLeave = () => setDragOverPaper(null)
  const handleDrop = (e: React.DragEvent, targetPaper: PreviousYearPaper) => {
    e.preventDefault()
    setDragOverPaper(null)
    const sourceId = e.dataTransfer.getData("text/plain")
    if (!sourceId || sourceId === targetPaper.id) return
    const fromIdx = filteredPapers.findIndex((p) => p.id === sourceId)
    const toIdx = filteredPapers.findIndex((p) => p.id === targetPaper.id)
    if (fromIdx < 0 || toIdx < 0) return
    const reordered = [...filteredPapers]
    const [removed] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, removed)
    setPapers((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]))
      reordered.forEach((p, i) => byId.set(p.id, { ...p, orderNumber: i + 1 }))
      return prev.map((p) => byId.get(p.id) ?? p).sort((a, b) => a.orderNumber - b.orderNumber)
    })
  }

  // Open edit dialog
  const openEdit = (paper: PreviousYearPaper) => {
    setEditingPaper(paper)
    setFormData({
      examId: paper.examId,
      title: paper.title,
      description: paper.description || "",
      year: String(paper.year),
      session: paper.session || "",
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
      title: "",
      description: "",
      year: String(new Date().getFullYear()),
      session: "",
      durationMinutes: "180",
      totalMarks: "300",
      totalQuestions: "90",
      difficulty: "Mixed",
      status: "Active",
      locked: false,
    })
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
          Loading previous year papers…
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
                    <BreadcrumbPage>Previous Years</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Paper
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Previous Year Paper</DialogTitle>
                <DialogDescription>
                  Create a new previous year paper
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam *</Label>
                  <Select value={formData.examId} onValueChange={(v) => setFormData({ ...formData, examId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>{toTitleCase(exam.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. JEE Main, NEET, IB, AP – Yearly paper"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session">Session</Label>
                    <Input
                      id="session"
                      value={formData.session}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      placeholder="e.g. Morning, Evening"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">All previous year papers</p>
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
                    <CardTitle>Previous Year Papers</CardTitle>
                    <CardDescription>Manage previous year papers by exam and year. Click a paper title to add questions (JEE, NEET, IB, AP, etc.).</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isReorderingEnabled ? (
                      <Button variant="outline" size="sm" className="h-9 px-3" onClick={enableReordering}>
                        <GripVertical className="mr-2 h-4 w-4" />
                        Enable Reordering
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-9 px-3" onClick={disableReordering}>
                          Cancel Reordering
                        </Button>
                        <Button size="sm" className="h-9 px-3" onClick={saveReorderedPapers} disabled={reorderSaving}>
                          {reorderSaving ? "Saving…" : "Save Order"}
                        </Button>
                      </>
                    )}
                  </div>
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
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Filter by year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <TableHead>Year</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No previous year papers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPapers.map((paper) => (
                    <TableRow
                      key={paper.id}
                      className={isReorderingEnabled ? "cursor-move" : ""}
                      draggable={isReorderingEnabled}
                      onDragStart={(e) => handleDragStart(e, paper)}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(paper)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, paper)}
                    >
                      <TableCell className="w-[50px]">
                        {isReorderingEnabled ? (
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          paper.orderNumber
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/practice-management/previous-years/${paper.id}/questions`}
                          className="text-primary hover:underline"
                        >
                          {toTitleCase(paper.title)}
                        </Link>
                      </TableCell>
                      <TableCell>{toTitleCase(paper.examName ?? "")}</TableCell>
                      <TableCell>{paper.year}</TableCell>
                      <TableCell>{paper.durationMinutes} min</TableCell>
                      <TableCell>{paper.totalQuestions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={paper.status === "Active" ? "Set Inactive" : "Set Active"}
                            disabled={togglingStatusId === paper.id}
                            onClick={() => handleToggleStatus(paper.id)}
                          >
                            {togglingStatusId === paper.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(paper)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(paper.id)} title="Delete">
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Previous Year Paper</DialogTitle>
            <DialogDescription>Update the previous year paper details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year *</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-session">Session</Label>
                <Input
                  id="edit-session"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                />
              </div>
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
