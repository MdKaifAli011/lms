"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { toTitleCase } from "@/lib/titleCase";

const TRUNCATE_LEN = 80;

function truncate(s: string, len: number): string {
  if (!s || s.length <= len) return s;
  return s.slice(0, len).trim() + "…";
}

interface Deck {
  id: string;
  title: string;
  slug?: string;
  levelName?: string;
}

interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  orderNumber: number;
}

export default function FlashcardsCardsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ front: "", back: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ front: "", back: "" });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Flashcard | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid deck ID");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [deckRes, cardsRes] = await Promise.all([
          fetch(`/api/level-wise-flashcards/${id}`),
          fetch(`/api/level-wise-flashcards/${id}/cards`),
        ]);
        if (cancelled) return;
        if (!deckRes.ok) {
          setError("Deck not found");
          setDeck(null);
          setCards([]);
          setLoading(false);
          return;
        }
        const deckData = await deckRes.json();
        setDeck(deckData);
        const cardsData = await cardsRes.ok ? cardsRes.json() : [];
        setCards(Array.isArray(cardsData) ? cardsData : []);
        setError(null);
      } catch {
        if (!cancelled) setError("Failed to load data");
        if (!cancelled) setDeck(null);
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddCard = useCallback(async () => {
    const front = (form.front ?? "").trim();
    const back = (form.back ?? "").trim();
    if (!front && !back) {
      toast.error("Front or back text is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: front || "(empty)", back: back || "(empty)" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to create");
      }
      const created = await res.json();
      setCards((prev) => [...prev, created].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)));
      setForm({ front: "", back: "" });
      setShowAddForm(false);
      toast.success("Card added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add card");
    } finally {
      setSaving(false);
    }
  }, [id, form]);

  const openEdit = useCallback((card: Flashcard) => {
    setEditingId(card.id);
    setEditForm({ front: card.front ?? "", back: card.back ?? "" });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    const front = (editForm.front ?? "").trim();
    const back = (editForm.back ?? "").trim();
    if (!front && !back) {
      toast.error("Front or back text is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${id}/cards/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: front || "(empty)", back: back || "(empty)" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setCards((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
      );
      setEditingId(null);
      toast.success("Card updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }, [id, editingId, editForm]);

  const openDelete = useCallback((cardId: string) => {
    setDeleteTargetId(cardId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${id}/cards/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCards((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      toast.success("Card deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteSaving(false);
    }
  }, [id, deleteTargetId]);

  const sortedCards = [...cards].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

  const handleDragStart = useCallback((_e: React.DragEvent, card: Flashcard) => {
    setDraggedCard(card);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((cardId: string) => {
    if (!draggedCard || draggedCard.id === cardId) return;
    setDragOverId(cardId);
  }, [draggedCard]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: Flashcard) => {
      e.preventDefault();
      setDragOverId(null);
      setDraggedCard(null);
      if (!isReorderMode || !draggedCard || draggedCard.id === target.id) return;
      const fromIdx = sortedCards.findIndex((c) => c.id === draggedCard.id);
      const toIdx = sortedCards.findIndex((c) => c.id === target.id);
      if (fromIdx === -1 || toIdx === -1) return;
      const reordered = sortedCards.slice();
      const [removed] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, removed);
      setCards(
        reordered.map((c, i) => ({ ...c, orderNumber: i + 1 }))
      );
    },
    [isReorderMode, draggedCard, sortedCards]
  );

  const saveOrder = useCallback(async () => {
    const order = sortedCards.map((c, i) => ({ id: c.id, orderNumber: i + 1 }));
    setSavingOrder(true);
    try {
      const res = await fetch(`/api/level-wise-flashcards/${id}/cards/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error("Failed to save order");
      toast.success("Order saved");
      setIsReorderMode(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  }, [id, sortedCards]);

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

  if (error || !deck) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-destructive">{error ?? "Deck not found"}</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/practice-management/flashcards">Back to Level-Wise Flashcards</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      {/* Delete confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !open && !deleteSaving && (setDeleteDialogOpen(false), setDeleteTargetId(null))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete card?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This card will be removed from the deck. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setDeleteDialogOpen(false), setDeleteTargetId(null))} disabled={deleteSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteSaving}>
              {deleteSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit card dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Front</Label>
              <Textarea
                value={editForm.front}
                onChange={(e) => setEditForm((prev) => ({ ...prev, front: e.target.value }))}
                placeholder="Front of card"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Back</Label>
              <Textarea
                value={editForm.back}
                onChange={(e) => setEditForm((prev) => ({ ...prev, back: e.target.value }))}
                placeholder="Back of card"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-2 min-w-0">
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
                <BreadcrumbLink href="/practice-management/flashcards">Level-Wise Flashcards</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/practice-management/flashcards/${id}/cards`}>
                  {toTitleCase(deck.title)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Cards</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="ghost" size="icon" asChild title="Back to Level-Wise Flashcards">
          <Link href="/practice-management/flashcards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto min-h-0">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base">{toTitleCase(deck.title)}</CardTitle>
            <CardDescription className="text-sm">
              {deck.levelName && `${deck.levelName} · `}
              <span className="font-medium text-foreground">
                {cards.length} card{cards.length !== 1 ? "s" : ""}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Cards</h3>
              <div className="flex items-center gap-2">
                {cards.length > 0 && (
                  <>
                    {!isReorderMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReorderMode(true)}
                        title="Enable drag-and-drop to reorder"
                      >
                        <GripVertical className="mr-1.5 h-4 w-4" />
                        Reorder
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={saveOrder} disabled={savingOrder}>
                          {savingOrder && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                          Save order
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsReorderMode(false)}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
                <Button
                  size="sm"
                  onClick={() => {
                    setShowAddForm(true);
                    setForm({ front: "", back: "" });
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Card
                </Button>
              </div>
            </div>

            {/* Add card form */}
            {showAddForm && (
              <Card className="border-2 border-primary/20 bg-muted/10">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm">New Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 pt-0">
                  <div className="space-y-2">
                    <Label>Front</Label>
                    <Textarea
                      value={form.front}
                      onChange={(e) => setForm((prev) => ({ ...prev, front: e.target.value }))}
                      placeholder="Front of card"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Back</Label>
                    <Textarea
                      value={form.back}
                      onChange={(e) => setForm((prev) => ({ ...prev, back: e.target.value }))}
                      placeholder="Back of card"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddCard} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Card list */}
            {sortedCards.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No cards yet. Click &quot;Add Card&quot; to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedCards.map((card) => (
                  <Card
                    key={card.id}
                    draggable={isReorderMode}
                    onDragStart={isReorderMode ? (e) => handleDragStart(e, card) : undefined}
                    onDragOver={handleDragOver}
                    onDragEnter={isReorderMode ? () => handleDragEnter(card.id) : undefined}
                    onDragLeave={handleDragLeave}
                    onDrop={isReorderMode ? (e) => handleDrop(e, card) : undefined}
                    className={`overflow-hidden transition-colors ${
                      isReorderMode ? "cursor-grab active:cursor-grabbing" : ""
                    } ${dragOverId === card.id ? "border-2 border-primary/40 bg-primary/5" : ""} ${
                      draggedCard?.id === card.id ? "opacity-50" : ""
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3 items-start">
                        <div className="flex shrink-0 items-center gap-2 pt-0.5">
                          {isReorderMode ? (
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                              {card.orderNumber}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Front: </span>
                            {truncate(card.front ?? "", TRUNCATE_LEN)}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Back: </span>
                            {truncate(card.back ?? "", TRUNCATE_LEN)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(card)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDelete(card.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
