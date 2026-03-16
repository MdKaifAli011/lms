"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  PenLine,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/titleCase";

/** Auto: duration = questions × 3 min, total marks = questions × 4. */
const MINUTES_PER_QUESTION = 3;
const MARKS_PER_QUESTION = 4;

const OPTION_LETTERS = ["A", "B", "C", "D"];

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass =
  "min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition */
export type ContentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const LEVEL_NAMES: Record<ContentLevel, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];

export type LevelWiseDirectDetailsPageProps = {
  level: ContentLevel;
  examId?: string;
  subjectId?: string;
  unitId?: string;
  chapterId?: string;
  topicId?: string;
  subtopicId?: string;
  definitionId?: string;
  examSlug?: string;
  /** Optional display names for scope bar and create dialog (e.g. from current details page). */
  examName?: string;
  subjectName?: string;
  unitName?: string;
  chapterName?: string;
  topicName?: string;
  subtopicName?: string;
  definitionName?: string;
};

interface PracticePaper {
  id: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: string;
  status: string;
  locked?: boolean;
  orderNumber: number;
}

interface ExamOption {
  id: string;
  name: string;
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

type FormData = {
  questionText: string;
  type: "MCQ" | "NVQ";
  options: string[];
  correctOptionIndex: number;
  numericalAnswer: string;
  numericalTolerance: number;
  numericalUnit: string;
  marksCorrect: number;
  marksIncorrect: number;
  explanation: string;
  explanationImageUrl: string;
};

function buildQueryParamsFromScope(
  level: ContentLevel,
  scope: ResolvedScope,
): string {
  const params = new URLSearchParams();
  params.set("level", String(level));
  if (scope.examId) params.set("examId", scope.examId);
  if (scope.subjectId) params.set("subjectId", scope.subjectId);
  if (scope.unitId) params.set("unitId", scope.unitId);
  if (scope.chapterId) params.set("chapterId", scope.chapterId);
  if (scope.topicId) params.set("topicId", scope.topicId);
  if (scope.subtopicId) params.set("subtopicId", scope.subtopicId);
  if (scope.definitionId) params.set("definitionId", scope.definitionId);
  params.set("status", "Active");
  return params.toString();
}

/** Resolved hierarchy for display and create paper (IDs + names). */
type ResolvedScope = {
  examId: string | null;
  subjectId: string | null;
  unitId: string | null;
  chapterId: string | null;
  topicId: string | null;
  subtopicId: string | null;
  definitionId: string | null;
  examName: string;
  subjectName: string;
  unitName: string;
  chapterName: string;
  topicName: string;
  subtopicName: string;
  definitionName: string;
};

function initialScope(props: LevelWiseDirectDetailsPageProps): ResolvedScope {
  return {
    examId: props.examId ?? null,
    subjectId: props.subjectId ?? null,
    unitId: props.unitId ?? null,
    chapterId: props.chapterId ?? null,
    topicId: props.topicId ?? null,
    subtopicId: props.subtopicId ?? null,
    definitionId: props.definitionId ?? null,
    examName: props.examName ?? "",
    subjectName: props.subjectName ?? "",
    unitName: props.unitName ?? "",
    chapterName: props.chapterName ?? "",
    topicName: props.topicName ?? "",
    subtopicName: props.subtopicName ?? "",
    definitionName: props.definitionName ?? "",
  };
}

/** Build scope label for current level, e.g. "Level 1 – Exam: NEET" or "Level 3 – Exam: NEET, Subject: Physics, Unit: Unit 1". */
function scopeLabel(level: ContentLevel, scope: ResolvedScope): string {
  return `Level ${level} – ${scopeLine(level, scope)}`;
}

/** Full scope line for display: "Exam: NEET, Subject: Physics, Unit: Unit 1" up to current level. */
function scopeLine(level: ContentLevel, scope: ResolvedScope): string {
  const parts: string[] = [];
  if (level >= 1 && (scope.examName || scope.examId))
    parts.push(`Exam: ${scope.examName ? toTitleCase(scope.examName) : "—"}`);
  if (level >= 2 && (scope.subjectName || scope.subjectId))
    parts.push(
      `Subject: ${scope.subjectName ? toTitleCase(scope.subjectName) : "—"}`,
    );
  if (level >= 3 && (scope.unitName || scope.unitId))
    parts.push(`Unit: ${scope.unitName ? toTitleCase(scope.unitName) : "—"}`);
  if (level >= 4 && (scope.chapterName || scope.chapterId))
    parts.push(
      `Chapter: ${scope.chapterName ? toTitleCase(scope.chapterName) : "—"}`,
    );
  if (level >= 5 && (scope.topicName || scope.topicId))
    parts.push(
      `Topic: ${scope.topicName ? toTitleCase(scope.topicName) : "—"}`,
    );
  if (level >= 6 && (scope.subtopicName || scope.subtopicId))
    parts.push(
      `Subtopic: ${scope.subtopicName ? toTitleCase(scope.subtopicName) : "—"}`,
    );
  if (level >= 7 && (scope.definitionName || scope.definitionId))
    parts.push(
      `Definition: ${scope.definitionName ? toTitleCase(scope.definitionName) : "—"}`,
    );
  return parts.length ? parts.join(", ") : "—";
}

const emptyPaperForm = (level: ContentLevel, examId?: string) => ({
  examId: examId || "",
  level: String(level) as string,
  title: "",
  description: "",
  difficulty: "Medium",
  status: "Active",
});

const emptyQuestionForm = (): FormData => ({
  questionText: "",
  type: "MCQ",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  numericalAnswer: "",
  numericalTolerance: 0,
  numericalUnit: "",
  marksCorrect: 4,
  marksIncorrect: 1,
  explanation: "",
  explanationImageUrl: "",
});

export function LevelWiseDirectDetailsPage(
  props: LevelWiseDirectDetailsPageProps,
) {
  const { level, examId: propsExamId } = props;
  const [resolvedScope, setResolvedScope] = React.useState<ResolvedScope>(() =>
    initialScope(props),
  );
  const [papers, setPapers] = React.useState<PracticePaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = React.useState<string | null>(
    null,
  );
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [questionsLoading, setQuestionsLoading] = React.useState(false);
  const [exams, setExams] = React.useState<ExamOption[]>([]);

  /** Collapsible: which papers are expanded (questions loaded on first expand). */
  const [expandedPapers, setExpandedPapers] = React.useState<Set<string>>(
    new Set(),
  );
  /** Collapsible: which questions are expanded (per question id). */
  const [expandedQuestions, setExpandedQuestions] = React.useState<Set<string>>(
    new Set(),
  );
  /** Questions by paper id (lazy-loaded when paper is expanded). */
  const [paperQuestionsCache, setPaperQuestionsCache] = React.useState<
    Record<string, Question[]>
  >({});
  const [loadingPaperId, setLoadingPaperId] = React.useState<string | null>(
    null,
  );

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [paperForm, setPaperForm] = React.useState(() =>
    emptyPaperForm(level, propsExamId),
  );

  const [showInlineForm, setShowInlineForm] = React.useState(false);
  const [formSlots, setFormSlots] = React.useState<FormData[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [savingSlot, setSavingSlot] = React.useState<number | null>(null);
  const [form, setForm] = React.useState(emptyQuestionForm);
  const formRef = React.useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showPerPage, setShowPerPage] = React.useState(10);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTargetSingle, setDeleteTargetSingle] = React.useState<
    string | null
  >(null);
  const [deleteTargetBulk, setDeleteTargetBulk] = React.useState<string[]>([]);
  const [deleteTargetPaperId, setDeleteTargetPaperId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    setResolvedScope(initialScope(props));
  }, [
    props.level,
    props.examId,
    props.subjectId,
    props.unitId,
    props.chapterId,
    props.topicId,
    props.subtopicId,
    props.definitionId,
    props.examName,
    props.subjectName,
    props.unitName,
    props.chapterName,
    props.topicName,
    props.subtopicName,
    props.definitionName,
  ]);

  React.useEffect(() => {
    let cancelled = false;
    const scope = { ...initialScope(props) };

    async function resolve() {
      try {
        if (scope.definitionId && !scope.subtopicId) {
          const res = await fetch(`/api/definitions/${scope.definitionId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.subtopicId = d.subtopicId ?? null;
            if (d.name && !scope.definitionName) scope.definitionName = d.name;
          }
        }
        if (scope.subtopicId && !scope.topicId) {
          const res = await fetch(`/api/subtopics/${scope.subtopicId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.topicId = d.topicId ?? null;
            if (d.name && !scope.subtopicName) scope.subtopicName = d.name;
          }
        }
        if (scope.topicId && !scope.chapterId) {
          const res = await fetch(`/api/topics/${scope.topicId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.chapterId = d.chapterId ?? null;
            if (d.name && !scope.topicName) scope.topicName = d.name;
          }
        }
        if (scope.chapterId && !scope.unitId) {
          const res = await fetch(`/api/chapters/${scope.chapterId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.unitId = d.unitId ?? null;
            if (d.name && !scope.chapterName) scope.chapterName = d.name;
          }
        }
        if (scope.unitId && !scope.subjectId) {
          const res = await fetch(`/api/units/${scope.unitId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.subjectId = d.subjectId ?? null;
            if (d.name && !scope.unitName) scope.unitName = d.name;
          }
        }
        if (scope.subjectId && !scope.examId) {
          const res = await fetch(`/api/subjects/${scope.subjectId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.examId = d.examId ?? null;
            if (d.name && !scope.subjectName) scope.subjectName = d.name;
          }
        }
        if (!cancelled) {
          setResolvedScope((s) => ({
            ...s,
            examId: scope.examId ?? s.examId,
            subjectId: scope.subjectId ?? s.subjectId,
            unitId: scope.unitId ?? s.unitId,
            chapterId: scope.chapterId ?? s.chapterId,
            topicId: scope.topicId ?? s.topicId,
            subtopicId: scope.subtopicId ?? s.subtopicId,
            definitionId: scope.definitionId ?? s.definitionId,
            examName: scope.examName || s.examName,
            subjectName: scope.subjectName || s.subjectName,
            unitName: scope.unitName || s.unitName,
            chapterName: scope.chapterName || s.chapterName,
            topicName: scope.topicName || s.topicName,
            subtopicName: scope.subtopicName || s.subtopicName,
            definitionName: scope.definitionName || s.definitionName,
          }));
        }
      } catch {
        // ignore
      }
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [
    props.examId,
    props.subjectId,
    props.unitId,
    props.chapterId,
    props.topicId,
    props.subtopicId,
    props.definitionId,
  ]);

  React.useEffect(() => {
    if (!resolvedScope.examId || resolvedScope.examName || exams.length === 0)
      return;
    const exam = exams.find((e) => e.id === resolvedScope.examId);
    if (exam?.name) setResolvedScope((s) => ({ ...s, examName: exam.name }));
  }, [resolvedScope.examId, resolvedScope.examName, exams]);

  const levelName = LEVEL_NAMES[level] ?? "Content";
  const selectedPaper = React.useMemo(
    () => papers.find((p) => p.id === selectedPaperId) ?? null,
    [papers, selectedPaperId],
  );

  const fetchQuestions = React.useCallback((practiceId: string) => {
    setQuestionsLoading(true);
    fetch(`/api/level-wise-practice/${practiceId}/questions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setQuestionsLoading(false));
  }, []);

  /** Fetch questions for a paper and store in cache; used when paper is expanded. */
  const ensurePaperQuestions = React.useCallback(
    (paperId: string) => {
      if (paperQuestionsCache[paperId] !== undefined) return;
      setLoadingPaperId(paperId);
      fetch(`/api/level-wise-practice/${paperId}/questions`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setPaperQuestionsCache((prev) => ({ ...prev, [paperId]: list }));
        })
        .catch(() =>
          setPaperQuestionsCache((prev) => ({ ...prev, [paperId]: [] })),
        )
        .finally(() => setLoadingPaperId(null));
    },
    [paperQuestionsCache],
  );

  const togglePaperExpanded = React.useCallback(
    (paperId: string, open: boolean) => {
      setExpandedPapers((prev) => {
        const next = new Set(prev);
        if (open) next.add(paperId);
        else next.delete(paperId);
        return next;
      });
    },
    [],
  );

  const toggleQuestionExpanded = React.useCallback((questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  /** Update cached questions for a paper (after add/edit/delete). */
  const setCachedQuestions = React.useCallback(
    (paperId: string, list: Question[]) => {
      setPaperQuestionsCache((prev) => ({ ...prev, [paperId]: list }));
    },
    [],
  );

  const syncPaper = React.useCallback(
    async (practiceId: string, count: number) => {
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
      setPapers((prev) =>
        prev.map((p) =>
          p.id === practiceId
            ? { ...p, totalQuestions: count, durationMinutes, totalMarks }
            : p,
        ),
      );
    },
    [],
  );

  React.useEffect(() => {
    if (level === 1 && !resolvedScope.examId) {
      setPapers([]);
      setLoading(false);
      return;
    }
    const query = buildQueryParamsFromScope(level, resolvedScope);
    let cancelled = false;
    setLoading(true);
    fetch(`/api/level-wise-practice?${query}`)
      .then((res) => (!cancelled && res.ok ? res.json() : { papers: [] }))
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data.papers) ? data.papers : [];
          setPapers(list);
          if (list.length > 0) {
            const sorted = list.sort(
              (a: PracticePaper, b: PracticePaper) =>
                a.orderNumber - b.orderNumber,
            );
            const currentInList = sorted.some(
              (p: PracticePaper) => p.id === selectedPaperId,
            );
            if (!currentInList) setSelectedPaperId(sorted[0].id);
          } else {
            setSelectedPaperId(null);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setPapers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    level,
    resolvedScope.examId,
    resolvedScope.subjectId,
    resolvedScope.unitId,
    resolvedScope.chapterId,
    resolvedScope.topicId,
    resolvedScope.subtopicId,
    resolvedScope.definitionId,
    selectedPaperId,
  ]);

  React.useEffect(() => {
    if (selectedPaperId)
      setQuestions(paperQuestionsCache[selectedPaperId] ?? []);
    else setQuestions([]);
  }, [selectedPaperId, paperQuestionsCache]);

  React.useEffect(() => {
    fetch("/api/exams?contextapi=1")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }, []);

  React.useEffect(() => {
    if (createOpen)
      setPaperForm(emptyPaperForm(level, resolvedScope.examId ?? undefined));
  }, [createOpen, level, resolvedScope.examId]);

  const createPaper = async () => {
    const rawTitle = paperForm.title.trim();
    if (!rawTitle) {
      toast.error("Title is required");
      return;
    }
    if (!resolvedScope.examId && !paperForm.examId) {
      toast.error("Please select an exam");
      return;
    }
    const levelNum = parseInt(paperForm.level, 10);
    if (levelNum < 1 || levelNum > 7) {
      toast.error("Invalid level");
      return;
    }
    const title = toTitleCase(rawTitle);
    setCreateSaving(true);
    try {
      const body: Record<string, unknown> = {
        examId: resolvedScope.examId ?? paperForm.examId,
        level: levelNum,
        title,
        description: paperForm.description.trim(),
        totalQuestions: 0,
        durationMinutes: 0,
        totalMarks: 0,
        difficulty: paperForm.difficulty,
        status: paperForm.status,
      };
      if (levelNum >= 2 && resolvedScope.subjectId)
        body.subjectId = resolvedScope.subjectId;
      if (levelNum >= 3 && resolvedScope.unitId)
        body.unitId = resolvedScope.unitId;
      if (levelNum >= 4 && resolvedScope.chapterId)
        body.chapterId = resolvedScope.chapterId;
      if (levelNum >= 5 && resolvedScope.topicId)
        body.topicId = resolvedScope.topicId;
      if (levelNum >= 6 && resolvedScope.subtopicId)
        body.subtopicId = resolvedScope.subtopicId;
      if (levelNum >= 7 && resolvedScope.definitionId)
        body.definitionId = resolvedScope.definitionId;

      const res = await fetch("/api/level-wise-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create");
      }
      const created = await res.json();
      setPapers((prev) =>
        [
          ...prev,
          { ...created, orderNumber: created.orderNumber ?? prev.length },
        ].sort((a, b) => a.orderNumber - b.orderNumber),
      );
      setSelectedPaperId(created.id);
      setPaperQuestionsCache((prev) => ({ ...prev, [created.id]: [] }));
      setExpandedPapers((prev) => new Set(prev).add(created.id));
      setQuestions([]);
      setCreateOpen(false);
      setPaperForm(emptyPaperForm(level, resolvedScope.examId ?? undefined));
      toast.success("Practice paper created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreateSaving(false);
    }
  };

  function buildPayload(f: FormData) {
    const questionText = f.questionText.trim();
    const opts =
      f.type === "MCQ" ? f.options.map((o) => o.trim()).filter(Boolean) : [];
    const correctIndex =
      f.type === "MCQ"
        ? Math.min(f.correctOptionIndex, Math.max(0, opts.length - 1))
        : 0;
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
      difficulty: selectedPaper?.difficulty ?? "Medium",
      explanation: (f.explanation ?? "").trim(),
      explanationImageUrl: (f.explanationImageUrl ?? "").trim(),
    };
  }

  const openAdd = (paperId?: string) => {
    const pid = paperId ?? selectedPaperId;
    if (!pid) return;
    setSelectedPaperId(pid);
    setFormSlots((prev) => [...prev, emptyQuestionForm()]);
    setForm(emptyQuestionForm());
    setEditingId(null);
    setShowInlineForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const openAddMore = () => {
    setFormSlots((prev) => [...prev, emptyQuestionForm()]);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
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

  const openEdit = (paperId: string, q: Question) => {
    setSelectedPaperId(paperId);
    setForm({
      questionText: q.questionText,
      type: q.type,
      options:
        q.type === "MCQ" && q.options?.length
          ? q.options.length >= 4
            ? q.options
            : [...q.options, ...Array(4 - q.options.length).fill("")].slice(
                0,
                4,
              )
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
      correctOptionIndex: Math.min(
        form.correctOptionIndex,
        Math.max(0, next.length - 1),
      ),
    });
  };

  const saveQuestion = async () => {
    if (!selectedPaperId) return;
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
      form.correctOptionIndex = Math.min(
        form.correctOptionIndex,
        opts.length - 1,
      );
    }

    setSaving(true);
    try {
      const payload = buildPayload(form);

      if (editingId) {
        const res = await fetch(
          `/api/level-wise-practice/${selectedPaperId}/questions/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        const newList = (paperQuestionsCache[selectedPaperId!] ?? []).map(
          (q) => (q.id === editingId ? { ...q, ...updated } : q),
        );
        setCachedQuestions(selectedPaperId!, newList);
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...updated } : q)),
        );
        toast.success("Question updated");
        closeForm();
      } else {
        const res = await fetch(
          `/api/level-wise-practice/${selectedPaperId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        const currentList = paperQuestionsCache[selectedPaperId!] ?? [];
        const newList = [...currentList, created].sort(
          (a, b) => a.orderNumber - b.orderNumber,
        );
        setCachedQuestions(selectedPaperId!, newList);
        setQuestions(newList);
        toast.success("Question added");
        await syncPaper(selectedPaperId, newList.length);
        closeForm();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveAllSlots = async () => {
    if (!selectedPaperId) return;
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
      const initialList = paperQuestionsCache[selectedPaperId] ?? [];
      let newList = [...initialList];
      for (const { slot } of toSave) {
        const payload = buildPayload(slot);
        const res = await fetch(
          `/api/level-wise-practice/${selectedPaperId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        newList = [...newList, created];
      }
      newList.sort((a, b) => a.orderNumber - b.orderNumber);
      setCachedQuestions(selectedPaperId, newList);
      setQuestions(newList);
      setFormSlots([]);
      setShowInlineForm(false);
      await syncPaper(selectedPaperId, newList.length);
      toast.success(
        `${toSave.length} question${toSave.length !== 1 ? "s" : ""} added`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveFormSlot = async (slotIndex: number) => {
    if (!selectedPaperId) return;
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
      const res = await fetch(
        `/api/level-wise-practice/${selectedPaperId}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      const currentList = paperQuestionsCache[selectedPaperId] ?? [];
      const newList = [...currentList, created].sort(
        (a, b) => a.orderNumber - b.orderNumber,
      );
      setCachedQuestions(selectedPaperId, newList);
      setQuestions(newList);
      setFormSlots((prev) => {
        const next = prev.filter((_, j) => j !== slotIndex);
        if (next.length === 0) setTimeout(() => setShowInlineForm(false), 0);
        return next;
      });
      await syncPaper(selectedPaperId, newList.length);
      toast.success("Question added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingSlot(null);
    }
  };

  const openDeleteSingle = (paperId: string, id: string) => {
    setDeleteTargetSingle(id);
    setDeleteTargetBulk([]);
    setDeleteTargetPaperId(paperId);
    setDeleteDialogOpen(true);
  };

  const openDeleteBulk = (paperId: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleteTargetSingle(null);
    setDeleteTargetBulk(ids);
    setDeleteTargetPaperId(paperId);
    setDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    const ids = deleteTargetSingle ? [deleteTargetSingle] : deleteTargetBulk;
    const paperId = deleteTargetPaperId;
    if (ids.length === 0 || !paperId) {
      setDeleteDialogOpen(false);
      setDeleteTargetSingle(null);
      setDeleteTargetBulk([]);
      setDeleteTargetPaperId(null);
      return;
    }
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/level-wise-practice/${paperId}/questions/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      const currentList = paperQuestionsCache[paperId] ?? [];
      const newList = currentList.filter((q) => !ids.includes(q.id));
      setCachedQuestions(paperId, newList);
      if (paperId === selectedPaperId) setQuestions(newList);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(
        ids.length === 1
          ? "Question deleted"
          : `${ids.length} questions deleted`,
      );
      await syncPaper(paperId, newList.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetSingle(null);
      setDeleteTargetBulk([]);
      setDeleteTargetPaperId(null);
    }
  };

  const toggleSelectAll = (paperId: string) => {
    const list = paperQuestionsCache[paperId] ?? [];
    const sorted = [...list].sort((a, b) => a.orderNumber - b.orderNumber);
    const allSelected =
      sorted.length > 0 && sorted.every((q) => selectedIds.has(q.id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        sorted.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        sorted.forEach((q) => next.add(q.id));
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

  /** Truncate question text for collapsible trigger */
  const truncate = (text: string, maxLen: number) =>
    text.length <= maxLen ? text : text.slice(0, maxLen).trim() + "…";

  return (
    <>
      <Card className="overflow-hidden border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/80 p-6 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <PenLine className="h-5 w-5 text-primary" />
                Practice questions for this {levelName}
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-muted-foreground">
                Add and edit questions here. Start a test to practice.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setCreateOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                New paper
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span className="text-sm">Loading…</span>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No practice paper for this {levelName.toLowerCase()} yet.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create first practice paper
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Create-question panel (shown when adding to a paper) */}
              {formSlots.length > 0 && selectedPaperId && (
                <div
                  ref={formRef}
                  className="space-y-3 rounded-lg border-2 border-primary/20 bg-muted/10 p-4"
                >
                  {formSlots.map((slotForm, slotIndex) => (
                    <Card
                      key={`slot-${slotIndex}`}
                      className="border border-border"
                    >
                      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-1.5 pt-3 px-4">
                        <CardTitle className="text-base">
                          New Question{" "}
                          {formSlots.length > 1
                            ? `(${slotIndex + 1} of ${formSlots.length})`
                            : ""}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground shrink-0">
                              Type
                            </Label>
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
                            <Label className="text-xs text-muted-foreground shrink-0">
                              Marks (✓)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              className="h-9 w-16"
                              value={slotForm.marksCorrect}
                              onChange={(e) =>
                                updateFormSlot(slotIndex, {
                                  marksCorrect:
                                    parseInt(e.target.value, 10) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs text-muted-foreground shrink-0">
                              Marks (✗)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              className="h-9 w-16"
                              value={slotForm.marksIncorrect}
                              onChange={(e) =>
                                updateFormSlot(slotIndex, {
                                  marksIncorrect:
                                    parseInt(e.target.value, 10) || 0,
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
                            onChange={(e) =>
                              updateFormSlot(slotIndex, {
                                questionText: e.target.value,
                              })
                            }
                            placeholder="Enter the question..."
                          />
                        </div>
                        {slotForm.type === "MCQ" && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {slotForm.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                    {OPTION_LETTERS[i] ?? i + 1}
                                  </span>
                                  <Input
                                    className={inputClass}
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...slotForm.options];
                                      next[i] = e.target.value;
                                      updateFormSlot(slotIndex, {
                                        options: next,
                                      });
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
                                      const next = slotForm.options.filter(
                                        (_, j) => j !== i,
                                      );
                                      updateFormSlot(slotIndex, {
                                        options: next,
                                        correctOptionIndex: Math.min(
                                          slotForm.correctOptionIndex,
                                          Math.max(0, next.length - 1),
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
                                    slotForm.options.length - 1,
                                  ),
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
                                    numericalTolerance:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit (optional)</Label>
                              <Input
                                value={slotForm.numericalUnit}
                                onChange={(e) =>
                                  updateFormSlot(slotIndex, {
                                    numericalUnit: e.target.value,
                                  })
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
                              updateFormSlot(slotIndex, {
                                explanation: e.target.value,
                              })
                            }
                            placeholder="Why this answer is correct..."
                          />
                          <Label className="text-xs text-muted-foreground">
                            Explanation image URL (optional)
                          </Label>
                          <Input
                            className={inputClass}
                            value={slotForm.explanationImageUrl ?? ""}
                            onChange={(e) =>
                              updateFormSlot(slotIndex, {
                                explanationImageUrl: e.target.value,
                              })
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
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                    <Button onClick={openAddMore} variant="outline" size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add more question
                    </Button>
                    <Button onClick={saveAllSlots} disabled={saving} size="sm">
                      {saving && (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      )}
                      Save all (
                      {formSlots.filter((s) => s.questionText.trim()).length})
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

              {/* Collapsible papers */}
              <div className="space-y-2">
                {[...papers]
                  .sort((a, b) => a.orderNumber - b.orderNumber)
                  .map((paper) => {
                    const isPaperOpen = expandedPapers.has(paper.id);
                    const paperQuestions = paperQuestionsCache[paper.id] ?? [];
                    const sortedPaperQuestions = [...paperQuestions].sort(
                      (a, b) => a.orderNumber - b.orderNumber,
                    );
                    return (
                      <Collapsible
                        key={paper.id}
                        open={isPaperOpen}
                        onOpenChange={(open) => {
                          togglePaperExpanded(paper.id, open);
                          if (open) ensurePaperQuestions(paper.id);
                        }}
                      >
                        <Card className="overflow-hidden border-border">
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {isPaperOpen ? (
                                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground">
                                  {toTitleCase(paper.title)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {paperQuestions.length > 0
                                    ? `${paperQuestions.length} question${paperQuestions.length !== 1 ? "s" : ""}`
                                    : paper.totalQuestions != null
                                      ? `${paper.totalQuestions} question${paper.totalQuestions !== 1 ? "s" : ""}`
                                      : "—"}
                                  {" · "}
                                  {paper.durationMinutes ?? 0} min
                                  {paper.totalMarks != null
                                    ? ` · ${paper.totalMarks} marks`
                                    : ""}
                                </p>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                              {loadingPaperId === paper.id ? (
                                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span className="text-sm">
                                    Loading questions…
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-semibold">
                                        Questions ({sortedPaperQuestions.length}
                                        )
                                      </h4>
                                      {sortedPaperQuestions.length > 0 && (
                                        <>
                                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input
                                              type="checkbox"
                                              checked={
                                                sortedPaperQuestions.length >
                                                  0 &&
                                                sortedPaperQuestions.every(
                                                  (q) => selectedIds.has(q.id),
                                                )
                                              }
                                              onChange={() =>
                                                toggleSelectAll(paper.id)
                                              }
                                              className="h-4 w-4 rounded border-input"
                                            />
                                            Select all
                                          </label>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 h-8"
                                            onClick={() => {
                                              setExpandedQuestions((prev) => {
                                                const next = new Set(prev);
                                                sortedPaperQuestions.forEach(
                                                  (q) => next.add(q.id),
                                                );
                                                return next;
                                              });
                                            }}
                                            title="Expand all questions in this paper"
                                          >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            Expand all
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 h-8"
                                            onClick={() => {
                                              setExpandedQuestions((prev) => {
                                                const next = new Set(prev);
                                                sortedPaperQuestions.forEach(
                                                  (q) => next.delete(q.id),
                                                );
                                                return next;
                                              });
                                            }}
                                            title="Collapse all questions in this paper"
                                          >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                            Collapse all
                                          </Button>
                                        </>
                                      )}
                                      {selectedIds.size > 0 &&
                                        sortedPaperQuestions.some((q) =>
                                          selectedIds.has(q.id),
                                        ) && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              openDeleteBulk(paper.id)
                                            }
                                          >
                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                            Delete selected ({selectedIds.size})
                                          </Button>
                                        )}
                                    </div>
                                    <Button
                                      onClick={() => openAdd(paper.id)}
                                      size="sm"
                                      className="gap-1.5"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add question
                                    </Button>
                                  </div>

                                  {sortedPaperQuestions.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                                      No questions yet. Click &quot;Add
                                      question&quot; to create one.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {sortedPaperQuestions.map((q) => {
                                        const isQuestionOpen =
                                          expandedQuestions.has(q.id);
                                        return (
                                          <Collapsible
                                            key={q.id}
                                            open={isQuestionOpen}
                                            onOpenChange={(open) => {
                                              setExpandedQuestions((prev) => {
                                                const next = new Set(prev);
                                                if (open) next.add(q.id);
                                                else next.delete(q.id);
                                                return next;
                                              });
                                            }}
                                          >
                                            <Card className="overflow-hidden border-border">
                                              <CollapsibleTrigger asChild>
                                                <button
                                                  type="button"
                                                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                  {isQuestionOpen ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                  ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                  )}
                                                  <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                                                    {q.orderNumber}
                                                  </span>
                                                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                                    {truncate(
                                                      q.questionText,
                                                      80,
                                                    )}
                                                  </p>
                                                  <span className="shrink-0 text-xs text-muted-foreground">
                                                    {q.type}
                                                  </span>
                                                </button>
                                              </CollapsibleTrigger>
                                              <CollapsibleContent>
                                                <CardContent className="border-t border-border p-3 pt-3">
                                                  <div className="flex gap-3">
                                                    <div className="flex shrink-0 items-start gap-2 pt-0.5">
                                                      <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(
                                                          q.id,
                                                        )}
                                                        onChange={() =>
                                                          toggleSelectOne(q.id)
                                                        }
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                        className="mt-1 h-4 w-4 rounded border-input"
                                                      />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-3">
                                                      <div className="flex items-start justify-between gap-2">
                                                        <p className="min-w-0 flex-1 font-medium text-foreground">
                                                          {q.questionText}
                                                        </p>
                                                        <div className="flex shrink-0 items-center gap-2">
                                                          <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-400">
                                                            +
                                                            {q.marksCorrect ??
                                                              4}
                                                          </span>
                                                          <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/50 dark:text-red-400">
                                                            −
                                                            {q.marksIncorrect ??
                                                              1}
                                                          </span>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              openEdit(
                                                                paper.id,
                                                                q,
                                                              );
                                                            }}
                                                            title="Edit"
                                                          >
                                                            <Pencil className="h-4 w-4" />
                                                          </Button>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              openDeleteSingle(
                                                                paper.id,
                                                                q.id,
                                                              );
                                                            }}
                                                            title="Delete"
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      </div>

                                                      {q.type === "MCQ" &&
                                                        q.options?.length >
                                                          0 && (
                                                          <div className="grid grid-cols-2 gap-2">
                                                            {q.options.map(
                                                              (opt, i) => {
                                                                const isCorrect =
                                                                  i ===
                                                                  (q.correctOptionIndex ??
                                                                    0);
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
                                                                      {OPTION_LETTERS[
                                                                        i
                                                                      ] ??
                                                                        i + 1}
                                                                    </span>
                                                                    <span className="min-w-0 flex-1 text-sm">
                                                                      {opt}
                                                                    </span>
                                                                    {isCorrect && (
                                                                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                                                                    )}
                                                                  </div>
                                                                );
                                                              },
                                                            )}
                                                          </div>
                                                        )}

                                                      {q.type === "NVQ" && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                          <span className="text-muted-foreground">
                                                            Answer:
                                                          </span>
                                                          <span className="font-medium">
                                                            {q.numericalAnswer ||
                                                              "—"}
                                                          </span>
                                                          {q.numericalUnit && (
                                                            <span className="text-muted-foreground">
                                                              {q.numericalUnit}
                                                            </span>
                                                          )}
                                                        </div>
                                                      )}

                                                      {(
                                                        q.explanation ?? ""
                                                      ).trim() ||
                                                      (
                                                        q.explanationImageUrl ??
                                                        ""
                                                      ).trim() ? (
                                                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                                                          <p className="text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                                                            Explanation
                                                          </p>
                                                          {(
                                                            q.explanationImageUrl ??
                                                            ""
                                                          ).trim() ? (
                                                            <div className="mt-2">
                                                              <img
                                                                src={
                                                                  q.explanationImageUrl
                                                                }
                                                                alt="Explanation"
                                                                className="max-h-48 rounded-md border border-border object-contain"
                                                              />
                                                            </div>
                                                          ) : null}
                                                          {(
                                                            q.explanation ?? ""
                                                          ).trim() ? (
                                                            <p className="mt-2 text-sm text-foreground">
                                                              {q.explanation}
                                                            </p>
                                                          ) : null}
                                                        </div>
                                                      ) : null}
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </CollapsibleContent>
                                            </Card>
                                          </Collapsible>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create practice paper dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create practice paper</DialogTitle>
            <DialogDescription>
              Level and scope are pre-filled from the current page. Enter title
              and options below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
            {/* Paper details */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input
                  value={paperForm.title}
                  onChange={(e) =>
                    setPaperForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Enter practice title"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={paperForm.description}
                  onChange={(e) =>
                    setPaperForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={paperForm.difficulty}
                    onValueChange={(v) =>
                      setPaperForm((f) => ({ ...f, difficulty: v }))
                    }
                  >
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
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={paperForm.status}
                    onValueChange={(v) =>
                      setPaperForm((f) => ({ ...f, status: v }))
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
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createPaper} disabled={createSaving}>
              {createSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) =>
          !open &&
          (setDeleteDialogOpen(false),
          setDeleteTargetSingle(null),
          setDeleteTargetBulk([]),
          setDeleteTargetPaperId(null))
        }
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {deleteTargetSingle
                ? "Delete question?"
                : `Delete ${deleteTargetBulk.length} questions?`}
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
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => !open && closeForm()}
      >
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-8">
            <DialogTitle>Edit Question</DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="shrink-0 text-xs text-muted-foreground">
                  Type
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(v: "MCQ" | "NVQ") =>
                    setForm({ ...form, type: v })
                  }
                >
                  <SelectTrigger className="h-9 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">MCQ</SelectItem>
                    <SelectItem value="NVQ">NVQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="shrink-0 text-xs text-muted-foreground">
                  Marks (✓)
                </Label>
                <Input
                  type="number"
                  min={0}
                  className="h-9 w-16"
                  value={form.marksCorrect}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      marksCorrect: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="shrink-0 text-xs text-muted-foreground">
                  Marks (✗)
                </Label>
                <Input
                  type="number"
                  min={0}
                  className="h-9 w-16"
                  value={form.marksIncorrect}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      marksIncorrect: parseInt(e.target.value, 10) || 0,
                    })
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
                onChange={(e) =>
                  setForm({ ...form, questionText: e.target.value })
                }
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  Add option
                </Button>
                <div className="space-y-1">
                  <Label>Correct option</Label>
                  <Select
                    value={String(
                      Math.min(
                        form.correctOptionIndex,
                        form.options.length - 1,
                      ),
                    )}
                    onValueChange={(v) =>
                      setForm({ ...form, correctOptionIndex: parseInt(v, 10) })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, numericalAnswer: e.target.value })
                    }
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
                      setForm({
                        ...form,
                        numericalTolerance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit (optional)</Label>
                  <Input
                    value={form.numericalUnit}
                    onChange={(e) =>
                      setForm({ ...form, numericalUnit: e.target.value })
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
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
                placeholder="Why this answer is correct..."
              />
              <Label className="text-xs text-muted-foreground">
                Explanation image URL (optional)
              </Label>
              <Input
                className={inputClass}
                value={form.explanationImageUrl ?? ""}
                onChange={(e) =>
                  setForm({ ...form, explanationImageUrl: e.target.value })
                }
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
    </>
  );
}
