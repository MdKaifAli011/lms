"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CONTENT_LEVELS = [
  { value: 1, label: "Level 1 - Exam" },
  { value: 2, label: "Level 2 - Subject" },
  { value: 3, label: "Level 3 - Unit" },
  { value: 4, label: "Level 4 - Chapter" },
  { value: 5, label: "Level 5 - Topic" },
  { value: 6, label: "Level 6 - Subtopic" },
  { value: 7, label: "Level 7 - Definition" },
];

interface FormulaToolkitRow {
  id: string;
  examId: string;
  examName?: string;
  level: number;
  levelName?: string;
  subjectName?: string | null;
  subjectLabel?: string;
  title: string;
  slug: string;
  description?: string;
  fileUrl?: string;
  pages?: number;
  size?: string;
  orderNumber: number;
  status: string;
}

interface Exam {
  id: string;
  name: string;
}

interface HierarchyOption {
  id: string;
  name: string;
}

const emptyForm = {
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
  fileUrl: "",
  pages: "",
  size: "",
  subjectLabel: "",
  status: "Active",
};

export default function FormulaToolkitsPage() {
  const [list, setList] = useState<FormulaToolkitRow[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<FormulaToolkitRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [subjects, setSubjects] = useState<HierarchyOption[]>([]);
  const [units, setUnits] = useState<HierarchyOption[]>([]);
  const [chapters, setChapters] = useState<HierarchyOption[]>([]);
  const [topics, setTopics] = useState<HierarchyOption[]>([]);
  const [subtopics, setSubtopics] = useState<HierarchyOption[]>([]);
  const [definitions, setDefinitions] = useState<HierarchyOption[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/formula-toolkit");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load formula toolkits");
      setList([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const [listRes, examsRes] = await Promise.all([
          fetch("/api/formula-toolkit"),
          fetch("/api/exams?contextapi=1"),
        ]);
        if (!cancelled && listRes.ok) {
          const data = await listRes.json();
          setList(Array.isArray(data) ? data : []);
        }
        if (!cancelled && examsRes.ok) {
          const data = await examsRes.json();
          setExams(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const loadSubjects = useCallback(async (examId: string) => {
    if (!examId) { setSubjects([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/subjects?examId=${encodeURIComponent(examId)}&contextapi=1`);
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data.map((s: { _id?: string; id?: string; name?: string }) => ({ id: (s._id ?? s.id)?.toString() ?? "", name: (s.name ?? "") as string })) : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const loadUnits = useCallback(async (subjectId: string) => {
    if (!subjectId) { setUnits([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/units?subjectId=${encodeURIComponent(subjectId)}&contextapi=1`);
      const data = await res.json();
      setUnits(Array.isArray(data) ? data.map((u: { _id?: string; id?: string; name?: string }) => ({ id: (u._id ?? u.id)?.toString() ?? "", name: (u.name ?? "") as string })) : []);
    } catch {
      setUnits([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const loadChapters = useCallback(async (unitId: string) => {
    if (!unitId) { setChapters([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/chapters?unitId=${encodeURIComponent(unitId)}&contextapi=1`);
      const data = await res.json();
      setChapters(Array.isArray(data) ? data.map((c: { _id?: string; id?: string; name?: string }) => ({ id: (c._id ?? c.id)?.toString() ?? "", name: (c.name ?? "") as string })) : []);
    } catch {
      setChapters([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const loadTopics = useCallback(async (chapterId: string) => {
    if (!chapterId) { setTopics([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/topics?chapterId=${encodeURIComponent(chapterId)}&contextapi=1`);
      const data = await res.json();
      setTopics(Array.isArray(data) ? data.map((t: { _id?: string; id?: string; name?: string }) => ({ id: (t._id ?? t.id)?.toString() ?? "", name: (t.name ?? "") as string })) : []);
    } catch {
      setTopics([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const loadSubtopics = useCallback(async (topicId: string) => {
    if (!topicId) { setSubtopics([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/subtopics?topicId=${encodeURIComponent(topicId)}&contextapi=1`);
      const data = await res.json();
      setSubtopics(Array.isArray(data) ? data.map((s: { _id?: string; id?: string; name?: string }) => ({ id: (s._id ?? s.id)?.toString() ?? "", name: (s.name ?? "") as string })) : []);
    } catch {
      setSubtopics([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const loadDefinitions = useCallback(async (subtopicId: string) => {
    if (!subtopicId) { setDefinitions([]); return; }
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/definitions?subtopicId=${encodeURIComponent(subtopicId)}&contextapi=1`);
      const data = await res.json();
      setDefinitions(Array.isArray(data) ? data.map((d: { _id?: string; id?: string; name?: string }) => ({ id: (d._id ?? d.id)?.toString() ?? "", name: (d.name ?? "") as string })) : []);
    } catch {
      setDefinitions([]);
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  useEffect(() => {
    if (form.examId) loadSubjects(form.examId);
    else setSubjects([]);
  }, [form.examId, loadSubjects]);

  useEffect(() => {
    if (form.subjectId) loadUnits(form.subjectId);
    else setUnits([]);
  }, [form.subjectId, loadUnits]);

  useEffect(() => {
    if (form.unitId) loadChapters(form.unitId);
    else setChapters([]);
  }, [form.unitId, loadChapters]);

  useEffect(() => {
    if (form.chapterId) loadTopics(form.chapterId);
    else setTopics([]);
  }, [form.chapterId, loadTopics]);

  useEffect(() => {
    if (form.topicId) loadSubtopics(form.topicId);
    else setSubtopics([]);
  }, [form.topicId, loadSubtopics]);

  useEffect(() => {
    if (form.subtopicId) loadDefinitions(form.subtopicId);
    else setDefinitions([]);
  }, [form.subtopicId, loadDefinitions]);

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.examId) {
      toast.error("Select an exam");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/formula-toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: form.examId,
          level: parseInt(form.level, 10),
          subjectId: form.subjectId || undefined,
          unitId: form.unitId || undefined,
          chapterId: form.chapterId || undefined,
          topicId: form.topicId || undefined,
          subtopicId: form.subtopicId || undefined,
          definitionId: form.definitionId || undefined,
          title: form.title.trim(),
          description: form.description.trim(),
          fileUrl: form.fileUrl.trim(),
          pages: parseInt(form.pages, 10) || 0,
          size: form.size.trim(),
          subjectLabel: form.subjectLabel.trim(),
          status: form.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create");
      }
      await fetchList();
      setIsAddOpen(false);
      setForm(emptyForm);
      toast.success("Formula toolkit created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row: FormulaToolkitRow) => {
    setEditing(row);
    setForm({
      examId: row.examId,
      level: String(row.level),
      subjectId: "",
      unitId: "",
      chapterId: "",
      topicId: "",
      subtopicId: "",
      definitionId: "",
      title: row.title,
      description: row.description ?? "",
      fileUrl: row.fileUrl ?? "",
      pages: row.pages ? String(row.pages) : "",
      size: row.size ?? "",
      subjectLabel: row.subjectLabel ?? row.subjectName ?? "",
      status: row.status,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editing) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/formula-toolkit/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: form.examId,
          level: parseInt(form.level, 10),
          subjectId: form.subjectId || undefined,
          unitId: form.unitId || undefined,
          chapterId: form.chapterId || undefined,
          topicId: form.topicId || undefined,
          subtopicId: form.subtopicId || undefined,
          definitionId: form.definitionId || undefined,
          title: form.title.trim(),
          description: form.description.trim(),
          fileUrl: form.fileUrl.trim(),
          pages: parseInt(form.pages, 10) || 0,
          size: form.size.trim(),
          subjectLabel: form.subjectLabel.trim(),
          status: form.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to update");
      }
      await fetchList();
      setIsEditOpen(false);
      setEditing(null);
      toast.success("Formula toolkit updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this formula toolkit?")) return;
    try {
      const res = await fetch(`/api/formula-toolkit/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchList();
      toast.success("Formula toolkit deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const levelNum = parseInt(form.level, 10);

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
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
                <BreadcrumbLink href="/study-materials">Study Material Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Formula Toolkits</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(emptyForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Formula Toolkit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Formula Toolkit</DialogTitle>
              <DialogDescription>
                Link a formula toolkit to the syllabus by selecting exam and hierarchy level (subject, unit, chapter, etc.).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam *</Label>
                  <Select
                    value={form.examId}
                    onValueChange={(v) => setForm({ ...form, examId: v, subjectId: "", unitId: "", chapterId: "", topicId: "", subtopicId: "", definitionId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select
                    value={form.level}
                    onValueChange={(v) => setForm({ ...form, level: v, subjectId: "", unitId: "", chapterId: "", topicId: "", subtopicId: "", definitionId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_LEVELS.map((l) => (
                        <SelectItem key={l.value} value={String(l.value)}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {levelNum >= 2 && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={form.subjectId}
                    onValueChange={(v) => setForm({ ...form, subjectId: v, unitId: "", chapterId: "", topicId: "", subtopicId: "", definitionId: "" })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {levelNum >= 3 && (
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={form.unitId}
                    onValueChange={(v) => setForm({ ...form, unitId: v, chapterId: "", topicId: "", subtopicId: "", definitionId: "" })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select unit"} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {levelNum >= 4 && (
                <div className="space-y-2">
                  <Label>Chapter</Label>
                  <Select
                    value={form.chapterId}
                    onValueChange={(v) => setForm({ ...form, chapterId: v, topicId: "", subtopicId: "", definitionId: "" })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select chapter"} />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {levelNum >= 5 && (
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Select
                    value={form.topicId}
                    onValueChange={(v) => setForm({ ...form, topicId: v, subtopicId: "", definitionId: "" })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select topic"} />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {levelNum >= 6 && (
                <div className="space-y-2">
                  <Label>Subtopic</Label>
                  <Select
                    value={form.subtopicId}
                    onValueChange={(v) => setForm({ ...form, subtopicId: v, definitionId: "" })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select subtopic"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subtopics.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {levelNum >= 7 && (
                <div className="space-y-2">
                  <Label>Definition</Label>
                  <Select
                    value={form.definitionId}
                    onValueChange={(v) => setForm({ ...form, definitionId: v })}
                    disabled={loadingHierarchy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingHierarchy ? "Loading…" : "Select definition"} />
                    </SelectTrigger>
                    <SelectContent>
                      {definitions.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Electromagnetism Handbook"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    placeholder="/uploads/... or https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject label (card badge)</Label>
                  <Input
                    value={form.subjectLabel}
                    onChange={(e) => setForm({ ...form, subjectLabel: e.target.value })}
                    placeholder="e.g. Physics"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pages</Label>
                  <Input
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="4.2 MB"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
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
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Formula Toolkits</CardTitle>
              <CardDescription>Manage formula toolkits shown on the Study Materials page. Create by selecting exam and hierarchy level.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No formula toolkits yet. Add one to show on the public Study Materials page.
                        </TableCell>
                      </TableRow>
                    ) : (
                      list.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.orderNumber}</TableCell>
                          <TableCell className="font-medium">{row.title}</TableCell>
                          <TableCell>{row.examName}</TableCell>
                          <TableCell>{row.levelName}</TableCell>
                          <TableCell>{row.subjectLabel || row.subjectName || "—"}</TableCell>
                          <TableCell>{row.pages ?? "—"}</TableCell>
                          <TableCell>{row.size || "—"}</TableCell>
                          <TableCell>
                            <span className={row.status === "Active" ? "text-green-600" : "text-muted-foreground"}>{row.status}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
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
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Formula Toolkit</DialogTitle>
            <DialogDescription>Update title, description, file URL, pages, size, and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>File URL</Label>
              <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject label</Label>
                <Input value={form.subjectLabel} onChange={(e) => setForm({ ...form, subjectLabel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pages</Label>
                <Input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
