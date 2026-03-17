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
import { Plus, Pencil, Trash2, Loader2, Search, FilterX, ChevronLeft, ChevronRight, Check, Globe, GlobeLock, Power } from "lucide-react";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/titleCase";

const CONTENT_LEVELS = [
  { value: 1, label: "Level 1 - Exam" },
  { value: 2, label: "Level 2 - Subject" },
  { value: 3, label: "Level 3 - Unit" },
  { value: 4, label: "Level 4 - Chapter" },
  { value: 5, label: "Level 5 - Topic" },
  { value: 6, label: "Level 6 - Subtopic" },
  { value: 7, label: "Level 7 - Definition" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 500, 1000];

interface Deck {
  id: string;
  examId: string;
  examName?: string;
  level: number;
  levelName?: string;
  subjectId?: string;
  subjectName?: string | null;
  unitId?: string;
  unitName?: string | null;
  chapterId?: string;
  chapterName?: string | null;
  topicId?: string;
  topicName?: string | null;
  subtopicId?: string;
  subtopicName?: string | null;
  definitionId?: string;
  definitionName?: string | null;
  title: string;
  slug: string;
  description?: string;
  orderNumber: number;
  status: string;
  cardCount?: number;
  visits?: number;
  today?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
}

interface Exam {
  id: string;
  name: string;
}

interface HierarchyOption {
  id: string;
  name: string;
}

function scopeLabel(deck: Deck): string {
  const level = Math.min(Math.max(deck.level, 1), 7);
  const names = [
    deck.examName,
    deck.subjectName,
    deck.unitName,
    deck.chapterName,
    deck.topicName,
    deck.subtopicName,
    deck.definitionName,
  ];
  const parts = names.slice(0, level).map((n) =>
    n != null && String(n).trim() ? toTitleCase(String(n).trim()) : "—"
  );
  return parts.join(" / ") || "—";
}

export default function PracticeManagementFlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    level: "",
    examId: "",
    subjectId: "",
    unitId: "",
    chapterId: "",
    topicId: "",
    subtopicId: "",
    definitionId: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [metaStatusFilter, setMetaStatusFilter] = useState<"all" | "filled" | "not-filled">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalDecks, setTotalDecks] = useState(0);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
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
    status: "Active",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetDeck, setDeleteTargetDeck] = useState<Deck | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [filterSubjects, setFilterSubjects] = useState<HierarchyOption[]>([]);
  const [filterUnits, setFilterUnits] = useState<HierarchyOption[]>([]);
  const [filterChapters, setFilterChapters] = useState<HierarchyOption[]>([]);
  const [filterTopics, setFilterTopics] = useState<HierarchyOption[]>([]);
  const [filterSubtopics, setFilterSubtopics] = useState<HierarchyOption[]>([]);
  const [filterDefinitions, setFilterDefinitions] = useState<HierarchyOption[]>([]);

  const [formSubjects, setFormSubjects] = useState<HierarchyOption[]>([]);
  const [formUnits, setFormUnits] = useState<HierarchyOption[]>([]);
  const [formChapters, setFormChapters] = useState<HierarchyOption[]>([]);
  const [formTopics, setFormTopics] = useState<HierarchyOption[]>([]);
  const [formSubtopics, setFormSubtopics] = useState<HierarchyOption[]>([]);
  const [formDefinitions, setFormDefinitions] = useState<HierarchyOption[]>([]);

  const decksQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (filter.level) p.set("level", filter.level);
    if (filter.examId) p.set("examId", filter.examId);
    if (filter.subjectId) p.set("subjectId", filter.subjectId);
    if (filter.unitId) p.set("unitId", filter.unitId);
    if (filter.chapterId) p.set("chapterId", filter.chapterId);
    if (filter.topicId) p.set("topicId", filter.topicId);
    if (filter.subtopicId) p.set("subtopicId", filter.subtopicId);
    if (filter.definitionId) p.set("definitionId", filter.definitionId);
    p.set("page", String(currentPage));
    p.set("limit", String(pageSize));
    return p.toString();
  }, [filter.level, filter.examId, filter.subjectId, filter.unitId, filter.chapterId, filter.topicId, filter.subtopicId, filter.definitionId, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.level, filter.examId, filter.subjectId, filter.unitId, filter.chapterId, filter.topicId, filter.subtopicId, filter.definitionId]);

  useEffect(() => {
    fetch("/api/exams?contextapi=1")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }, []);

  // Load filter dropdown options (cascading: exam → subject → unit → chapter → topic → subtopic → definition)
  useEffect(() => {
    if (!filter.examId) {
      setFilterSubjects([]);
      return;
    }
    fetch(`/api/subjects?examId=${filter.examId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterSubjects(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterSubjects([]));
  }, [filter.examId]);
  useEffect(() => {
    if (!filter.subjectId) {
      setFilterUnits([]);
      return;
    }
    fetch(`/api/units?subjectId=${filter.subjectId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterUnits(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterUnits([]));
  }, [filter.subjectId]);
  useEffect(() => {
    if (!filter.unitId) {
      setFilterChapters([]);
      return;
    }
    fetch(`/api/chapters?unitId=${filter.unitId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterChapters(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterChapters([]));
  }, [filter.unitId]);
  useEffect(() => {
    if (!filter.chapterId) {
      setFilterTopics([]);
      return;
    }
    fetch(`/api/topics?chapterId=${filter.chapterId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterTopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterTopics([]));
  }, [filter.chapterId]);
  useEffect(() => {
    if (!filter.topicId) {
      setFilterSubtopics([]);
      return;
    }
    fetch(`/api/subtopics?topicId=${filter.topicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterSubtopics(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterSubtopics([]));
  }, [filter.topicId]);
  useEffect(() => {
    if (!filter.subtopicId) {
      setFilterDefinitions([]);
      return;
    }
    fetch(`/api/definitions?subtopicId=${filter.subtopicId}&contextapi=1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setFilterDefinitions(
          Array.isArray(data) ? data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name ?? "" })) : []
        )
      )
      .catch(() => setFilterDefinitions([]));
  }, [filter.subtopicId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = `/api/level-wise-flashcards${decksQuery ? `?${decksQuery}` : ""}`;
    fetch(url)
      .then((res) => (!cancelled && res.ok ? res.json() : { decks: [], total: 0 }))
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data.decks) ? data.decks : [];
          setDecks(list);
          setTotalDecks(typeof data.total === "number" ? data.total : 0);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to fetch decks");
        if (!cancelled) setDecks([]);
        if (!cancelled) setTotalDecks(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [decksQuery]);

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
      status: "Active",
    });
  }, []);

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
      description: (formData.description ?? "").trim(),
      status: formData.status || "Active",
    };
    if (level >= 2 && formData.subjectId) payload.subjectId = formData.subjectId;
    if (level >= 3 && formData.unitId) payload.unitId = formData.unitId;
    if (level >= 4 && formData.chapterId) payload.chapterId = formData.chapterId;
    if (level >= 5 && formData.topicId) payload.topicId = formData.topicId;
    if (level >= 6 && formData.subtopicId) payload.subtopicId = formData.subtopicId;
    if (level >= 7 && formData.definitionId) payload.definitionId = formData.definitionId;

    setAddSaving(true);
    try {
      const res = await fetch("/api/level-wise-flashcards", {
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
      toast.success("Flashcard deck created");
      const listRes = await fetch(`/api/level-wise-flashcards${decksQuery ? `?${decksQuery}` : ""}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setDecks(Array.isArray(listData.decks) ? listData.decks : []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setAddSaving(false);
    }
  }, [formData, decksQuery, resetForm]);

  const openEdit = useCallback((deck: Deck) => {
    setEditingDeck(deck);
    setFormData({
      examId: deck.examId,
      level: String(deck.level),
      subjectId: deck.subjectId || "",
      unitId: deck.unitId || "",
      chapterId: deck.chapterId || "",
      topicId: deck.topicId || "",
      subtopicId: deck.subtopicId || "",
      definitionId: deck.definitionId || "",
      title: deck.title,
      description: deck.description || "",
      status: deck.status,
    });
    setIsEditOpen(true);
  }, []);

  const handleEdit = useCallback(async () => {
    if (!editingDeck) return;
    const title = toTitleCase((formData.title ?? "").trim());
    if (!title) {
      toast.error("Title is required");
      return;
    }
    const level = parseInt(formData.level, 10) || 1;
    const payload: Record<string, unknown> = {
      title,
      level,
      description: (formData.description ?? "").trim(),
      status: formData.status,
    };
    if (level >= 2 && formData.subjectId) payload.subjectId = formData.subjectId;
    if (level >= 3 && formData.unitId) payload.unitId = formData.unitId;
    if (level >= 4 && formData.chapterId) payload.chapterId = formData.chapterId;
    if (level >= 5 && formData.topicId) payload.topicId = formData.topicId;
    if (level >= 6 && formData.subtopicId) payload.subtopicId = formData.subtopicId;
    if (level >= 7 && formData.definitionId) payload.definitionId = formData.definitionId;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${editingDeck.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      setIsEditOpen(false);
      setEditingDeck(null);
      toast.success("Flashcard deck updated");
      const listRes = await fetch(`/api/level-wise-flashcards${decksQuery ? `?${decksQuery}` : ""}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setDecks(Array.isArray(listData.decks) ? listData.decks : []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }, [editingDeck, formData, decksQuery]);

  const handleDeleteClick = useCallback((deck: Deck) => {
    setDeleteTargetDeck(deck);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleteSaving) {
      setDeleteDialogOpen(false);
      setDeleteTargetDeck(null);
    }
  }, [deleteSaving]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetDeck) return;
    const id = deleteTargetDeck.id;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDecks((prev) => prev.filter((d) => d.id !== id));
      setDeleteDialogOpen(false);
      setDeleteTargetDeck(null);
      toast.success("Flashcard deck deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteTargetDeck]);

  const handleToggleStatus = useCallback(async (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    const nextStatus = deck.status === "Active" ? "Inactive" : "Active";
    setTogglingStatusId(deckId);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setDecks((prev) => prev.map((d) => (d.id === updated.id ? { ...d, status: updated.status } : d)));
      toast.success(`Status set to ${nextStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setTogglingStatusId(null);
    }
  }, [decks]);

  const handlePublish = useCallback(async (deckId: string, noIndex: boolean, noFollow: boolean) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    setPublishingId(deckId);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo: {
            ...deck.seo,
            noIndex,
            noFollow,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update publish state");
      const updated = await res.json();
      setDecks((prev) =>
        prev.map((d) => (d.id === updated.id ? { ...d, seo: updated.seo ?? d.seo } : d))
      );
      toast.success(noIndex && noFollow ? "Unpublished" : "Published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPublishingId(null);
    }
  }, [decks]);

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filter.level ||
        filter.examId ||
        filter.subjectId ||
        filter.unitId ||
        filter.chapterId ||
        filter.topicId ||
        filter.subtopicId ||
        filter.definitionId ||
        searchQuery.trim() ||
        metaStatusFilter !== "all"
      ),
    [filter, searchQuery, metaStatusFilter]
  );

  const clearFilters = useCallback(() => {
    setFilter({
      level: "",
      examId: "",
      subjectId: "",
      unitId: "",
      chapterId: "",
      topicId: "",
      subtopicId: "",
      definitionId: "",
    });
    setSearchQuery("");
    setMetaStatusFilter("all");
  }, []);

  const sortedDecks = useMemo(() => {
    let list = [...decks].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (deck) =>
          (deck.title && deck.title.toLowerCase().includes(q)) ||
          scopeLabel(deck).toLowerCase().includes(q)
      );
    }
    if (metaStatusFilter !== "all") {
      list = list.filter((deck) => {
        const t = deck.seo?.metaTitle?.trim();
        const d = deck.seo?.metaDescription?.trim();
        const k = deck.seo?.metaKeywords?.trim();
        const metaFilled = !!(t && d && k);
        return metaStatusFilter === "filled" ? metaFilled : !metaFilled;
      });
    }
    return list;
  }, [decks, searchQuery, metaStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalDecks / pageSize));
  const startItem = totalDecks === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalDecks);

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
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          <p className="text-sm font-medium">Loading level-wise flashcards…</p>
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
                    <BreadcrumbPage>Level-Wise Flashcards</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Level-Wise Flashcard Deck</DialogTitle>
                  <DialogDescription>
                    Select level and hierarchy (Exam → …) up to that level. Deck will be scoped to the selected path.
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
                      placeholder="Deck title"
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
                  <CardTitle className="text-[13px] font-medium">
                    Total Decks
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {decks.length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All flashcard decks
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Active Decks
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {decks.filter((d) => d.status === "Active").length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Currently active
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Total Visits
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {decks.reduce((sum, d) => sum + (d.visits ?? 0), 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All time visits
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Today&apos;s Visits
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {decks.reduce((sum, d) => sum + (d.today ?? 0), 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Visits today
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">Level-Wise Flashcard Decks</CardTitle>
                    <CardDescription>
                      Manage flashcard decks by exam and hierarchy. Filter by level and scope, or search by title/scope.
                    </CardDescription>
                  </div>
                  {/* Filters: Level, Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition */}
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Level</Label>
                      <Select
                        value={filter.level || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({ ...prev, level: v === "__all__" ? "" : v }))
                        }
                      >
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All levels</SelectItem>
                          {CONTENT_LEVELS.map((l) => (
                            <SelectItem key={l.value} value={String(l.value)}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Exam</Label>
                      <Select
                        value={filter.examId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            examId: v === "__all__" ? "" : v,
                            subjectId: "",
                            unitId: "",
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 w-[160px]">
                          <SelectValue placeholder="All exams" />
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
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <Select
                        value={filter.subjectId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            subjectId: v === "__all__" ? "" : v,
                            unitId: "",
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!filter.examId}
                      >
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {toTitleCase(s.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit</Label>
                      <Select
                        value={filter.unitId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            unitId: v === "__all__" ? "" : v,
                            chapterId: "",
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!filter.subjectId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {toTitleCase(u.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Chapter</Label>
                      <Select
                        value={filter.chapterId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            chapterId: v === "__all__" ? "" : v,
                            topicId: "",
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!filter.unitId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterChapters.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {toTitleCase(c.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Topic</Label>
                      <Select
                        value={filter.topicId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            topicId: v === "__all__" ? "" : v,
                            subtopicId: "",
                            definitionId: "",
                          }))
                        }
                        disabled={!filter.chapterId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterTopics.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {toTitleCase(t.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Subtopic</Label>
                      <Select
                        value={filter.subtopicId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            subtopicId: v === "__all__" ? "" : v,
                            definitionId: "",
                          }))
                        }
                        disabled={!filter.topicId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterSubtopics.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {toTitleCase(s.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Definition</Label>
                      <Select
                        value={filter.definitionId || "__all__"}
                        onValueChange={(v) =>
                          setFilter((prev) => ({ ...prev, definitionId: v === "__all__" ? "" : v }))
                        }
                        disabled={!filter.subtopicId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {filterDefinitions.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {toTitleCase(d.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Meta</Label>
                      <Select
                        value={metaStatusFilter}
                        onValueChange={(v: "all" | "filled" | "not-filled") => setMetaStatusFilter(v)}
                      >
                        <SelectTrigger className="h-9 w-[130px]">
                          <SelectValue placeholder="Meta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="filled">Meta Filled</SelectItem>
                          <SelectItem value="not-filled">Meta Not Filled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Search (title or scope)</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by title or scope…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-9 w-[220px] pl-8"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        title="Clear all filters and search"
                      >
                        <FilterX className="h-4 w-4" />
                        Clear filter
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {sortedDecks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-muted/20 py-16 px-6 text-center">
                    <p className="font-medium text-foreground">No flashcard decks found</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Add a deck or adjust the level/scope filters and search.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetForm();
                        setIsAddOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Deck
                    </Button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[820px]">
                      <TableHeader>
                        <TableRow className="border-b border-border/80 hover:bg-transparent">
                          <TableHead className="w-14 shrink-0 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</TableHead>
                          <TableHead className="min-w-[180px] py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                          <TableHead className="w-24 shrink-0 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level</TableHead>
                          <TableHead className="min-w-[200px] py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope</TableHead>
                          <TableHead className="w-24 shrink-0 py-2 text-xs font-semibold  tracking-wider text-muted-foreground">No. of cards</TableHead>
                          <TableHead className="w-24 shrink-0 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visits</TableHead>
                          <TableHead className="w-16 shrink-0 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta</TableHead>
                          <TableHead className="w-36 shrink-0 text-right py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDecks.map((deck, idx) => (
                          <TableRow key={deck.id} className="transition-colors hover:bg-muted/40">
                            <TableCell className="py-2 font-mono text-sm text-muted-foreground">
                              {deck.orderNumber ?? idx + 1}
                            </TableCell>
                            <TableCell className="py-2">
                              <Link
                                href={`/practice-management/flashcards/${deck.id}/cards`}
                                className="font-medium text-primary hover:underline"
                              >
                                {toTitleCase(deck.title)}
                              </Link>
                            </TableCell>
                            <TableCell className="py-2 text-sm text-muted-foreground">
                              {deck.levelName ?? `Level ${deck.level}`}
                            </TableCell>
                            <TableCell className="py-2 text-sm text-muted-foreground">
                              {scopeLabel(deck)}
                            </TableCell>
                            <TableCell className="py-2 text-sm text-muted-foreground tabular-nums">
                              {deck.cardCount ?? 0}
                            </TableCell>
                            <TableCell className="py-2 text-sm text-muted-foreground tabular-nums">
                              {(deck.visits ?? 0) > 0 || (deck.today ?? 0) > 0 ? (
                                <span title="All time / Today">
                                  {deck.visits ?? 0} <span className="text-muted-foreground/80">/ {deck.today ?? 0}</span>
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-muted-foreground">
                              {(() => {
                                const t = deck.seo?.metaTitle?.trim();
                                const d = deck.seo?.metaDescription?.trim();
                                const k = deck.seo?.metaKeywords?.trim();
                                const metaFilled = !!(t && d && k);
                                return metaFilled ? (
                                  <Check className="h-4 w-4 shrink-0 text-green-500" aria-label="Meta filled" />
                                ) : (
                                  "—"
                                );
                              })()}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title={
                                    deck.seo?.noIndex || deck.seo?.noFollow
                                      ? "Publish (allow index & follow)"
                                      : "Unpublish (no index, no follow)"
                                  }
                                  disabled={publishingId === deck.id}
                                  onClick={() => {
                                    const isPublished = !deck.seo?.noIndex && !deck.seo?.noFollow;
                                    handlePublish(deck.id, isPublished, isPublished);
                                  }}
                                >
                                  {publishingId === deck.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : deck.seo?.noIndex || deck.seo?.noFollow ? (
                                    <GlobeLock className="h-4 w-4" />
                                  ) : (
                                    <Globe className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title={deck.status === "Active" ? "Set Inactive" : "Set Active"}
                                  disabled={togglingStatusId === deck.id}
                                  onClick={() => handleToggleStatus(deck.id)}
                                >
                                  {togglingStatusId === deck.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(deck)} title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(deck)} title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Pagination */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Show</Label>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-9 w-[90px]">
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
                      <span className="text-xs text-muted-foreground">per page</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalDecks === 0
                        ? "0 decks"
                        : `Showing ${startItem}–${endItem} of ${totalDecks}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="min-w-[100px] px-2 text-center text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Level-Wise Flashcard Deck</DialogTitle>
                  <DialogDescription>Update deck and hierarchy scope.</DialogDescription>
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

            {/* Delete confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete flashcard deck</DialogTitle>
                  <DialogDescription>
                    {deleteTargetDeck ? (
                      <>
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">{toTitleCase(deleteTargetDeck.title)}</span>?
                        This will also remove all cards in this deck. This action cannot be undone.
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
          </div>
        </>
      )}
    </div>
  );
}
