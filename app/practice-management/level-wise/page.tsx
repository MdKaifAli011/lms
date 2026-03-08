"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/titleCase";

const MINUTES_PER_QUESTION = 3;
const MARKS_PER_QUESTION = 4;

/** Seven levels: Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition */
const CONTENT_LEVELS = [
  { value: 1, label: "Level 1 - Exam" },
  { value: 2, label: "Level 2 - Subject" },
  { value: 3, label: "Level 3 - Unit" },
  { value: 4, label: "Level 4 - Chapter" },
  { value: 5, label: "Level 5 - Topic" },
  { value: 6, label: "Level 6 - Subtopic" },
  { value: 7, label: "Level 7 - Definition" },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];

interface LevelWisePractice {
  id: string;
  examId: string;
  examName?: string;
  level: number;
  levelName?: string;
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
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: string;
  orderNumber: number;
  status: string;
  locked: boolean;
}

interface Exam {
  id: string;
  name: string;
}

interface HierarchyOption {
  id: string;
  name: string;
}

export default function LevelWisePracticePage() {
  const [papers, setPapers] = useState<LevelWisePractice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Hierarchy filter: Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition
  const [filter, setFilter] = useState({
    examId: "",
    examName: "",
    subjectId: "",
    subjectName: "",
    unitId: "",
    unitName: "",
    chapterId: "",
    chapterName: "",
    topicId: "",
    topicName: "",
    subtopicId: "",
    subtopicName: "",
    definitionId: "",
    definitionName: "",
  });

  const [subjects, setSubjects] = useState<HierarchyOption[]>([]);
  const [units, setUnits] = useState<HierarchyOption[]>([]);
  const [chapters, setChapters] = useState<HierarchyOption[]>([]);
  const [topics, setTopics] = useState<HierarchyOption[]>([]);
  const [subtopics, setSubtopics] = useState<HierarchyOption[]>([]);
  const [definitions, setDefinitions] = useState<HierarchyOption[]>([]);

  // Form options for Add/Edit dialogs
  const [formSubjects, setFormSubjects] = useState<HierarchyOption[]>([]);
  const [formUnits, setFormUnits] = useState<HierarchyOption[]>([]);
  const [formChapters, setFormChapters] = useState<HierarchyOption[]>([]);
  const [formTopics, setFormTopics] = useState<HierarchyOption[]>([]);
  const [formSubtopics, setFormSubtopics] = useState<HierarchyOption[]>([]);
  const [formDefinitions, setFormDefinitions] = useState<HierarchyOption[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<LevelWisePractice | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetPaper, setDeleteTargetPaper] = useState<LevelWisePractice | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

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
  });
  const [overrideTotalMarks, setOverrideTotalMarks] = useState(false);

  const papersQueryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (filter.examId) p.set("examId", filter.examId);
    if (filter.subjectId) p.set("subjectId", filter.subjectId);
    if (filter.unitId) p.set("unitId", filter.unitId);
    if (filter.chapterId) p.set("chapterId", filter.chapterId);
    if (filter.topicId) p.set("topicId", filter.topicId);
    if (filter.subtopicId) p.set("subtopicId", filter.subtopicId);
    if (filter.definitionId) p.set("definitionId", filter.definitionId);
    return p.toString();
  }, [filter]);

  useEffect(() => {
    fetch("/api/exams?contextapi=1")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/level-wise-practice?${papersQueryParams}`)
      .then((res) => (!cancelled && res.ok ? res.json() : { papers: [] }))
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data.papers) ? data.papers : data.papers ? [data.papers] : [];
          setPapers(list);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to fetch papers");
        if (!cancelled) setPapers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [papersQueryParams]);

  // Load filter options (cascading)
  useEffect(() => {
    if (!filter.examId) {
      setSubjects([]);
      return;
    }
    fetch(`/api/subjects?examId=${filter.examId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setSubjects(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setSubjects([]));
  }, [filter.examId]);

  useEffect(() => {
    if (!filter.subjectId) {
      setUnits([]);
      return;
    }
    fetch(`/api/units?subjectId=${filter.subjectId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setUnits(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setUnits([]));
  }, [filter.subjectId]);

  useEffect(() => {
    if (!filter.unitId) {
      setChapters([]);
      return;
    }
    fetch(`/api/chapters?unitId=${filter.unitId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setChapters(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setChapters([]));
  }, [filter.unitId]);

  useEffect(() => {
    if (!filter.chapterId) {
      setTopics([]);
      return;
    }
    fetch(`/api/topics?chapterId=${filter.chapterId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setTopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setTopics([]));
  }, [filter.chapterId]);

  useEffect(() => {
    if (!filter.topicId) {
      setSubtopics([]);
      return;
    }
    fetch(`/api/subtopics?topicId=${filter.topicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setSubtopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setSubtopics([]));
  }, [filter.topicId]);

  useEffect(() => {
    if (!filter.subtopicId) {
      setDefinitions([]);
      return;
    }
    fetch(`/api/definitions?subtopicId=${filter.subtopicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setDefinitions(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setDefinitions([]));
  }, [filter.subtopicId]);

  const formDialogOpen = isAddOpen || isEditOpen;
  useEffect(() => {
    if (!formDialogOpen || !formData.examId) {
      setFormSubjects([]);
      return;
    }
    fetch(`/api/subjects?examId=${formData.examId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormSubjects(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormSubjects([]));
  }, [formDialogOpen, formData.examId]);
  useEffect(() => {
    if (!formDialogOpen || !formData.subjectId) {
      setFormUnits([]);
      return;
    }
    fetch(`/api/units?subjectId=${formData.subjectId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormUnits(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormUnits([]));
  }, [formDialogOpen, formData.subjectId]);
  useEffect(() => {
    if (!formDialogOpen || !formData.unitId) {
      setFormChapters([]);
      return;
    }
    fetch(`/api/chapters?unitId=${formData.unitId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormChapters(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormChapters([]));
  }, [formDialogOpen, formData.unitId]);
  useEffect(() => {
    if (!formDialogOpen || !formData.chapterId) {
      setFormTopics([]);
      return;
    }
    fetch(`/api/topics?chapterId=${formData.chapterId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormTopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormTopics([]));
  }, [formDialogOpen, formData.chapterId]);
  useEffect(() => {
    if (!formDialogOpen || !formData.topicId) {
      setFormSubtopics([]);
      return;
    }
    fetch(`/api/subtopics?topicId=${formData.topicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormSubtopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormSubtopics([]));
  }, [formDialogOpen, formData.topicId]);
  useEffect(() => {
    if (!formDialogOpen || !formData.subtopicId) {
      setFormDefinitions([]);
      return;
    }
    fetch(`/api/definitions?subtopicId=${formData.subtopicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFormDefinitions(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFormDefinitions([]));
  }, [formDialogOpen, formData.subtopicId]);

  const setFilterAtLevel = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6 | 7, id: string, name: string) => {
    setFilter((prev) => {
      const next = { ...prev };
      if (level >= 1) {
        next.examId = level === 1 ? id : prev.examId;
        next.examName = level === 1 ? name : prev.examName;
      }
      if (level >= 2) {
        next.subjectId = level === 2 ? id : prev.subjectId;
        next.subjectName = level === 2 ? name : prev.subjectName;
      }
      if (level >= 3) {
        next.unitId = level === 3 ? id : prev.unitId;
        next.unitName = level === 3 ? name : prev.unitName;
      }
      if (level >= 4) {
        next.chapterId = level === 4 ? id : prev.chapterId;
        next.chapterName = level === 4 ? name : prev.chapterName;
      }
      if (level >= 5) {
        next.topicId = level === 5 ? id : prev.topicId;
        next.topicName = level === 5 ? name : prev.topicName;
      }
      if (level >= 6) {
        next.subtopicId = level === 6 ? id : prev.subtopicId;
        next.subtopicName = level === 6 ? name : prev.subtopicName;
      }
      if (level >= 7) {
        next.definitionId = level === 7 ? id : prev.definitionId;
        next.definitionName = level === 7 ? name : prev.definitionName;
      }
      if (level < 2) {
        next.subjectId = "";
        next.subjectName = "";
        next.unitId = "";
        next.unitName = "";
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 3) {
        next.unitId = "";
        next.unitName = "";
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 4) {
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 5) {
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 6) {
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 7) {
        next.definitionId = "";
        next.definitionName = "";
      }
      return next;
    });
  }, []);

  const clearFilterFromLevel = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    setFilter((prev) => {
      const next = { ...prev };
      if (level < 2) {
        next.subjectId = "";
        next.subjectName = "";
        next.unitId = "";
        next.unitName = "";
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 3) {
        next.unitId = "";
        next.unitName = "";
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 4) {
        next.chapterId = "";
        next.chapterName = "";
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 5) {
        next.topicId = "";
        next.topicName = "";
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 6) {
        next.subtopicId = "";
        next.subtopicName = "";
        next.definitionId = "";
        next.definitionName = "";
      }
      if (level < 7) {
        next.definitionId = "";
        next.definitionName = "";
      }
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilter({
      examId: "",
      examName: "",
      subjectId: "",
      subjectName: "",
      unitId: "",
      unitName: "",
      chapterId: "",
      chapterName: "",
      topicId: "",
      topicName: "",
      subtopicId: "",
      subtopicName: "",
      definitionId: "",
      definitionName: "",
    });
  }, []);

  const formMaxLevel = parseInt(formData.level, 10) || 1;
  const setLevelAndClearBelow = useCallback((v: string) => {
    const L = parseInt(v, 10) || 1;
    setFormData((prev) => {
      const next = { ...prev, level: v };
      if (L < 2) {
        next.subjectId = "";
        next.unitId = "";
        next.chapterId = "";
        next.topicId = "";
        next.subtopicId = "";
        next.definitionId = "";
      }
      if (L < 3) {
        next.unitId = "";
        next.chapterId = "";
        next.topicId = "";
        next.subtopicId = "";
        next.definitionId = "";
      }
      if (L < 4) {
        next.chapterId = "";
        next.topicId = "";
        next.subtopicId = "";
        next.definitionId = "";
      }
      if (L < 5) {
        next.topicId = "";
        next.subtopicId = "";
        next.definitionId = "";
      }
      if (L < 6) {
        next.subtopicId = "";
        next.definitionId = "";
      }
      if (L < 7) {
        next.definitionId = "";
      }
      return next;
    });
  }, []);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.examName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === "all" || paper.level === parseInt(levelFilter, 10);
      return matchesSearch && matchesLevel;
    });
  }, [papers, searchTerm, levelFilter]);

  const stats = useMemo(
    () => ({
      total: papers.length,
      active: papers.filter((p) => p.status === "Active").length,
      inactive: papers.filter((p) => p.status === "Inactive").length,
      locked: papers.filter((p) => p.locked).length,
    }),
    [papers]
  );

  // resetForm is stable and used after success; no need in deps
  const handleAdd = useCallback(async () => {
    const title = toTitleCase((formData.title ?? "").trim());
    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (!formData.examId) {
      toast.error("Please select an exam");
      return;
    }
    const level = parseInt(formData.level, 10) || 1;
    const payload: Record<string, unknown> = {
      title,
      examId: formData.examId,
      level,
      durationMinutes: parseInt(formData.durationMinutes, 10) || 60,
      totalMarks: parseInt(formData.totalMarks, 10) || 100,
      totalQuestions: parseInt(formData.totalQuestions, 10) || 30,
      difficulty: formData.difficulty || "Medium",
      status: formData.status || "Active",
      locked: formData.locked,
    };
    if (level >= 2 && formData.subjectId) payload.subjectId = formData.subjectId;
    if (level >= 3 && formData.unitId) payload.unitId = formData.unitId;
    if (level >= 4 && formData.chapterId) payload.chapterId = formData.chapterId;
    if (level >= 5 && formData.topicId) payload.topicId = formData.topicId;
    if (level >= 6 && formData.subtopicId) payload.subtopicId = formData.subtopicId;
    if (level >= 7 && formData.definitionId) payload.definitionId = formData.definitionId;

    setAddSaving(true);
    try {
      const res = await fetch("/api/level-wise-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Failed to create");
      }
      setIsAddOpen(false);
      resetForm();
      toast.success("Practice paper created");
      const listRes = await fetch(`/api/level-wise-practice?${papersQueryParams}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const list = Array.isArray(listData.papers) ? listData.papers : [];
        setPapers(list);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setAddSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetForm is stable
  }, [formData, papersQueryParams]);

  const handleEdit = useCallback(async () => {
    if (!editingPaper) return;
    const totalQuestions = parseInt(formData.totalQuestions, 10) || 0;
    const durationMinutes = totalQuestions * MINUTES_PER_QUESTION;
    const totalMarks = overrideTotalMarks
      ? parseInt(formData.totalMarks, 10) || 0
      : totalQuestions * MARKS_PER_QUESTION;
    const title = toTitleCase((formData.title ?? "").trim());
    if (!title) {
      toast.error("Title is required");
      return;
    }
    const level = parseInt(formData.level, 10) || 1;
    const payload: Record<string, unknown> = {
      title,
      level,
      durationMinutes,
      totalMarks,
      totalQuestions,
      description: formData.description,
      difficulty: formData.difficulty,
      status: formData.status,
      locked: formData.locked,
    };
    if (level >= 2 && formData.subjectId) payload.subjectId = formData.subjectId;
    if (level >= 3 && formData.unitId) payload.unitId = formData.unitId;
    if (level >= 4 && formData.chapterId) payload.chapterId = formData.chapterId;
    if (level >= 5 && formData.topicId) payload.topicId = formData.topicId;
    if (level >= 6 && formData.subtopicId) payload.subtopicId = formData.subtopicId;
    if (level >= 7 && formData.definitionId) payload.definitionId = formData.definitionId;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/level-wise-practice/${editingPaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      setIsEditOpen(false);
      setEditingPaper(null);
      toast.success("Practice paper updated");
      const listRes = await fetch(`/api/level-wise-practice?${papersQueryParams}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const list = Array.isArray(listData.papers) ? listData.papers : [];
        setPapers(list);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }, [editingPaper, formData, overrideTotalMarks, papersQueryParams]);

  const handleDelete = useCallback((paper: LevelWisePractice) => {
    setDeleteTargetPaper(paper);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleteSaving) {
      setDeleteDialogOpen(false);
      setDeleteTargetPaper(null);
    }
  }, [deleteSaving]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetPaper) return;
    const id = deleteTargetPaper.id;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/level-wise-practice/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPapers((prev) => prev.filter((p) => p.id !== id));
      setDeleteDialogOpen(false);
      setDeleteTargetPaper(null);
      toast.success("Practice paper deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteTargetPaper]);

  const openEdit = useCallback((paper: LevelWisePractice) => {
    setEditingPaper(paper);
    const q = paper.totalQuestions || 0;
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
    });
    setOverrideTotalMarks(paper.totalMarks !== q * MARKS_PER_QUESTION);
    setIsEditOpen(true);
  }, []);

  const resetForm = useCallback(() => {
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
    });
    setOverrideTotalMarks(false);
  }, []);

  function scopeLabel(paper: LevelWisePractice): string {
    const level = Math.min(Math.max(paper.level, 1), 7);
    const names = [
      paper.examName,
      paper.subjectName,
      paper.unitName,
      paper.chapterName,
      paper.topicName,
      paper.subtopicName,
      paper.definitionName,
    ];
    const parts = names.slice(0, level).map((n) =>
      n != null && String(n).trim() ? toTitleCase(String(n).trim()) : "-"
    );
    const out = parts.join(" › ");
    return out || "-";
  }

  const pathSegments = useMemo(() => {
    const segs: { level: 1 | 2 | 3 | 4 | 5 | 6 | 7; name: string }[] = [];
    if (filter.examName) segs.push({ level: 1, name: filter.examName });
    if (filter.subjectName) segs.push({ level: 2, name: filter.subjectName });
    if (filter.unitName) segs.push({ level: 3, name: filter.unitName });
    if (filter.chapterName) segs.push({ level: 4, name: filter.chapterName });
    if (filter.topicName) segs.push({ level: 5, name: filter.topicName });
    if (filter.subtopicName) segs.push({ level: 6, name: filter.subtopicName });
    if (filter.definitionName) segs.push({ level: 7, name: filter.definitionName });
    return segs;
  }, [filter]);

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {error && (
        <div className="mx-4 mt-2 flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            ×
          </button>
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
              <Separator orientation="vertical" className="mr-2 h-4" />
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
                    <BreadcrumbPage>Level-Wise (Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition)</BreadcrumbPage>
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
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Level Wise Practice</DialogTitle>
                  <DialogDescription>
                    Select level, then choose hierarchy (Exam → …) up to that level. Paper will be scoped to the selected path.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-8 gap-2 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Level *</Label>
                      <Select value={formData.level} onValueChange={setLevelAndClearBelow}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_LEVELS.map((l) => (
                            <SelectItem key={l.value} value={String(l.value)}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Exam *</Label>
                      <Select
                        value={formData.examId}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            examId: v,
                            subjectId: "",
                            unitId: "",
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {toTitleCase(e.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formMaxLevel >= 2 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Subject</Label>
                        <Select
                          value={formData.subjectId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              subjectId: v === "__none__" ? "" : v,
                              unitId: "",
                              chapterId: "",
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            }))
                          }
                          disabled={!formData.examId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formSubjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {toTitleCase(s.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formMaxLevel >= 3 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Unit</Label>
                        <Select
                          value={formData.unitId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              unitId: v === "__none__" ? "" : v,
                              chapterId: "",
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            }))
                          }
                          disabled={!formData.subjectId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formUnits.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {toTitleCase(u.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formMaxLevel >= 4 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Chapter</Label>
                        <Select
                          value={formData.chapterId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              chapterId: v === "__none__" ? "" : v,
                              topicId: "",
                              subtopicId: "",
                              definitionId: "",
                            }))
                          }
                          disabled={!formData.unitId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chapter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formChapters.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {toTitleCase(c.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formMaxLevel >= 5 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Topic</Label>
                        <Select
                          value={formData.topicId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              topicId: v === "__none__" ? "" : v,
                              subtopicId: "",
                              definitionId: "",
                            }))
                          }
                          disabled={!formData.chapterId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formTopics.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {toTitleCase(t.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formMaxLevel >= 6 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Subtopic</Label>
                        <Select
                          value={formData.subtopicId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              subtopicId: v === "__none__" ? "" : v,
                              definitionId: "",
                            }))
                          }
                          disabled={!formData.topicId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Subtopic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formSubtopics.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {toTitleCase(s.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formMaxLevel >= 7 && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-xs">Definition</Label>
                        <Select
                          value={formData.definitionId || "__none__"}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              definitionId: v === "__none__" ? "" : v,
                            }))
                          }
                          disabled={!formData.subtopicId}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Definition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {formDefinitions.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {toTitleCase(d.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Practice title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={addSaving}>
                    {addSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">In current scope</p>
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visible</p>
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">Hidden</p>
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
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle>Level Wise Practice Papers</CardTitle>
                    <CardDescription>
                      Filter by exam → subject → unit → chapter → topic → subtopic → definition. Table shows papers for the selected path.
                    </CardDescription>
                  </div>

                  {/* Breadcrumb path (image-style: pills + arrow + count) */}
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        pathSegments.length === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      All
                    </button>
                    {pathSegments.map((seg, i) => (
                      <React.Fragment key={seg.level}>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => seg.level < 7 && clearFilterFromLevel((seg.level + 1) as 2 | 3 | 4 | 5 | 6 | 7)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            i === 0 ? "bg-primary text-primary-foreground" : "bg-muted/70 text-foreground hover:bg-muted"
                          }`}
                        >
                          {toTitleCase(seg.name)}
                        </button>
                      </React.Fragment>
                    ))}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {papers.length} {papers.length === 1 ? "paper" : "papers"}
                    </span>
                  </div>

                  {/* Cascading filter row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={filter.examId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") clearAllFilters();
                        else {
                          const opt = exams.find((e) => e.id === v);
                          setFilterAtLevel(1, v, opt?.name ?? "");
                        }
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All exams</SelectItem>
                        {exams.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {toTitleCase(e.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.subjectId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(2, "", "");
                        else {
                          const opt = subjects.find((s) => s.id === v);
                          setFilterAtLevel(2, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.examId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All subjects</SelectItem>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {toTitleCase(s.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.unitId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(3, "", "");
                        else {
                          const opt = units.find((u) => u.id === v);
                          setFilterAtLevel(3, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.subjectId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All units</SelectItem>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {toTitleCase(u.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.chapterId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(4, "", "");
                        else {
                          const opt = chapters.find((c) => c.id === v);
                          setFilterAtLevel(4, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.unitId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All chapters</SelectItem>
                        {chapters.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {toTitleCase(c.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.topicId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(5, "", "");
                        else {
                          const opt = topics.find((t) => t.id === v);
                          setFilterAtLevel(5, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.chapterId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All topics</SelectItem>
                        {topics.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {toTitleCase(t.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.subtopicId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(6, "", "");
                        else {
                          const opt = subtopics.find((s) => s.id === v);
                          setFilterAtLevel(6, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.topicId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Subtopic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All subtopics</SelectItem>
                        {subtopics.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {toTitleCase(s.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.definitionId || "__all__"}
                      onValueChange={(v) => {
                        if (v === "__all__") setFilterAtLevel(7, "", "");
                        else {
                          const opt = definitions.find((d) => d.id === v);
                          setFilterAtLevel(7, v, opt?.name ?? "");
                        }
                      }}
                      disabled={!filter.subtopicId}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Definition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All definitions</SelectItem>
                        {definitions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {toTitleCase(d.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by title or exam"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-56 h-9"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        {CONTENT_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={String(l.value)}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">ORDER</TableHead>
                      <TableHead>TITLE</TableHead>
                      <TableHead className="w-24">LEVEL</TableHead>
                      <TableHead className="max-w-[200px]">SCOPE</TableHead>
                      <TableHead className="w-20 text-right">QUESTIONS</TableHead>
                      <TableHead className="w-20 text-right">DURATION</TableHead>
                      <TableHead className="w-20 text-right">MARKS</TableHead>
                      <TableHead className="w-24">DIFFICULTY</TableHead>
                      <TableHead className="w-20">STATUS</TableHead>
                      <TableHead className="w-32 text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                          No papers in this scope. Use filters or Add Practice.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPapers.map((paper) => (
                        <TableRow key={paper.id}>
                          <TableCell className="font-mono text-muted-foreground">{paper.orderNumber != null ? paper.orderNumber : "-"}</TableCell>
                          <TableCell>
                            <Link
                              href={`/practice-management/level-wise/${paper.id}/questions`}
                              className="font-medium text-primary hover:underline"
                            >
                              {toTitleCase(paper.title)}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{paper.levelName != null && paper.levelName !== "" ? paper.levelName : (paper.level != null ? `Level ${paper.level}` : "-")}</TableCell>
                          <TableCell className="text-muted-foreground truncate max-w-[200px]" title={scopeLabel(paper)}>
                            {scopeLabel(paper)}
                          </TableCell>
                          <TableCell className="text-right">{paper.totalQuestions != null ? paper.totalQuestions : "-"}</TableCell>
                          <TableCell className="text-right">{paper.durationMinutes != null ? `${paper.durationMinutes} m` : "-"}</TableCell>
                          <TableCell className="text-right">{paper.totalMarks != null ? paper.totalMarks : "-"}</TableCell>
                          <TableCell>{paper.difficulty != null && paper.difficulty !== "" ? paper.difficulty : "-"}</TableCell>
                          <TableCell>{paper.status != null && paper.status !== "" ? paper.status : "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/practice-management/level-wise/${paper.id}/questions`} title="Questions">
                                  <ListChecks className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(paper)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(paper)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Level Wise Practice</DialogTitle>
                <DialogDescription>Update paper and hierarchy scope.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-8 gap-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label className="text-xs">Level *</Label>
                    <Select value={formData.level} onValueChange={setLevelAndClearBelow}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={String(l.value)}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label className="text-xs">Exam *</Label>
                    <Select
                      value={formData.examId}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          examId: v,
                          subjectId: "",
                          unitId: "",
                          chapterId: "",
                          topicId: "",
                          subtopicId: "",
                          definitionId: "",
                        }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {toTitleCase(e.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formMaxLevel >= 2 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Subject</Label>
                      <Select
                        value={formData.subjectId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            subjectId: v === "__none__" ? "" : v,
                            unitId: "",
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!formData.examId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {toTitleCase(s.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formMaxLevel >= 3 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Unit</Label>
                      <Select
                        value={formData.unitId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            unitId: v === "__none__" ? "" : v,
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!formData.subjectId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {toTitleCase(u.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formMaxLevel >= 4 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Chapter</Label>
                      <Select
                        value={formData.chapterId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            chapterId: v === "__none__" ? "" : v,
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!formData.unitId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formChapters.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {toTitleCase(c.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formMaxLevel >= 5 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Topic</Label>
                      <Select
                        value={formData.topicId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            topicId: v === "__none__" ? "" : v,
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!formData.chapterId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formTopics.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {toTitleCase(t.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formMaxLevel >= 6 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Subtopic</Label>
                      <Select
                        value={formData.subtopicId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            subtopicId: v === "__none__" ? "" : v,
                            definitionId: "",
                          }))
                        }
                        disabled={!formData.topicId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Subtopic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formSubtopics.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {toTitleCase(s.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formMaxLevel >= 7 && (
                    <div className="space-y-2 min-w-0">
                      <Label className="text-xs">Definition</Label>
                      <Select
                        value={formData.definitionId || "__none__"}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            definitionId: v === "__none__" ? "" : v,
                          }))
                        }
                        disabled={!formData.subtopicId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Definition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {formDefinitions.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {toTitleCase(d.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Total Questions</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.totalQuestions}
                      onChange={(e) => {
                        const v = e.target.value;
                        const q = parseInt(v, 10) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          totalQuestions: v,
                          durationMinutes: String(q * MINUTES_PER_QUESTION),
                          ...(overrideTotalMarks ? {} : { totalMarks: String(q * MARKS_PER_QUESTION) }),
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input type="number" readOnly className="bg-muted" value={String((parseInt(formData.totalQuestions, 10) || 0) * MINUTES_PER_QUESTION)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      readOnly={!overrideTotalMarks}
                      className={!overrideTotalMarks ? "bg-muted" : ""}
                    />
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={overrideTotalMarks}
                        onChange={(e) => {
                          setOverrideTotalMarks(e.target.checked);
                          if (!e.target.checked) {
                            const q = parseInt(formData.totalQuestions, 10) || 0;
                            setFormData((prev) => ({ ...prev, totalMarks: String(q * MARKS_PER_QUESTION) }));
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-input"
                      />
                      Override
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={editSaving}>
                  {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete practice paper</DialogTitle>
                <DialogDescription>
                  {deleteTargetPaper ? (
                    <>
                      Are you sure you want to delete{" "}
                      <span className="font-medium text-foreground">{toTitleCase(deleteTargetPaper.title)}</span>?
                      This will also remove all questions in this paper. This action cannot be undone.
                    </>
                  ) : (
                    "This action cannot be undone."
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeDeleteDialog} disabled={deleteSaving}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleteSaving}>
                  {deleteSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
