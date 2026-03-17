"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, GripVertical, Check } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { toTitleCase } from "@/lib/titleCase";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const DEFAULT_SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];

function toDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "text" in value) {
    const t = (value as { text: unknown }).text;
    return typeof t === "string" ? t : String(t);
  }
  return String(value);
}

function normalizeQuestion(raw: Record<string, unknown>): Question {
  const options = Array.isArray(raw.options) ? raw.options.map((o) => toDisplayText(o)) : [];
  return {
    id: String(raw.id ?? ""),
    subject: toDisplayText(raw.subject),
    questionText: toDisplayText(raw.questionText),
    type: raw.type === "NVQ" ? "NVQ" : "MCQ",
    options,
    correctOptionIndex: Number(raw.correctOptionIndex) || 0,
    numericalAnswer: toDisplayText(raw.numericalAnswer),
    numericalTolerance: Number(raw.numericalTolerance) || 0,
    numericalUnit: toDisplayText(raw.numericalUnit),
    marksCorrect: Number(raw.marksCorrect) || 4,
    marksIncorrect: Number(raw.marksIncorrect) ?? 1,
    orderNumber: Number(raw.orderNumber) || 0,
    difficulty: typeof raw.difficulty === "string" ? raw.difficulty : "Medium",
    imageUrl: toDisplayText(raw.imageUrl),
    imageCaption: toDisplayText(raw.imageCaption),
    explanation: toDisplayText(raw.explanation),
    explanationImageUrl: toDisplayText(raw.explanationImageUrl),
  };
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass =
  "min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface PaperInfo {
  id: string;
  title: string;
  examName?: string;
  year?: number;
  session?: string;
}

interface Question {
  id: string;
  subject: string;
  questionText: string;
  type: "MCQ" | "NVQ";
  options: string[];
  correctOptionIndex: number;
  numericalAnswer: string;
  numericalTolerance: number;
  numericalUnit: string;
  marksCorrect: number;
  marksIncorrect: number;
  orderNumber: number;
  difficulty?: string;
  imageUrl?: string;
  imageCaption?: string;
  explanation?: string;
  explanationImageUrl?: string;
}

const emptyForm = (overrides?: { type?: "MCQ" | "NVQ"; subject?: string }) => ({
  subject: overrides?.subject ?? "",
  questionText: "",
  type: (overrides?.type ?? "MCQ") as "MCQ" | "NVQ",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  numericalAnswer: "",
  numericalTolerance: 0,
  numericalUnit: "",
  marksCorrect: 4,
  marksIncorrect: 1,
  orderNumber: 0,
  imageUrl: "",
  imageCaption: "",
  explanation: "",
  explanationImageUrl: "",
  difficulty: "Medium",
});

type FormData = ReturnType<typeof emptyForm>;

