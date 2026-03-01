"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  GripVertical,
  Power,
  Info,
  Check,
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

const API_BASE = "/api/exams";

interface Exam {
  id: string;
  name: string;
  slug: string;
  status: "Active" | "Inactive";
  image: string;
  cardImageUrl?: string;
  items: number;
  content: string;
  meta: string;
  visits: number;
  uniqueVisits: number;
  today: number;
  descriptions?: string[];
  orderNumber?: number;
  lastModified?: string;
  createdAt?: string;
}

export default function ExamsPage() {
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [metaStatusFilter, setMetaStatusFilter] = React.useState("all");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [examToDelete, setExamToDelete] = React.useState<Exam | null>(null);
  const [editingExam, setEditingExam] = React.useState<Exam | null>(null);
  const [draggedExam, setDraggedExam] = React.useState<Exam | null>(null);
  const [dragOverExam, setDragOverExam] = React.useState<Exam | null>(null);
  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false);
  const [newExam, setNewExam] = React.useState({
    name: "",
    status: "Active" as "Active" | "Inactive",
    cardImageUrl: "",
    descriptions: ["", "", "", ""],
  });

  const fetchExams = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(res.statusText || "Failed to fetch");
      const data = (await res.json()) as Exam[];
      setExams(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load exams");
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const slugify = (value: string) => {
    const base = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return base || "exam";
  };

  const createUniqueSlug = (name: string, options?: { excludeId?: string }) => {
    const base = slugify(name);
    const taken = new Set(
      exams.filter((e) => e.id !== options?.excludeId).map((e) => e.slug),
    );

    if (!taken.has(base)) return base;

    let i = 2;
    while (taken.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  };

  const getNextOrderNumber = () => {
    const maxOrder = Math.max(...exams.map((exam) => exam.orderNumber || 0), 0);
    return maxOrder + 1;
  };

  const handleDragStart = (e: React.DragEvent, exam: Exam) => {
    if (!isReorderingEnabled) {
      e.preventDefault();
      return;
    }
    setDraggedExam(exam);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (exam: Exam) => {
    if (!isReorderingEnabled) return;
    setDragOverExam(exam);
  };

  const handleDragLeave = () => {
    setDragOverExam(null);
  };

  const handleDrop = (e: React.DragEvent, targetExam: Exam) => {
    e.preventDefault();

    if (!isReorderingEnabled) return;

    if (draggedExam && draggedExam.id !== targetExam.id) {
      const newExams = [...exams];
      const draggedIndex = newExams.findIndex(
        (exam) => exam.id === draggedExam.id,
      );
      const targetIndex = newExams.findIndex(
        (exam) => exam.id === targetExam.id,
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        newExams.splice(draggedIndex, 1);
        newExams.splice(targetIndex, 0, draggedExam);

        // Update order numbers
        newExams.forEach((exam, index) => {
          exam.orderNumber = index + 1;
        });

        setExams(newExams);
      }
    }

    setDraggedExam(null);
    setDragOverExam(null);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      exam.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesMetaStatus =
      metaStatusFilter === "all" ||
      (metaStatusFilter === "filled" && exam.meta !== "-") ||
      (metaStatusFilter === "not-filled" && exam.meta === "-");
    return matchesSearch && matchesStatus && matchesMetaStatus;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, metaStatusFilter, pageSize]);

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedExams = filteredExams.slice(startIndex, startIndex + pageSize);

  const [addSaving, setAddSaving] = React.useState(false);
  const handleAddExam = async () => {
    if (!newExam.name.trim()) return;
    setAddSaving(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newExam.name.trim(),
          status: newExam.status,
          cardImageUrl: newExam.cardImageUrl || undefined,
          descriptions: newExam.descriptions?.filter(Boolean).length
            ? newExam.descriptions?.filter(Boolean)
            : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 409
            ? data.error || "An exam with this name already exists."
            : data.error || (typeof data === "string" ? data : res.statusText);
        throw new Error(msg);
      }
      const created = data as Exam;
      setExams((prev) => [...prev, created]);
      setNewExam({
        name: "",
        status: "Active",
        cardImageUrl: "",
        descriptions: ["", "", "", ""],
      });
      setIsAddDialogOpen(false);
      toast.success("Exam created successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create exam";
      setError(msg);
      toast.error(msg);
    } finally {
      setAddSaving(false);
    }
  };

  const [editSaving, setEditSaving] = React.useState(false);
  const handleEditExam = async () => {
    if (!editingExam) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${editingExam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingExam.name.trim(),
          status: editingExam.status,
          cardImageUrl: editingExam.cardImageUrl || undefined,
          descriptions: editingExam.descriptions?.filter(Boolean).length
            ? editingExam.descriptions?.filter(Boolean)
            : undefined,
          orderNumber: editingExam.orderNumber,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data?.error
            ? data.error
            : res.statusText || "Failed to update";
        throw new Error(msg);
      }
      const updated = data as Exam;
      setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setIsEditDialogOpen(false);
      setEditingExam(null);
      toast.success("Exam updated successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update exam";
      setError(msg);
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteExam = (id: string) => {
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      setExamToDelete(exam);
      setIsDeleteDialogOpen(true);
    }
  };

  const [deleteSaving, setDeleteSaving] = React.useState(false);
  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${examToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error(await res.text().catch(() => res.statusText));
      setExams((prev) => prev.filter((e) => e.id !== examToDelete.id));
      setIsDeleteDialogOpen(false);
      setExamToDelete(null);
      toast.success("Exam deleted successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete exam";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteSaving(false);
    }
  };

  const cancelDeleteExam = () => {
    setIsDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const handleToggleStatus = async (id: string) => {
    const exam = exams.find((e) => e.id === id);
    if (!exam) return;
    const nextStatus = exam.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok)
        throw new Error(await res.text().catch(() => res.statusText));
      const updated = (await res.json()) as Exam;
      setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(`Status set to ${nextStatus}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update status";
      setError(msg);
      toast.error(msg);
    }
  };

  const enableReordering = () => {
    setIsReorderingEnabled(true);
  };

  const disableReordering = () => {
    setIsReorderingEnabled(false);
  };

  const [reorderSaving, setReorderSaving] = React.useState(false);
  const saveReorderedExams = async () => {
    setReorderSaving(true);
    try {
      const order = exams.map((e, i) => ({ id: e.id, orderNumber: i + 1 }));
      const res = await fetch(`${API_BASE}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok)
        throw new Error(await res.text().catch(() => res.statusText));
      await fetchExams();
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

  const openEditDialog = (exam: Exam) => {
    setEditingExam({
      ...exam,
      cardImageUrl:
        (exam.image && exam.image !== "No Image" ? exam.image : "") || "",
      descriptions: exam.descriptions || ["", "", "", ""],
    });
    setIsEditDialogOpen(true);
  };

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
          Loading exams…
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
                    <BreadcrumbLink href="/self-study">
                      Self Study
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Exams</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Exam</DialogTitle>
                  <DialogDescription>
                    Create a new exam for your educational platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="exam-name">Exam Name *</Label>
                    <Input
                      id="exam-name"
                      placeholder="Enter exam name (e.g., JEE Main 2024)"
                      value={newExam.name}
                      onChange={(e) =>
                        setNewExam({ ...newExam, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="order-number">Order Number</Label>
                    <Input
                      id="order-number"
                      type="number"
                      placeholder="Enter order number (auto-generated)"
                      value={getNextOrderNumber()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newExam.status}
                      onValueChange={(value: "Active" | "Inactive") =>
                        setNewExam({ ...newExam, status: value })
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
                  <div className="grid gap-2">
                    <Label htmlFor="card-image-url">
                      Card Image URL (Optional)
                    </Label>
                    <Input
                      id="card-image-url"
                      placeholder="Enter image URL (e.g., https://example.com/image.png)"
                      value={newExam.cardImageUrl}
                      onChange={(e) =>
                        setNewExam({ ...newExam, cardImageUrl: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card Descriptions (Max 4 items - Optional)</Label>
                    {newExam.descriptions.map((desc, index) => (
                      <Input
                        key={index}
                        placeholder={`Description item ${index + 1}`}
                        value={desc}
                        onChange={(e) => {
                          const newDescriptions = [...newExam.descriptions];
                          newDescriptions[index] = e.target.value;
                          setNewExam({
                            ...newExam,
                            descriptions: newDescriptions,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddExam} disabled={addSaving}>
                    {addSaving ? "Saving…" : "Add Exam"}
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
                    Total Exams
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {exams.length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All exams in system
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">
                    Active Exams
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {exams.filter((exam) => exam.status === "Active").length}
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
                  <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {exams.reduce((sum, exam) => sum + exam.visits, 0)}
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
                  <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-xl font-bold leading-none">
                    {exams.reduce((sum, exam) => sum + exam.today, 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Visits today
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">
                      Exams List
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Manage your exams, view details, and perform actions
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
                          onClick={saveReorderedExams}
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
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <div className="flex gap-2">
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
                      value={metaStatusFilter}
                      onValueChange={setMetaStatusFilter}
                    >
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Meta Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="filled">Meta Filled</SelectItem>
                        <SelectItem value="not-filled">
                          Meta Not Filled
                        </SelectItem>
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
                          Exam Details
                        </TableHead>
                        <TableHead className="w-20 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[110px]">
                          Preview
                        </TableHead>
                        <TableHead className="min-w-[100px] font-semibold text-xs uppercase tracking-wider sm:min-w-[140px]">
                          Content
                        </TableHead>
                        <TableHead className="w-20 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[120px]">
                          Meta
                        </TableHead>
                        <TableHead className="w-24 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[120px]">
                          Visits
                        </TableHead>
                        <TableHead className="w-14 shrink-0 font-semibold text-xs uppercase tracking-wider sm:w-[80px]">
                          Today
                        </TableHead>
                        <TableHead className="w-[140px] shrink-0 text-right font-semibold text-xs uppercase tracking-wider pr-2 sm:w-[190px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedExams.map((exam) => (
                        <TableRow
                          key={exam.id}
                          className={`
                          ${exam.status === "Inactive" ? "opacity-60" : ""}
                          ${dragOverExam?.id === exam.id ? "border-2 border-blue-400 bg-blue-50" : ""}
                          ${isReorderingEnabled ? "cursor-move" : "cursor-default"}
                        `}
                          draggable={isReorderingEnabled}
                          onDragStart={(e) => handleDragStart(e, exam)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(exam)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, exam)}
                        >
                          <TableCell className="py-4 pr-3">
                            <div className="w-8 text-center font-medium">
                              {exam.orderNumber}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/self-study/exams/${encodeURIComponent(exam.slug)}`}
                                className={`font-semibold text-base hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded ${
                                  exam.status === "Inactive"
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                <span className="capitalize">{exam.name}</span>
                              </Link>
                              <Badge
                                variant={
                                  exam.status === "Active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="cursor-pointer text-xs px-2 py-1"
                                onClick={() => handleToggleStatus(exam.id)}
                              >
                                {exam.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-muted-foreground ${
                              exam.status === "Inactive" ? "line-through" : ""
                            }`}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/80 rounded-lg flex items-center justify-center text-[10px] font-medium shadow-sm overflow-hidden">
                              {/^https?:\/\//i.test(exam.image) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={exam.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                "No Image"
                              )}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-muted-foreground ${
                              exam.status === "Inactive" ? "line-through" : ""
                            }`}
                          >
                            {exam.content !== "-"
                              ? exam.content
                              : "unavailable"}
                          </TableCell>
                          <TableCell
                            className={`text-muted-foreground ${
                              exam.status === "Inactive" ? "line-through" : ""
                            }`}
                          >
                            {exam.meta !== "-" ? (
                              <div className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{exam.meta}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              exam.status === "Inactive" ? "opacity-60" : ""
                            }
                          >
                            <div>
                              <div className="font-medium">{exam.visits}</div>
                              <div className="text-xs text-muted-foreground">
                                ({exam.uniqueVisits} unique)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className={
                              exam.status === "Inactive"
                                ? "line-through opacity-60"
                                : ""
                            }
                          >
                            {exam.today}
                          </TableCell>
                          <TableCell className="text-right py-4 pr-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Exam Info"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                title="View Exam"
                                asChild
                              >
                                <Link
                                  href={`/self-study/exams/${encodeURIComponent(exam.slug)}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                onClick={() => openEditDialog(exam)}
                                title="Edit Exam"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 transition-colors ${
                                  exam.status === "Active"
                                    ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => handleToggleStatus(exam.id)}
                                title={`Turn ${exam.status === "Active" ? "Off" : "On"}`}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteExam(exam.id)}
                                title="Delete Exam"
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
                      {filteredExams.length === 0 ? 0 : startIndex + 1}-
                      {Math.min(startIndex + pageSize, filteredExams.length)} of{" "}
                      {filteredExams.length}
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Exam</DialogTitle>
                <DialogDescription>
                  Update exam details and settings.
                </DialogDescription>
              </DialogHeader>
              {editingExam && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-exam-name">Exam Name *</Label>
                    <Input
                      id="edit-exam-name"
                      value={editingExam.name}
                      onChange={(e) =>
                        setEditingExam({ ...editingExam, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingExam.status}
                      onValueChange={(value: "Active" | "Inactive") =>
                        setEditingExam({ ...editingExam, status: value })
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
                  <div className="grid gap-2">
                    <Label htmlFor="edit-card-image">
                      Card Image URL (Optional)
                    </Label>
                    <Input
                      id="edit-card-image"
                      value={editingExam.cardImageUrl || ""}
                      onChange={(e) =>
                        setEditingExam({
                          ...editingExam,
                          cardImageUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Card Descriptions (Max 4 items - Optional)</Label>
                    {(editingExam.descriptions || ["", "", "", ""]).map(
                      (desc, index) => (
                        <Input
                          key={index}
                          placeholder={`Description item ${index + 1}`}
                          value={desc}
                          onChange={(e) => {
                            const newDescriptions = [
                              ...(editingExam.descriptions || ["", "", "", ""]),
                            ];
                            newDescriptions[index] = e.target.value;
                            setEditingExam({
                              ...editingExam,
                              descriptions: newDescriptions,
                            });
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditExam} disabled={editSaving}>
                  {editSaving ? "Saving…" : "Update Exam"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the exam &quot;
                  <span className="capitalize">{examToDelete?.name}</span>
                  &quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={cancelDeleteExam}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteExam}
                  disabled={deleteSaving}
                >
                  {deleteSaving ? "Deleting…" : "Delete Exam"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
