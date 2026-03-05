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
  ListChecks,
} from "lucide-react"
import { toast } from "sonner"

interface FullLengthMock {
  id: string
  examId: string
  examName?: string
  title: string
  slug: string
  description?: string
  mockId?: string
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

export default function FullLengthMockPage() {
  const [papers, setPapers] = useState<FullLengthMock[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState<FullLengthMock | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  
  // Form state
  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState({
    examId: "",
    title: "",
    description: "",
    mockYear: String(currentYear),
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
          fetch("/api/full-length-mock"),
          fetch("/api/exams?contextapi=1"),
        ])
        
        if (!papersRes.ok) throw new Error("Failed to fetch mock tests")
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

  // Filter papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      return paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.examName?.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [papers, searchTerm])

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
      const res = await fetch("/api/full-length-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mockYear: formData.mockYear ? parseInt(formData.mockYear, 10) : new Date().getFullYear(),
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
      toast.success("Mock test created successfully")
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
      const res = await fetch(`/api/full-length-mock/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
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
      toast.success("Mock test updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setEditSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mock test?")) return
    try {
      const res = await fetch(`/api/full-length-mock/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setPapers((prev) => prev.filter((p) => p.id !== id))
      toast.success("Mock test deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  // Open edit dialog
  const openEdit = (paper: FullLengthMock) => {
    setEditingPaper(paper)
    const mockYearFromId = paper.mockId?.match(/^MOCK-(\d{4})-/)?.[1] ?? ""
    setFormData({
      examId: paper.examId,
      title: paper.title,
      description: paper.description || "",
      mockYear: mockYearFromId,
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
      mockYear: String(new Date().getFullYear()),
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
          Loading full-length mocks…
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
                    <BreadcrumbPage>Full-Length Mocks</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mock
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Full Length Mock Test</DialogTitle>
                <DialogDescription>
                  Create a new full-length mock test
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
                        <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
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
                    placeholder="Enter mock test title"
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
                    <Label htmlFor="mockYear">Year for Mock ID</Label>
                    <Input
                      id="mockYear"
                      type="number"
                      min={2000}
                      max={2100}
                      value={formData.mockYear}
                      onChange={(e) => setFormData({ ...formData, mockYear: e.target.value })}
                      placeholder="e.g. 2024"
                    />
                    <p className="text-[11px] text-muted-foreground">Generates MOCK-2024-001, MOCK-2024-002, …</p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.locked}
                        onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm font-medium">Locked</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">Show as &quot;Coming Soon&quot; on public page</p>
                  </div>
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
          </header>

          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Mocks</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">{stats.total}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All full-length mocks</p>
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
                    <CardTitle>Full Length Mock Tests</CardTitle>
                    <CardDescription>Manage full-length mock tests by exam.</CardDescription>
                  </div>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search mock tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden">
                <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Mock ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Locked</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No mock tests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell>{paper.orderNumber}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{paper.mockId || "—"}</TableCell>
                      <TableCell className="font-medium">{paper.title}</TableCell>
                      <TableCell>{paper.examName}</TableCell>
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
                        {paper.locked ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Locked</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(paper)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Manage subjects, sections & questions">
                            <Link href={`/practice-management/full-length/${paper.id}/questions`}>
                              <ListChecks className="h-4 w-4" />
                            </Link>
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
            <DialogTitle>Edit Full Length Mock Test</DialogTitle>
            <DialogDescription>Update the mock test details</DialogDescription>
          </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Mock ID</Label>
              <Input value={editingPaper?.mockId ?? "—"} readOnly className="bg-muted/50" />
            </div>
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.locked}
                  onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm font-medium">Locked</span>
              </label>
              <p className="text-[11px] text-muted-foreground">Show as &quot;Coming Soon&quot; on public page</p>
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
