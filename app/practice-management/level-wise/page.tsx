"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GripVertical,
  Power,
  Check,
  Clock,
  Award,
  HelpCircle,
  Lock,
  Unlock,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE = "/api/level-wise-practice";

interface PracticePaper {
  id: string;
  examId: string;
  examName: string;
  examSlug: string;
  level: number;
  levelName: string;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
  chapterId?: string;
  chapterName?: string;
  topicId?: string;
  topicName?: string;
  subtopicId?: string;
  subtopicName?: string;
  definitionId?: string;
  definitionName?: string;
  type: "practice" | "full_length" | "previous_paper";
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  orderNumber: number;
  status: "Active" | "Inactive";
  locked: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Exam {
  id: string;
  name: string;
  slug: string;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  examId: string;
}

interface Unit {
  id: string;
  name: string;
  slug: string;
  subjectId: string;
}

interface Chapter {
  id: string;
  name: string;
  slug: string;
  unitId: string;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  chapterId: string;
}

interface Subtopic {
  id: string;
  name: string;
  slug: string;
  topicId: string;
}

const LEVEL_OPTIONS = [
  { value: 1, label: "1 – Exam" },
  { value: 2, label: "2 – Subject" },
  { value: 3, label: "3 – Unit" },
  { value: 4, label: "4 – Chapter" },
  { value: 5, label: "5 – Topic" },
  { value: 6, label: "6 – Subtopic" },
  { value: 7, label: "7 – Definition" },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];

export default function LevelWisePage() {
  const [papers, setPapers] = React.useState<PracticePaper[]>([]);
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [chapters, setChapters] = React.useState<Chapter[]>([]);
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [subtopics, setSubtopics] = React.useState<Subtopic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [examFilter, setExamFilter] = React.useState("all");
  const [levelFilter, setLevelFilter] = React.useState("all");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [paperToDelete, setPaperToDelete] = React.useState<PracticePaper | null>(null);
  const [editingPaper, setEditingPaper] = React.useState<PracticePaper | null>(null);
  const [draggedPaper, setDraggedPaper] = React.useState<PracticePaper | null>(null);
  const [dragOverPaper, setDragOverPaper] = React.useState<PracticePaper | null>(null);
  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    examId: "",
    level: 1,
    subjectId: "",
    unitId: "",
    chapterId: "",
    topicId: "",
    subtopicId: "",
    title: "",
    description: "",
    durationMinutes: 60,
    totalMarks: 100,
    totalQuestions: 30,
    difficulty: "Medium",
    status: "Active",
    locked: false,
  });

  // Fetch practice papers
  const fetchPapers = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(res.statusText || "Failed to fetch");
      const data = await res.json();
      // Handle new paginated response format { papers, total }
      if (data && Array.isArray(data.papers)) {
        setPapers(data.papers);
      } else if (Array.isArray(data)) {
        // Fallback for old format
        setPapers(data);
      } else {
        setPapers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice papers");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exams
  const fetchExams = React.useCallback(async () => {
    try {
      const res = await fetch("/api/exams?contextapi=1");
      if (!res.ok) throw new Error("Failed to fetch exams");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      toast.error("Failed to fetch exams");
    }
  }, []);

  // Fetch subjects when exam changes
  const fetchSubjects = React.useCallback(async (examId: string) => {
    if (!examId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await fetch(`/api/subjects?examId=${examId}&contextapi=1`);
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to fetch subjects");
    }
  }, []);

  // Fetch units when subject changes
  const fetchUnits = React.useCallback(async (subjectId: string) => {
    if (!subjectId) {
      setUnits([]);
      return;
    }
    try {
      const res = await fetch(`/api/units?subjectId=${subjectId}&contextapi=1`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data = await res.json();
      setUnits(data);
    } catch (err) {
      toast.error("Failed to fetch units");
    }
  }, []);

  // Fetch chapters when unit changes
  const fetchChapters = React.useCallback(async (unitId: string) => {
    if (!unitId) {
      setChapters([]);
      return;
    }
    try {
      const res = await fetch(`/api/chapters?unitId=${unitId}&contextapi=1`);
      if (!res.ok) throw new Error("Failed to fetch chapters");
      const data = await res.json();
      setChapters(data);
    } catch (err) {
      toast.error("Failed to fetch chapters");
    }
  }, []);

  // Fetch topics when chapter changes
  const fetchTopics = React.useCallback(async (chapterId: string) => {
    if (!chapterId) {
      setTopics([]);
      return;
    }
    try {
      const res = await fetch(`/api/topics?chapterId=${chapterId}&contextapi=1`);
      if (!res.ok) throw new Error("Failed to fetch topics");
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      toast.error("Failed to fetch topics");
    }
  }, []);

  // Fetch subtopics when topic changes
  const fetchSubtopics = React.useCallback(async (topicId: string) => {
    if (!topicId) {
      setSubtopics([]);
      return;
    }
    try {
      const res = await fetch(`/api/subtopics?topicId=${topicId}&contextapi=1`);
      if (!res.ok) throw new Error("Failed to fetch subtopics");
      const data = await res.json();
      setSubtopics(data);
    } catch (err) {
      toast.error("Failed to fetch subtopics");
    }
  }, []);

  React.useEffect(() => {
    fetchPapers();
    fetchExams();
  }, [fetchPapers, fetchExams]);

  // Reset dependent fields when parent changes
  React.useEffect(() => {
    if (formData.examId) {
      fetchSubjects(formData.examId);
    }
    setFormData((prev) => ({ ...prev, subjectId: "", unitId: "", chapterId: "", topicId: "", subtopicId: "" }));
  }, [formData.examId, fetchSubjects]);

  React.useEffect(() => {
    if (formData.subjectId) {
      fetchUnits(formData.subjectId);
    }
    setFormData((prev) => ({ ...prev, unitId: "", chapterId: "", topicId: "", subtopicId: "" }));
  }, [formData.subjectId, fetchUnits]);

  React.useEffect(() => {
    if (formData.unitId) {
      fetchChapters(formData.unitId);
    }
    setFormData((prev) => ({ ...prev, chapterId: "", topicId: "", subtopicId: "" }));
  }, [formData.unitId, fetchChapters]);

  React.useEffect(() => {
    if (formData.chapterId) {
      fetchTopics(formData.chapterId);
    }
    setFormData((prev) => ({ ...prev, topicId: "", subtopicId: "" }));
  }, [formData.chapterId, fetchTopics]);

  React.useEffect(() => {
    if (formData.topicId) {
      fetchSubtopics(formData.topicId);
    }
    setFormData((prev) => ({ ...prev, subtopicId: "" }));
  }, [formData.topicId, fetchSubtopics]);

  const resetForm = () => {
    setFormData({
      examId: "",
      level: 1,
      subjectId: "",
      unitId: "",
      chapterId: "",
      topicId: "",
      subtopicId: "",
      title: "",
      description: "",
      durationMinutes: 60,
      totalMarks: 100,
      totalQuestions: 30,
      difficulty: "Medium",
      status: "Active",
      locked: false,
    });
    setSubjects([]);
    setUnits([]);
    setChapters([]);
    setTopics([]);
    setSubtopics([]);
  };

  const [addSaving, setAddSaving] = React.useState(false);
  const handleAdd = async () => {
    if (!formData.examId || !formData.title.trim()) {
      toast.error("Exam and Title are required");
      return;
    }

    // Validate required hierarchy fields based on level
    if (formData.level >= 2 && !formData.subjectId) {
      toast.error("Subject is required for this level");
      return;
    }
    if (formData.level >= 3 && !formData.unitId) {
      toast.error("Unit is required for this level");
      return;
    }
    if (formData.level >= 4 && !formData.chapterId) {
      toast.error("Chapter is required for this level");
      return;
    }
    if (formData.level >= 5 && !formData.topicId) {
      toast.error("Topic is required for this level");
      return;
    }
    if (formData.level >= 6 && !formData.subtopicId) {
      toast.error("Subtopic is required for this level");
      return;
    }

    setAddSaving(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || res.statusText;
        throw new Error(msg);
      }

      toast.success("Practice paper created successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchPapers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create practice paper";
      setError(msg);
      toast.error(msg);
    } finally {
      setAddSaving(false);
    }
  };

  const [editSaving, setEditSaving] = React.useState(false);
  const handleEdit = async () => {
    if (!editingPaper) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || res.statusText;
        throw new Error(msg);
      }

      toast.success("Practice paper updated successfully");
      setIsEditDialogOpen(false);
      setEditingPaper(null);
      resetForm();
      fetchPapers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update practice paper";
      setError(msg);
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const [deleteSaving, setDeleteSaving] = React.useState(false);
  const handleDelete = async () => {
    if (!paperToDelete) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${paperToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));

      setPapers((prev) => prev.filter((p) => p.id !== paperToDelete.id));
      toast.success("Practice paper deleted successfully");
      setIsDeleteDialogOpen(false);
      setPaperToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete practice paper";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleToggleStatus = async (paper: PracticePaper) => {
    const nextStatus = paper.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`${API_BASE}/${paper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));

      setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, status: nextStatus } : p)));
      toast.success(`Status set to ${nextStatus}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleToggleLock = async (paper: PracticePaper) => {
    const nextLocked = !paper.locked;
    try {
      const res = await fetch(`${API_BASE}/${paper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: nextLocked }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));

      setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, locked: nextLocked } : p)));
      toast.success(nextLocked ? "Paper locked" : "Paper unlocked");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update lock status";
      setError(msg);
      toast.error(msg);
    }
  };

  const openEditDialog = (paper: PracticePaper) => {
    setEditingPaper(paper);
    setFormData({
      examId: paper.examId,
      level: paper.level,
      subjectId: paper.subjectId || "",
      unitId: paper.unitId || "",
      chapterId: paper.chapterId || "",
      topicId: paper.topicId || "",
      subtopicId: paper.subtopicId || "",
      title: paper.title,
      description: paper.description || "",
      durationMinutes: paper.durationMinutes,
      totalMarks: paper.totalMarks,
      totalQuestions: paper.totalQuestions,
      difficulty: paper.difficulty,
      status: paper.status,
      locked: paper.locked,
    });

    // Fetch dependent data
    if (paper.examId) fetchSubjects(paper.examId);
    if (paper.subjectId) fetchUnits(paper.subjectId);
    if (paper.unitId) fetchChapters(paper.unitId);
    if (paper.chapterId) fetchTopics(paper.chapterId);
    if (paper.topicId) fetchSubtopics(paper.topicId);

    setIsEditDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, paper: PracticePaper) => {
    if (!isReorderingEnabled) {
      e.preventDefault();
      return;
    }
    setDraggedPaper(paper);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (paper: PracticePaper) => {
    if (!isReorderingEnabled) return;
    setDragOverPaper(paper);
  };

  const handleDragLeave = () => {
    setDragOverPaper(null);
  };

  const handleDrop = (e: React.DragEvent, targetPaper: PracticePaper) => {
    e.preventDefault();
    if (!isReorderingEnabled) return;

    if (draggedPaper && draggedPaper.id !== targetPaper.id) {
      const newPapers = [...papers];
      const draggedIndex = newPapers.findIndex((p) => p.id === draggedPaper.id);
      const targetIndex = newPapers.findIndex((p) => p.id === targetPaper.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        newPapers.splice(draggedIndex, 1);
        newPapers.splice(targetIndex, 0, draggedPaper);
        newPapers.forEach((paper, index) => {
          paper.orderNumber = index + 1;
        });
        setPapers(newPapers);
      }
    }

    setDraggedPaper(null);
    setDragOverPaper(null);
  };

  const enableReordering = () => {
    setIsReorderingEnabled(true);
  };

  const disableReordering = () => {
    setIsReorderingEnabled(false);
  };

  const [reorderSaving, setReorderSaving] = React.useState(false);
  const saveReorderedPapers = async () => {
    setReorderSaving(true);
    try {
      const order = papers.map((p, i) => ({ id: p.id, orderNumber: i + 1 }));
      const res = await fetch(`${API_BASE}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: order }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      await fetchPapers();
      setIsReorderingEnabled(false);
      toast.success("Order saved successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save order";
      setError(msg);
      toast.error(msg);
    } finally {
      setReorderSaving(false);
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paper.subjectName && paper.subjectName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || paper.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesExam = examFilter === "all" || paper.examId === examFilter;
    const matchesLevel = levelFilter === "all" || paper.level === parseInt(levelFilter);
    return matchesSearch && matchesStatus && matchesExam && matchesLevel;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, examFilter, levelFilter, pageSize]);

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];
  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedPapers = filteredPapers.slice(startIndex, startIndex + pageSize);

  const getHierarchyLabel = (paper: PracticePaper) => {
    const parts = [paper.examName];
    if (paper.subjectName) parts.push(paper.subjectName);
    if (paper.unitName) parts.push(paper.unitName);
    if (paper.chapterName) parts.push(paper.chapterName);
    if (paper.topicName) parts.push(paper.topicName);
    if (paper.subtopicName) parts.push(paper.subtopicName);
    if (paper.definitionName) parts.push(paper.definitionName);
    return parts.join(" → ");
  };

  const renderForm = (isEdit = false) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Exam Selection */}
      <div className="space-y-2">
        <Label htmlFor="examId">
          Exam <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.examId}
          onValueChange={(value) => setFormData({ ...formData, examId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. What is Living Thing"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Level Selection */}
      <div className="space-y-2">
        <Label htmlFor="level">Level (1–7)</Label>
        <Select
          value={String(formData.level)}
          onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hierarchy Fields - Conditionally shown based on level */}
      {formData.level >= 2 && (
        <div className="space-y-2">
          <Label htmlFor="subjectId">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subjectId}
            onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.level >= 3 && (
        <div className="space-y-2">
          <Label htmlFor="unitId">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.unitId}
            onValueChange={(value) => setFormData({ ...formData, unitId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.level >= 4 && (
        <div className="space-y-2">
          <Label htmlFor="chapterId">
            Chapter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.chapterId}
            onValueChange={(value) => setFormData({ ...formData, chapterId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.level >= 5 && (
        <div className="space-y-2">
          <Label htmlFor="topicId">
            Topic <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.topicId}
            onValueChange={(value) => setFormData({ ...formData, topicId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.level >= 6 && (
        <div className="space-y-2">
          <Label htmlFor="subtopicId">
            Subtopic <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subtopicId}
            onValueChange={(value) => setFormData({ ...formData, subtopicId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subtopic" />
            </SelectTrigger>
            <SelectContent>
              {subtopics.map((subtopic) => (
                <SelectItem key={subtopic.id} value={subtopic.id}>
                  {subtopic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Test Details */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (min)</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={1}
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalMarks">Marks</Label>
          <Input
            id="totalMarks"
            type="number"
            min={1}
            value={formData.totalMarks}
            onChange={(e) =>
              setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalQuestions">Questions</Label>
          <Input
            id="totalQuestions"
            type="number"
            min={1}
            value={formData.totalQuestions}
            onChange={(e) =>
              setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Difficulty & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) =>
              setFormData({ ...formData, difficulty: value as "Easy" | "Medium" | "Hard" | "Mixed" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as "Active" | "Inactive" })
            }
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
      </div>

      {/* Locked Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="locked"
          checked={formData.locked}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setFormData({ ...formData, locked: checked === true })
          }
        />
        <Label htmlFor="locked" className="cursor-pointer">
          Locked (show as &quot;Unlocks later&quot;)
        </Label>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Optional description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {error && (
        <div className="mx-4 mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      {loading && (
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          Loading practice papers…
        </div>
      )}
      {!loading && (
        <>
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/practice-management">
                      Practice Management
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Level Wise</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Practice Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Practice Paper</DialogTitle>
                  <DialogDescription>
                    Create a new level-wise practice test. Level 1–7 = Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition.
                  </DialogDescription>
                </DialogHeader>
                {renderForm()}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => { setIsAddDialogOpen(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={addSaving}>
                    {addSaving ? "Saving…" : "Add Practice Paper"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Total Papers
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {papers.length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All practice papers
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Active Papers
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {papers.filter((p) => p.status === "Active").length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Currently active
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Locked Papers
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {papers.filter((p) => p.locked).length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hidden from users
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Total Questions
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {papers.reduce((sum, p) => sum + p.totalQuestions, 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Across all papers
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">
                      Practice Papers List
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Manage practice papers organized by content hierarchy
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
                          Cancel Reordering
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 px-3"
                          onClick={saveReorderedPapers}
                          disabled={reorderSaving}
                        >
                          {reorderSaving ? "Saving…" : "Save Order"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search papers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={examFilter}
                      onValueChange={setExamFilter}
                    >
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Filter by Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Exams</SelectItem>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={levelFilter}
                      onValueChange={setLevelFilter}
                    >
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {LEVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <Table className="table-fixed min-w-[780px] w-full sm:min-w-[980px]">
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="w-16 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[88px]">
                          Order
                        </TableHead>
                        <TableHead className="min-w-[140px] font-semibold text-xs uppercase tracking-wider sm:min-w-[200px]">
                          Paper Details
                        </TableHead>
                        <TableHead className="min-w-[120px] font-semibold text-xs uppercase tracking-wider sm:min-w-[160px]">
                          Hierarchy
                        </TableHead>
                        <TableHead className="w-20 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[100px]">
                          Level
                        </TableHead>
                        <TableHead className="w-24 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[120px]">
                          Duration
                        </TableHead>
                        <TableHead className="w-20 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[100px]">
                          Questions
                        </TableHead>
                        <TableHead className="w-20 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[100px]">
                          Status
                        </TableHead>
                        <TableHead className="w-[140px] shrink-0 text-right font-semibold text-xs uppercase tracking-wider pr-2 sm:w-[190px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedPapers.map((paper) => (
                        <TableRow
                          key={paper.id}
                          className={`
                          ${paper.status === "Inactive" ? "opacity-60" : ""}
                          ${dragOverPaper?.id === paper.id ? "border-2 border-blue-400 bg-blue-50" : ""}
                          ${isReorderingEnabled ? "cursor-move" : "cursor-default"}
                        `}
                          draggable={isReorderingEnabled}
                          onDragStart={(e) => handleDragStart(e, paper)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(paper)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, paper)}
                        >
                          <TableCell className="py-4 pr-3">
                            <div className="w-8 text-center font-medium">
                              {paper.orderNumber}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 pr-4">
                            <div className="flex flex-col gap-1">
                              <span className={`font-semibold text-base ${paper.status === "Inactive" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {paper.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {paper.examName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-muted-foreground ${paper.status === "Inactive" ? "line-through" : ""}`}
                          >
                            <div className="max-w-[150px] truncate text-sm" title={getHierarchyLabel(paper)}>
                              {getHierarchyLabel(paper)}
                            </div>
                          </TableCell>
                          <TableCell
                            className={paper.status === "Inactive" ? "opacity-60" : ""}
                          >
                            <Badge variant="outline">{paper.levelName}</Badge>
                          </TableCell>
                          <TableCell
                            className={paper.status === "Inactive" ? "opacity-60" : ""}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {paper.durationMinutes} min
                            </div>
                          </TableCell>
                          <TableCell
                            className={paper.status === "Inactive" ? "opacity-60" : ""}
                          >
                            <div className="flex items-center gap-1">
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              {paper.totalQuestions}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={paper.status === "Active" ? "default" : "secondary"}
                                className="cursor-pointer text-xs px-2 py-1 w-fit"
                                onClick={() => handleToggleStatus(paper)}
                              >
                                {paper.status}
                              </Badge>
                              {paper.locked && (
                                <Badge variant="outline" className="w-fit gap-1 text-[10px]">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4 pr-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                title="View Paper"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                onClick={() => openEditDialog(paper)}
                                title="Edit Paper"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 transition-colors ${
                                  paper.locked
                                    ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => handleToggleLock(paper)}
                                title={paper.locked ? "Unlock" : "Lock"}
                              >
                                {paper.locked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setPaperToDelete(paper);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="Delete Paper"
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

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => setPageSize(Number(v))}
                    >
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
                      {filteredPapers.length === 0 ? 0 : startIndex + 1}-
                      {Math.min(startIndex + pageSize, filteredPapers.length)} of{" "}
                      {filteredPapers.length}
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Practice Paper</DialogTitle>
                <DialogDescription>Update the practice paper details.</DialogDescription>
              </DialogHeader>
              {renderForm(true)}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setIsEditDialogOpen(false); setEditingPaper(null); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={editSaving}>
                  {editSaving ? "Saving…" : "Update Practice Paper"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{paperToDelete?.title}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setIsDeleteDialogOpen(false); setPaperToDelete(null); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteSaving}
                >
                  {deleteSaving ? "Deleting…" : "Delete Paper"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
