"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Filter, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

/** Auto: duration = questions × 3 min, total marks = questions × 4. */
const MINUTES_PER_QUESTION = 3;
const MARKS_PER_QUESTION = 4;

const OPTION_LETTERS = ["A", "B", "C", "D"];

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass =
  "min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface PracticePaper {
  id: string;
  title: string;
  slug: string;
  levelName?: string;
  totalQuestions: number;
  durationMinutes?: number;
  totalMarks?: number;
  difficulty?: string;
}

interface Question {
  id: string;
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
  explanation?: string;
  explanationImageUrl?: string;
}

const emptyQuestionForm = () => ({
  questionText: "",
  type: "MCQ" as "MCQ" | "NVQ",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  numericalAnswer: "",
  numericalTolerance: 0,
  numericalUnit: "",
  marksCorrect: 4,
  marksIncorrect: 1,
  orderNumber: 0,
  explanation: "",
  explanationImageUrl: "",
});

type FormData = ReturnType<typeof emptyQuestionForm>;

export default function LevelWiseQuestionsPage() {
  const params = useParams();
  const practiceId = typeof params?.id === "string" ? params.id : "";

  const [paper, setPaper] = useState<PracticePaper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formSlots, setFormSlots] = useState<FormData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [form, setForm] = useState(emptyQuestionForm());
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPerPage, setShowPerPage] = useState(10);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetSingle, setDeleteTargetSingle] = useState<string | null>(null);
  const [deleteTargetBulk, setDeleteTargetBulk] = useState<string[]>([]);

  const fetchPaper = useCallback(async () => {
    if (!practiceId) return null;
    const res = await fetch(`/api/level-wise-practice/${practiceId}`);
    if (!res.ok) return null;
    return res.json();
  }, [practiceId]);

  const fetchQuestions = useCallback(async () => {
    if (!practiceId) return [];
    const res = await fetch(`/api/level-wise-practice/${practiceId}/questions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, [practiceId]);

  const syncPaper = useCallback(
    async (count: number) => {
      if (!practiceId) return;
      const durationMinutes = count * MINUTES_PER_QUESTION;
      const totalMarks = count * MARKS_PER_QUESTION;
      const res = await fetch(`/api/level-wise-practice/${practiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalQuestions: count,
          durationMinutes,
          totalMarks,
        }),
      });
      if (!res.ok) return;
      const updated = await fetchPaper();
      if (updated) setPaper(updated);
    },
    [practiceId, fetchPaper]
  );

  useEffect(() => {
    if (!practiceId) {
      setError("Invalid practice ID");
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
        setQuestions(questionsData ?? []);
        if (!paperData) setError("Practice paper not found");
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [practiceId, fetchPaper, fetchQuestions]);

  const openAdd = () => {
    setFormSlots((prev) => [...prev, emptyQuestionForm()]);
    setForm(emptyQuestionForm());
    setEditingId(null);
    setShowInlineForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const openAddMore = () => {
    setFormSlots((prev) => [...prev, emptyQuestionForm()]);
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
    setForm({
      questionText: q.questionText,
      type: q.type,
      options:
        q.type === "MCQ" && q.options?.length
          ? q.options.length >= 4
            ? q.options
            : [...q.options, ...Array(4 - q.options.length).fill("")].slice(0, 4)
          : ["", "", "", ""],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      numericalAnswer: q.numericalAnswer ?? "",
      numericalTolerance: q.numericalTolerance ?? 0,
      numericalUnit: q.numericalUnit ?? "",
      marksCorrect: q.marksCorrect ?? 4,
      marksIncorrect: q.marksIncorrect ?? 1,
      explanation: q.explanation ?? "",
      explanationImageUrl: q.explanationImageUrl ?? "",
    });
    setEditingId(q.id);
    setEditDialogOpen(true);
  };

  const closeForm = () => {
    setShowInlineForm(false);
    setFormSlots([]);
    setEditingId(null);
    setForm(emptyQuestionForm());
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
      form.options = opts;
      form.correctOptionIndex = Math.min(form.correctOptionIndex, opts.length - 1);
    }

    setSaving(true);
    try {
      const payload = buildPayload(form);

      if (editingId) {
        const res = await fetch(
          `/api/level-wise-practice/${practiceId}/questions/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...updated } : q))
        );
        toast.success("Question updated");
        closeForm();
      } else {
        const res = await fetch(
          `/api/level-wise-practice/${practiceId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        const newList = [...questions, created].sort((a, b) => a.orderNumber - b.orderNumber);
        setQuestions(newList);
        toast.success("Question added");
        await syncPaper(newList.length);
        closeForm();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  function buildPayload(f: FormData) {
    const questionText = f.questionText.trim();
    const opts = f.type === "MCQ" ? f.options.map((o) => o.trim()).filter(Boolean) : [];
    const correctIndex = f.type === "MCQ" ? Math.min(f.correctOptionIndex, Math.max(0, opts.length - 1)) : 0;
    return {
      questionText,
      type: f.type,
      options: f.type === "MCQ" ? opts : [],
      correctOptionIndex: f.type === "MCQ" ? correctIndex : 0,
      numericalAnswer: f.type === "NVQ" ? f.numericalAnswer : "",
      numericalTolerance: f.type === "NVQ" ? f.numericalTolerance : 0,
      numericalUnit: f.type === "NVQ" ? f.numericalUnit : "",
      marksCorrect: f.marksCorrect,
      marksIncorrect: f.marksIncorrect,
      difficulty: paper?.difficulty ?? "Medium",
      explanation: (f.explanation ?? "").trim(),
      explanationImageUrl: (f.explanationImageUrl ?? "").trim(),
    };
  }

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
    }
    setSaving(true);
    try {
      let newList = [...questions];
      for (const { slot } of toSave) {
        const payload = buildPayload(slot);
        const res = await fetch(`/api/level-wise-practice/${practiceId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        newList = [...newList, created];
      }
      newList.sort((a, b) => a.orderNumber - b.orderNumber);
      setQuestions(newList);
      setFormSlots([]);
      setShowInlineForm(false);
      await syncPaper(newList.length);
      toast.success(`${toSave.length} question${toSave.length !== 1 ? "s" : ""} added`);
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

    setSavingSlot(slotIndex);
    try {
      const payload = buildPayload(slotForm);
      const res = await fetch(`/api/level-wise-practice/${practiceId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      const newList = [...questions, created].sort((a, b) => a.orderNumber - b.orderNumber);
      setQuestions(newList);
      setFormSlots((prev) => {
        const next = prev.filter((_, j) => j !== slotIndex);
        if (next.length === 0) setTimeout(() => setShowInlineForm(false), 0);
        return next;
      });
      await syncPaper(newList.length);
      toast.success("Question added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingSlot(null);
    }
  };

  const openDeleteSingle = (id: string) => {
    setDeleteTargetSingle(id);
    setDeleteTargetBulk([]);
    setDeleteDialogOpen(true);
  };

  const openDeleteBulk = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleteTargetSingle(null);
    setDeleteTargetBulk(ids);
    setDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    const ids = deleteTargetSingle ? [deleteTargetSingle] : deleteTargetBulk;
    if (ids.length === 0) {
      setDeleteDialogOpen(false);
      setDeleteTargetSingle(null);
      setDeleteTargetBulk([]);
      return;
    }
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/level-wise-practice/${practiceId}/questions/${id}`, {
            method: "DELETE",
          })
        )
      );
      const newList = questions.filter((q) => !ids.includes(q.id));
      setQuestions(newList);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(
        ids.length === 1 ? "Question deleted" : `${ids.length} questions deleted`
      );
      await syncPaper(newList.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetSingle(null);
      setDeleteTargetBulk([]);
    }
  };

  const deleteQuestion = async (id: string) => {
    openDeleteSingle(id);
  };

  const deleteSelected = () => {
    openDeleteBulk();
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
      const res = await fetch(
        `/api/level-wise-practice/${practiceId}/questions/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        }
      );
      if (!res.ok) throw new Error("Failed to reorder");
      toast.success("Order saved");
      setIsReorderMode(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const toggleSelectAll = () => {
    const paginated = questions.slice(0, showPerPage);
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

  const displayedQuestions = [...questions]
    .sort((a, b) => a.orderNumber - b.orderNumber)
    .slice(0, showPerPage);

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
          <span className="text-sm text-destructive">{error ?? "Practice not found"}</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/practice-management/level-wise">Back to Level Wise</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && (setDeleteDialogOpen(false), setDeleteTargetSingle(null), setDeleteTargetBulk([]))}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {deleteTargetSingle ? "Delete question?" : `Delete ${deleteTargetBulk.length} questions?`}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTargetSingle
              ? "This question will be removed from the practice. This cannot be undone."
              : "Selected questions will be removed. This cannot be undone."}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetSingle(null);
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

      {/* Edit question dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-8">
            <DialogTitle>Edit Question</DialogTitle>
            <div className="flex items-center gap-3">
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
              <Label className="text-xs text-muted-foreground">Explanation image URL (optional)</Label>
              <Input
                className={inputClass}
                value={form.explanationImageUrl ?? ""}
                onChange={(e) => setForm({ ...form, explanationImageUrl: e.target.value })}
                placeholder="https://..."
              />
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
          </div>
        </DialogContent>
      </Dialog>

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
                  <Link href="/practice-management/level-wise">Level Wise</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Questions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="ghost" size="icon" asChild title="Back to Level Wise">
          <Link href="/practice-management/level-wise">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4 overflow-auto min-h-0">
        <Card>
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-base">{paper.title}</CardTitle>
            <CardDescription className="text-sm">
              {paper.levelName && `${paper.levelName} · `}
              <span className="font-medium text-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
              {" · "}
              <span className="font-medium text-foreground">
                {questions.length * MARKS_PER_QUESTION} marks
              </span>
              {questions.length > 0 && (
                <span className="text-muted-foreground">
                  {" "}({MINUTES_PER_QUESTION} min per question)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-0">
          {/* List header: Questions List (N), Select All, Filter, Show */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold">Questions List ({questions.length})</h3>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={openDeleteBulk}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete selected ({selectedIds.size})
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Filter">
                <Filter className="h-4 w-4" />
              </Button>
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                Show:
                <Select
                  value={String(showPerPage)}
                  onValueChange={(v) => setShowPerPage(parseInt(v, 10))}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              {questions.length > 0 && (
                <>
                  {!isReorderMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReorderMode(true)}
                      title="Enable drag-and-drop to reorder questions"
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
                        {savingOrder && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
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
              <Button onClick={openAdd} size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Create-question panel: all slots + Add more / Save all / Cancel in same div */}
          {formSlots.length > 0 && (
            <div ref={formRef} className="space-y-3 rounded-lg border-2 border-primary/20 bg-muted/10 p-4">
              {formSlots.map((slotForm, slotIndex) => (
                <Card key={`slot-${slotIndex}`} className="border border-border">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-1.5 pt-3 px-4">
                    <CardTitle className="text-base">
                      New Question {formSlots.length > 1 ? `(${slotIndex + 1} of ${formSlots.length})` : ""}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
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
                      </div>
                      <div className="flex items-center gap-1.5">
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
                      </div>
                      <div className="flex items-center gap-1.5">
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4 pt-0">
                    <div className="space-y-2">
                      <Label>Question text *</Label>
                      <textarea
                        className={textareaClass}
                        value={slotForm.questionText}
                        onChange={(e) => updateFormSlot(slotIndex, { questionText: e.target.value })}
                        placeholder="Enter the question..."
                      />
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
                              Math.min(
                                slotForm.correctOptionIndex,
                                slotForm.options.length - 1
                              )
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
                              updateFormSlot(slotIndex, {
                                numericalAnswer: e.target.value,
                              })
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
                      <Label className="text-xs text-muted-foreground">Explanation image URL (optional)</Label>
                      <Input
                        className={inputClass}
                        value={slotForm.explanationImageUrl ?? ""}
                        onChange={(e) =>
                          updateFormSlot(slotIndex, { explanationImageUrl: e.target.value })
                        }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => removeFormSlot(slotIndex)}
                    >
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
                <Button
                  onClick={saveAllSlots}
                  disabled={saving}
                  size="sm"
                >
                  {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Save all ({formSlots.filter((s) => s.questionText.trim()).length})
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setFormSlots([]); setShowInlineForm(false); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Question cards - list */}
          <div className="space-y-3">
            {displayedQuestions.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No questions yet. Click &quot;Add question&quot; to create one.
              </div>
            ) : (
              displayedQuestions.map((q, idx) => (
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
                  } ${
                    dragOverQuestionId === q.id
                      ? "border-2 border-primary/40 bg-primary/5"
                      : "border-border"
                  } ${draggedQuestion?.id === q.id ? "opacity-50" : ""}`}
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
                          <p className="font-medium text-foreground min-w-0 flex-1">{q.questionText}</p>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-400">
                              +{q.marksCorrect ?? 4}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/50 dark:text-red-400">
                              −{q.marksIncorrect ?? 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => openEdit(q)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => openDeleteSingle(q.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {q.type === "MCQ" && q.options?.length > 0 && (
                          <>
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
                                    <span className="min-w-0 flex-1 text-sm">{opt}</span>
                                    {isCorrect && (
                                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {q.type === "NVQ" && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Answer:</span>
                            <span className="font-medium">{q.numericalAnswer || "—"}</span>
                            {q.numericalUnit && (
                              <span className="text-muted-foreground">{q.numericalUnit}</span>
                            )}
                          </div>
                        )}

                        {((q.explanation ?? "").trim() || (q.explanationImageUrl ?? "").trim()) ? (
                          <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <p className="text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                              Explanation
                            </p>
                            {(q.explanationImageUrl ?? "").trim() ? (
                              <div className="mt-2">
                                <img
                                  src={q.explanationImageUrl}
                                  alt="Explanation"
                                  className="max-h-48 rounded-md border border-border object-contain"
                                />
                              </div>
                            ) : null}
                            {(q.explanation ?? "").trim() ? (
                              <p className="mt-2 text-sm text-foreground">{q.explanation}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Bottom: Add question only */}
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <Button onClick={openAdd} variant="outline" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add question
            </Button>
          </div>

          {questions.length > showPerPage && (
            <p className="text-center text-sm text-muted-foreground">
              Showing {displayedQuestions.length} of {questions.length} questions. Increase &quot;Show&quot; to see more.
            </p>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