export default function PreviousYearPaperQuestionsPage() {
  const params = useParams();
  const paperId = typeof params?.id === "string" ? params.id : "";

  const [paper, setPaper] = useState<PaperInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [activeSection, setActiveSection] = useState<"All" | "MCQ" | "NVQ">("All");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formSlots, setFormSlots] = useState<FormData[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPerPage, setShowPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetBulk, setDeleteTargetBulk] = useState<string[]>([]);

  const fetchPaper = useCallback(async () => {
    if (!paperId) return null;
    const res = await fetch(`/api/previous-year-paper/${paperId}`);
    if (!res.ok) return null;
    return res.json();
  }, [paperId]);

  const fetchQuestions = useCallback(async () => {
    if (!paperId) return [];
    const res = await fetch(`/api/previous-year-paper/${paperId}/questions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, [paperId]);

  useEffect(() => {
    if (!paperId) {
      setError("Invalid paper ID");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [paperData, questionsData] = await Promise.all([
          fetchPaper(),
          fetchQuestions(),
        ]);
        if (cancelled) return;
        setPaper(paperData ?? null);
        const list = Array.isArray(questionsData)
          ? questionsData.map((q) => normalizeQuestion(q as Record<string, unknown>))
          : [];
        setQuestions(list);
        if (!paperData) setError("Paper not found");
        const examId = (paperData as { examId?: string })?.examId;
        if (examId) {
          fetch(`/api/subjects?examId=${encodeURIComponent(examId)}&contextapi=1`)
            .then((r) => (r.ok ? r.json() : []))
            .then((arr) => {
              if (Array.isArray(arr) && arr.length > 0) {
                const names = arr
                  .map((s: { name?: string }) => (s as { name?: string }).name)
                  .filter(Boolean);
                if (names.length > 0) setSubjects(names as string[]);
              }
            })
            .catch(() => {});
        }
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paperId, fetchPaper, fetchQuestions]);

  const openAdd = (section?: "All" | "MCQ" | "NVQ") => {
    const type = section === "All" || !section ? "MCQ" : section;
    const firstSubject = subjects[0] ?? "";
    setFormSlots([emptyForm({ type, subject: firstSubject })]);
    setForm(emptyForm({ type, subject: firstSubject }));
    setEditingId(null);
    if (section && section !== "All") setActiveSection(section);
    setShowInlineForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const openAddMore = () => {
    const last = formSlots[formSlots.length - 1];
    const sectionType = activeSection === "All" ? "MCQ" : activeSection;
    const type = (last?.type ?? sectionType) as "MCQ" | "NVQ";
    const subject = last?.subject ?? subjects[0] ?? "";
    setFormSlots((prev) => [...prev, emptyForm({ type, subject })]);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const updateFormSlot = (slotIndex: number, update: Partial<FormData>) => {
    setFormSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], ...update };
      return next;
    });
  };

  const removeFormSlot = (slotIndex: number) => {
    setFormSlots((prev) => {
      const next = prev.filter((_, j) => j !== slotIndex);
      if (next.length === 0) setTimeout(() => setShowInlineForm(false), 0);
      return next;
    });
  };

  const openEdit = (q: Question) => {
    const options: string[] =
      q.type === "MCQ" && q.options?.length
        ? q.options.length >= 4
          ? q.options.map((o) => toDisplayText(o))
          : [...q.options.map((o) => toDisplayText(o)), ...Array(4 - q.options.length).fill("")].slice(0, 4)
        : ["", "", "", ""];
    setForm({
      subject: q.subject ?? "",
      questionText: toDisplayText(q.questionText),
      type: q.type,
      options,
      correctOptionIndex: q.correctOptionIndex ?? 0,
      numericalAnswer: q.numericalAnswer ?? "",
      numericalTolerance: q.numericalTolerance ?? 0,
      numericalUnit: q.numericalUnit ?? "",
      marksCorrect: q.marksCorrect ?? 4,
      marksIncorrect: q.marksIncorrect ?? 1,
      imageUrl: q.imageUrl ?? "",
      imageCaption: q.imageCaption ?? "",
      explanation: q.explanation ?? "",
      explanationImageUrl: q.explanationImageUrl ?? "",
      difficulty: q.difficulty ?? "Medium",
    });
    setEditingId(q.id);
    setEditDialogOpen(true);
  };

  const closeForm = () => {
    setShowInlineForm(false);
    setFormSlots([]);
    setEditingId(null);
    const type = activeSection === "All" ? "MCQ" : activeSection;
    setForm(emptyForm({ type, subject: subjects[0] ?? "" }));
    setEditDialogOpen(false);
  };

  const updateOption = (index: number, value: string) => {
    const next = [...form.options];
    next[index] = value;
    setForm({ ...form, options: next });
  };

  const addOption = () => {
    setForm({ ...form, options: [...form.options, ""] });
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) return;
    const next = form.options.filter((_, i) => i !== index);
    setForm({
      ...form,
      options: next,
      correctOptionIndex: Math.min(form.correctOptionIndex, Math.max(0, next.length - 1)),
    });
  };

  const buildPayload = (f: FormData) => {
    const questionText = f.questionText.trim();
    const opts = f.type === "MCQ" ? f.options.map((o) => o.trim()).filter(Boolean) : [];
    const correctIndex =
      f.type === "MCQ" ? Math.min(f.correctOptionIndex, Math.max(0, opts.length - 1)) : 0;
    return {
      subject: (f.subject ?? "").trim(),
      questionText,
      type: f.type,
      options: f.type === "MCQ" ? opts : [],
      correctOptionIndex: f.type === "MCQ" ? correctIndex : 0,
      numericalAnswer: f.type === "NVQ" ? f.numericalAnswer : "",
      numericalTolerance: f.type === "NVQ" ? f.numericalTolerance : 0,
      numericalUnit: f.type === "NVQ" ? f.numericalUnit : "",
      marksCorrect: f.marksCorrect,
      marksIncorrect: f.marksIncorrect,
      imageUrl: (f.imageUrl ?? "").trim(),
      imageCaption: (f.imageCaption ?? "").trim(),
      difficulty: ["Easy", "Medium", "Hard"].includes(f.difficulty) ? f.difficulty : "Medium",
      explanation: (f.explanation ?? "").trim(),
      explanationImageUrl: (f.explanationImageUrl ?? "").trim(),
    };
  };

  const saveQuestion = async () => {
    const questionText = form.questionText.trim();
    if (!questionText) {
      toast.error("Question text is required");
      return;
    }
    if (form.type === "MCQ") {
      const opts = form.options.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        toast.error("Add at least 2 options for MCQ");
        return;
      }
    }
    if (form.type === "NVQ" && !form.numericalAnswer.trim()) {
      toast.error("Numerical answer is required for NVQ");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (!editingId) return;
      const res = await fetch(
        `/api/previous-year-paper/${paperId}/questions/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? normalizeQuestion({ ...q, ...updated }) : q))
      );
      toast.success("Question updated");
      closeForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveFormSlot = async (slotIndex: number) => {
    const slotForm = formSlots[slotIndex];
    if (!slotForm) return;
    const questionText = slotForm.questionText.trim();
    if (!questionText) {
      toast.error("Question text is required");
      return;
    }
    if (slotForm.type === "MCQ") {
      const opts = slotForm.options.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        toast.error("Add at least 2 options for MCQ");
        return;
      }
    }
    if (slotForm.type === "NVQ" && !slotForm.numericalAnswer.trim()) {
      toast.error("Numerical answer is required for NVQ");
      return;
    }

    setSavingSlot(slotIndex);
    try {
      const payload = buildPayload(slotForm);
      const res = await fetch(`/api/previous-year-paper/${paperId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      const newList = [...questions, normalizeQuestion(created)].sort(
        (a, b) => a.orderNumber - b.orderNumber
      );
      setQuestions(newList);
      setFormSlots((prev) => {
        const next = prev.filter((_, j) => j !== slotIndex);
        if (next.length === 0) setTimeout(() => setShowInlineForm(false), 0);
        return next;
      });
      toast.success("Question added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingSlot(null);
    }
  };

  const saveAllSlots = async () => {
    const toSave = formSlots
      .map((slot, i) => ({ slot, i }))
      .filter(({ slot }) => slot.questionText.trim());
    if (toSave.length === 0) {
      toast.error("Fill at least one question");
      return;
    }
    for (const { slot } of toSave) {
      if (slot.type === "MCQ") {
        const opts = slot.options.map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) {
          toast.error("Each MCQ needs at least 2 options");
          return;
        }
      }
      if (slot.type === "NVQ" && !slot.numericalAnswer.trim()) {
        toast.error("Each NVQ needs a numerical answer");
        return;
      }
    }
    setSaving(true);
    try {
      let newList = [...questions];
      for (const { slot } of toSave) {
        const payload = buildPayload(slot);
        const res = await fetch(`/api/previous-year-paper/${paperId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        newList = [...newList, normalizeQuestion(created)];
      }
      newList.sort((a, b) => a.orderNumber - b.orderNumber);
      setQuestions(newList);
      setFormSlots([]);
      setShowInlineForm(false);
      toast.success(`${toSave.length} question${toSave.length !== 1 ? "s" : ""} added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteSingle = (id: string) => {
    setDeleteTargetId(id);
    setDeleteTargetBulk([]);
    setDeleteDialogOpen(true);
  };

  const openDeleteBulk = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleteTargetId(null);
    setDeleteTargetBulk(ids);
    setDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    const ids = deleteTargetId ? [deleteTargetId] : deleteTargetBulk;
    if (ids.length === 0) {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetBulk([]);
      return;
    }
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/previous-year-paper/${paperId}/questions/${id}`, {
            method: "DELETE",
          })
        )
      );
      setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(
        ids.length === 1 ? "Question deleted" : `${ids.length} questions deleted`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetBulk([]);
    }
  };

  const toggleSelectAll = () => {
    const paginated = displayedQuestions;
    const allSelected = paginated.every((q) => selectedIds.has(q.id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((q) => next.add(q.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (_e: React.DragEvent, q: Question) => {
    setDraggedQuestion(q);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDragOverQuestionId(null);
  };

  const handleDrop = (e: React.DragEvent, target: Question) => {
    e.preventDefault();
    setDragOverQuestionId(null);
    setDraggedQuestion(null);
    if (!isReorderMode || !draggedQuestion || draggedQuestion.id === target.id) return;
    const sorted = [...questions].sort((a, b) => a.orderNumber - b.orderNumber);
    const fromIdx = sorted.findIndex((q) => q.id === draggedQuestion.id);
    const toIdx = sorted.findIndex((q) => q.id === target.id);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = sorted.slice();
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    setQuestions(reordered.map((q, i) => ({ ...q, orderNumber: i + 1 })));
  };

  const saveOrderToServer = async () => {
    const sorted = [...questions].sort((a, b) => a.orderNumber - b.orderNumber);
    const order = sorted.map((q, i) => ({ id: q.id, orderNumber: i + 1 }));
    setSavingOrder(true);
    try {
      const res = await fetch(`/api/previous-year-paper/${paperId}/questions/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      toast.success("Order saved");
      setIsReorderMode(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.orderNumber - b.orderNumber),
    [questions]
  );
  const sectionQuestions = useMemo(() => {
    let list =
      activeSection === "All"
        ? sortedQuestions
        : sortedQuestions.filter((q) => q.type === activeSection);
    if (subjectFilter) {
      list = list.filter(
        (q) =>
          (q.subject ?? "").trim().toLowerCase() === subjectFilter.trim().toLowerCase()
      );
    }
    return list;
  }, [sortedQuestions, activeSection, subjectFilter]);
  const totalPages = Math.max(1, Math.ceil(sectionQuestions.length / showPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const displayedQuestions = useMemo(
    () => sectionQuestions.slice((safePage - 1) * showPerPage, safePage * showPerPage),
    [sectionQuestions, safePage, showPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length, showPerPage, activeSection, subjectFilter]);

  const renderFormDialog = (title: string, open: boolean, onOpenChange: (open: boolean) => void) => (
    <Dialog open={open} onOpenChange={(o) => !o && (closeForm(), onOpenChange(false))}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-8">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground shrink-0">Subject</Label>
              <Select
                value={form.subject || subjects[0]}
                onValueChange={(v) => setForm({ ...form, subject: v })}
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((name) => (
                    <SelectItem key={name} value={name}>
                      {toTitleCase(name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground shrink-0">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: "MCQ" | "NVQ") => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ</SelectItem>
                  <SelectItem value="NVQ">NVQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground shrink-0">Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v: string) => setForm({ ...form, difficulty: v })}
              >
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground shrink-0">Marks (✓)</Label>
              <Input
                type="number"
                min={0}
                className="h-9 w-16"
                value={form.marksCorrect}
                onChange={(e) =>
                  setForm({ ...form, marksCorrect: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground shrink-0">Marks (✗)</Label>
              <Input
                type="number"
                min={0}
                className="h-9 w-16"
                value={form.marksIncorrect}
                onChange={(e) =>
                  setForm({ ...form, marksIncorrect: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Question text *</Label>
            <textarea
              className={textareaClass}
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              placeholder="Enter the question..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Question image (optional)</Label>
            <Input
              className={inputClass}
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="Image URL (e.g. https://...)"
            />
            <Input
              className={inputClass}
              value={form.imageCaption ?? ""}
              onChange={(e) => setForm({ ...form, imageCaption: e.target.value })}
              placeholder="Image caption (optional)"
            />
          </div>
          {form.type === "MCQ" && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="grid grid-cols-2 gap-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {OPTION_LETTERS[i] ?? i + 1}
                    </span>
                    <Input
                      className={inputClass}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${OPTION_LETTERS[i] ?? i + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeOption(i)}
                      disabled={form.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                Add option
              </Button>
              <div className="space-y-1">
                <Label>Correct option</Label>
                <Select
                  value={String(Math.min(form.correctOptionIndex, form.options.length - 1))}
                  onValueChange={(v) => setForm({ ...form, correctOptionIndex: parseInt(v, 10) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {form.options.map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        Option {OPTION_LETTERS[i] ?? i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {form.type === "NVQ" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Numerical answer</Label>
                <Input
                  value={form.numericalAnswer}
                  onChange={(e) => setForm({ ...form, numericalAnswer: e.target.value })}
                  placeholder="e.g. 42 or 3.14"
                />
              </div>
              <div className="space-y-2">
                <Label>Tolerance</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.numericalTolerance}
                  onChange={(e) =>
                    setForm({ ...form, numericalTolerance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unit (optional)</Label>
                <Input
                  value={form.numericalUnit}
                  onChange={(e) => setForm({ ...form, numericalUnit: e.target.value })}
                  placeholder="e.g. m/s"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Explanation (optional)</Label>
            <textarea
              className={textareaClass}
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              placeholder="Why this answer is correct..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeForm}>
            Cancel
          </Button>
          <Button onClick={saveQuestion} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-destructive">{error ?? "Paper not found"}</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/practice-management/previous-years">Back to Previous Year Papers</Link>
        </Button>
      </div>
    );
  }

  const paperTitle = toTitleCase(paper.title);

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(o) =>
          !o &&
          (setDeleteDialogOpen(false), setDeleteTargetId(null), setDeleteTargetBulk([]))
        }
      >
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {deleteTargetId ? "Delete question?" : `Delete ${deleteTargetBulk.length} questions?`}
            </DialogTitle>
            <DialogDescription>
              {deleteTargetId
                ? "This question will be removed from the paper. You can add it again later if needed."
                : "Selected questions will be removed from the paper."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
                setDeleteTargetBulk([]);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderFormDialog("Edit Question", editDialogOpen, setEditDialogOpen)}

      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/practice-management">Practice Management</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/practice-management/previous-years">Previous Year Papers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{paperTitle} — Questions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="ghost" size="icon" asChild title="Back to Previous Year Papers">
          <Link href="/practice-management/previous-years">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4 overflow-auto min-h-0">
        <Card>
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-base">{paperTitle}</CardTitle>
            <CardDescription className="text-sm">
              {paper.examName && `${toTitleCase(paper.examName)} · `}
              {paper.year && `Year ${paper.year}`}
              {paper.session && ` · ${toTitleCase(paper.session)}`}
              {" · "}
              <span className="font-medium text-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-0">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <nav
                  aria-label="Section"
                  className="flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection("All")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeSection === "All"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("MCQ")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeSection === "MCQ"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Section A (MCQs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("NVQ")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeSection === "NVQ"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Section B (NVQ)
                  </button>
                </nav>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground shrink-0">Subject:</Label>
                  <Select
                    value={subjectFilter || "all"}
                    onValueChange={(v) => setSubjectFilter(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 w-[140px]">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {subjects.map((name) => (
                        <SelectItem key={name} value={name}>
                          {toTitleCase(name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="text-base font-semibold">
                  {activeSection === "All"
                    ? `Questions (${sectionQuestions.length})`
                    : `Questions (${sectionQuestions.length} in section)`}
                </h3>
                {questions.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={
                        displayedQuestions.length > 0 &&
                        displayedQuestions.every((q) => selectedIds.has(q.id))
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-input"
                    />
                    Select All
                  </label>
                )}
                {selectedIds.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={openDeleteBulk}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete selected ({selectedIds.size})
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  Show:
                  <Select
                    value={String(showPerPage)}
                    onValueChange={(v) => {
                      setShowPerPage(parseInt(v, 10));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                {sectionQuestions.length > showPerPage && (
                  <span className="text-sm text-muted-foreground">
                    {(safePage - 1) * showPerPage + 1}–
                    {Math.min(safePage * showPerPage, sectionQuestions.length)} of{" "}
                    {sectionQuestions.length}
                  </span>
                )}
                {questions.length > 0 && (
                  <>
                    {!isReorderMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReorderMode(true)}
                        title="Enable drag-and-drop to reorder"
                      >
                        <GripVertical className="mr-1.5 h-4 w-4" />
                        Enable reorder
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={saveOrderToServer}
                          disabled={savingOrder}
                        >
                          {savingOrder && (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          )}
                          Save order
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsReorderMode(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
                <Button onClick={() => openAdd(activeSection)} size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  {activeSection === "All"
                    ? "Add question"
                    : `Add ${activeSection} question`}
                </Button>
              </div>
            </div>

            {formSlots.length > 0 && (
              <div ref={formRef} className="space-y-3 rounded-lg border-2 border-primary/20 bg-muted/10 p-4">
                {formSlots.map((slotForm, slotIndex) => (
                  <Card key={`slot-${slotIndex}`} className="border border-border">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 pb-1.5 pt-3 px-4">
                      <CardTitle className="text-base">
                        New Question{" "}
                        {formSlots.length > 1
                          ? `(${slotIndex + 1} of ${formSlots.length})`
                          : ""}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-xs text-muted-foreground shrink-0">
                          Subject
                        </Label>
                        <Select
                          value={slotForm.subject || subjects[0]}
                          onValueChange={(v) => updateFormSlot(slotIndex, { subject: v })}
                        >
                          <SelectTrigger className="w-32 h-9">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((name) => (
                              <SelectItem key={name} value={name}>
                                {toTitleCase(name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Label className="text-xs text-muted-foreground shrink-0">Type</Label>
                        <Select
                          value={slotForm.type}
                          onValueChange={(v: "MCQ" | "NVQ") =>
                            updateFormSlot(slotIndex, { type: v })
                          }
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            <SelectItem value="NVQ">NVQ</SelectItem>
                          </SelectContent>
                        </Select>
                        <Label className="text-xs text-muted-foreground shrink-0">
                          Difficulty
                        </Label>
                        <Select
                          value={slotForm.difficulty}
                          onValueChange={(v: string) =>
                            updateFormSlot(slotIndex, { difficulty: v })
                          }
                        >
                          <SelectTrigger className="w-28 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Label className="text-xs text-muted-foreground shrink-0">Marks (✓)</Label>
                        <Input
                          type="number"
                          min={0}
                          className="h-9 w-16"
                          value={slotForm.marksCorrect}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, {
                              marksCorrect: parseInt(e.target.value, 10) || 0,
                            })
                          }
                        />
                        <Label className="text-xs text-muted-foreground shrink-0">Marks (✗)</Label>
                        <Input
                          type="number"
                          min={0}
                          className="h-9 w-16"
                          value={slotForm.marksIncorrect}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, {
                              marksIncorrect: parseInt(e.target.value, 10) || 0,
                            })
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 pb-4 pt-0">
                      <div className="space-y-2">
                        <Label>Question text *</Label>
                        <textarea
                          className={textareaClass}
                          value={slotForm.questionText}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, { questionText: e.target.value })
                          }
                          placeholder="Enter the question..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          Question image (optional)
                        </Label>
                        <Input
                          className={inputClass}
                          value={slotForm.imageUrl ?? ""}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, { imageUrl: e.target.value })
                          }
                          placeholder="Image URL (e.g. https://...)"
                        />
                        <Input
                          className={inputClass}
                          value={slotForm.imageCaption ?? ""}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, { imageCaption: e.target.value })
                          }
                          placeholder="Image caption (optional)"
                        />
                        {slotForm.imageUrl?.trim() && (
                          <div className="rounded-lg border border-border overflow-hidden max-w-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slotForm.imageUrl.trim()}
                              alt={slotForm.imageCaption?.trim() || "Question"}
                              className="w-full h-auto object-contain max-h-48 bg-muted"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {slotForm.type === "MCQ" && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {slotForm.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                  {OPTION_LETTERS[i] ?? i + 1}
                                </span>
                                <Input
                                  className={inputClass}
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...slotForm.options];
                                    next[i] = e.target.value;
                                    updateFormSlot(slotIndex, { options: next });
                                  }}
                                  placeholder={`Option ${OPTION_LETTERS[i] ?? i + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => {
                                    if (slotForm.options.length <= 2) return;
                                    const next = slotForm.options.filter((_, j) => j !== i);
                                    updateFormSlot(slotIndex, {
                                      options: next,
                                      correctOptionIndex: Math.min(
                                        slotForm.correctOptionIndex,
                                        Math.max(0, next.length - 1)
                                      ),
                                    });
                                  }}
                                  disabled={slotForm.options.length <= 2}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateFormSlot(slotIndex, {
                                options: [...slotForm.options, ""],
                              })
                            }
                          >
                            Add option
                          </Button>
                          <div className="space-y-1">
                            <Label>Correct option</Label>
                            <Select
                              value={String(
                                Math.min(slotForm.correctOptionIndex, slotForm.options.length - 1)
                              )}
                              onValueChange={(v) =>
                                updateFormSlot(slotIndex, {
                                  correctOptionIndex: parseInt(v, 10),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {slotForm.options.map((_, i) => (
                                  <SelectItem key={i} value={String(i)}>
                                    Option {OPTION_LETTERS[i] ?? i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      {slotForm.type === "NVQ" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Numerical answer</Label>
                            <Input
                              value={slotForm.numericalAnswer}
                              onChange={(e) =>
                                updateFormSlot(slotIndex, { numericalAnswer: e.target.value })
                              }
                              placeholder="e.g. 42 or 3.14"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tolerance</Label>
                            <Input
                              type="number"
                              step="any"
                              value={slotForm.numericalTolerance}
                              onChange={(e) =>
                                updateFormSlot(slotIndex, {
                                  numericalTolerance: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit (optional)</Label>
                            <Input
                              value={slotForm.numericalUnit}
                              onChange={(e) =>
                                updateFormSlot(slotIndex, { numericalUnit: e.target.value })
                              }
                              placeholder="e.g. m/s"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Explanation (optional)</Label>
                        <textarea
                          className={textareaClass}
                          value={slotForm.explanation}
                          onChange={(e) =>
                            updateFormSlot(slotIndex, { explanation: e.target.value })
                          }
                          placeholder="Why this answer is correct..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => removeFormSlot(slotIndex)}>
                          Remove
                        </Button>
                        <Button
                          onClick={() => saveFormSlot(slotIndex)}
                          disabled={savingSlot !== null}
                        >
                          {savingSlot === slotIndex && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save this question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                  <Button onClick={openAddMore} variant="outline" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add more question
                  </Button>
                  <Button onClick={saveAllSlots} disabled={saving} size="sm">
                    {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Save all ({formSlots.filter((s) => s.questionText.trim()).length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormSlots([]);
                      setShowInlineForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {displayedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-muted/10 py-16 px-6 text-center">
                  {questions.length === 0 ? (
                    <>
                      <p className="font-medium text-foreground">No questions in this paper yet</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Use Section A (MCQs) or Section B (NVQ) above, select subject, and add
                        questions. You can add one at a time or multiple in one go.
                      </p>
                      <Button onClick={() => openAdd(activeSection)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add first{" "}
                        {activeSection === "All" ? "question" : `${activeSection} question`}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">
                        No {activeSection === "MCQ" ? "MCQ" : "NVQ"} questions in this section
                      </p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Switch to the other section above or add a new{" "}
                        {activeSection === "MCQ" ? "MCQ" : "NVQ"} question here.
                      </p>
                      <Button onClick={() => openAdd(activeSection)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add {activeSection} question
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                displayedQuestions.map((q) => (
                  <Card
                    key={q.id}
                    draggable={isReorderMode}
                    onDragStart={isReorderMode ? (e) => handleDragStart(e, q) : undefined}
                    onDragOver={handleDragOver}
                    onDragEnter={isReorderMode ? () => setDragOverQuestionId(q.id) : undefined}
                    onDragLeave={handleDragLeave}
                    onDrop={isReorderMode ? (e) => handleDrop(e, q) : undefined}
                    className={`overflow-hidden transition-colors ${
                      isReorderMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                    } ${dragOverQuestionId === q.id ? "border-2 border-primary/40 bg-primary/5" : "border-border"} ${
                      draggedQuestion?.id === q.id ? "opacity-50" : ""
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="flex shrink-0 items-start gap-2 pt-0.5">
                          {isReorderMode ? (
                            <div
                              className="flex cursor-grab touch-none flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                          ) : (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                              {q.orderNumber}
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={selectedIds.has(q.id)}
                            onChange={() => toggleSelectOne(q.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 rounded border-input"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1 space-y-2">
                              <p className="font-medium text-foreground">
                                {toDisplayText(q.questionText)}
                              </p>
                              {(q.imageUrl ?? "").trim() ? (
                                <div className="rounded-lg border border-border overflow-hidden max-w-md bg-muted/30">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={(q.imageUrl ?? "").trim()}
                                    alt={(q.imageCaption ?? "").trim() || "Question"}
                                    className="w-full h-auto object-contain max-h-64"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {q.subject ? (
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {toTitleCase(q.subject)}
                                </span>
                              ) : null}
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                {q.type}
                              </span>
                              {q.difficulty && (
                                <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-foreground">
                                  {q.difficulty}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-400">
                                +{q.marksCorrect ?? 4}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/50 dark:text-red-400">
                                −{q.marksIncorrect ?? 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(q)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => openDeleteSingle(q.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {q.type === "MCQ" && q.options?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, i) => {
                                const isCorrect = i === (q.correctOptionIndex ?? 0);
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 rounded-md border p-2 ${
                                      isCorrect
                                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40"
                                        : "border-border bg-muted/30"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                        isCorrect
                                          ? "bg-green-500 text-white"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {OPTION_LETTERS[i] ?? i + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 text-sm">
                                      {toDisplayText(opt)}
                                    </span>
                                    {isCorrect && (
                                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {q.type === "NVQ" && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Answer:</span>
                              <span className="font-medium">
                                {toDisplayText(q.numericalAnswer) || "—"}
                              </span>
                              {toDisplayText(q.numericalUnit) && (
                                <span className="text-muted-foreground">
                                  {toDisplayText(q.numericalUnit)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
              <Button onClick={() => openAdd(activeSection)} variant="outline" size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                {activeSection === "All"
                  ? "Add question"
                  : `Add ${activeSection} question`}
              </Button>
            </div>

            {sectionQuestions.length > showPerPage && (
              <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border/60 pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {safePage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
