"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/titleCase";
import type { ContentLevel, LevelWiseDirectDetailsPageProps } from "./level-wise-direct-details-page";

const LEVEL_NAMES: Record<ContentLevel, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

interface ResolvedScope {
  examId: string | null;
  subjectId: string | null;
  unitId: string | null;
  chapterId: string | null;
  topicId: string | null;
  subtopicId: string | null;
  definitionId: string | null;
}

function initialScope(p: LevelWiseDirectDetailsPageProps): ResolvedScope {
  return {
    examId: p.examId ?? null,
    subjectId: p.subjectId ?? null,
    unitId: p.unitId ?? null,
    chapterId: p.chapterId ?? null,
    topicId: p.topicId ?? null,
    subtopicId: p.subtopicId ?? null,
    definitionId: p.definitionId ?? null,
  };
}

interface FlashcardDeck {
  id: string;
  title: string;
  slug?: string;
  level: number;
  levelName?: string;
  orderNumber: number;
  status: string;
  visits?: number;
  today?: number;
}

interface FlashcardCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  orderNumber: number;
}

function buildFlashcardQueryParams(level: ContentLevel, scope: ResolvedScope): string {
  const p = new URLSearchParams();
  p.set("level", String(level));
  p.set("status", "Active");
  p.set("limit", "100");
  if (scope.examId) p.set("examId", scope.examId);
  if (scope.subjectId) p.set("subjectId", scope.subjectId);
  if (scope.unitId) p.set("unitId", scope.unitId);
  if (scope.chapterId) p.set("chapterId", scope.chapterId);
  if (scope.topicId) p.set("topicId", scope.topicId);
  if (scope.subtopicId) p.set("subtopicId", scope.subtopicId);
  if (scope.definitionId) p.set("definitionId", scope.definitionId);
  return p.toString();
}

function buildCreateDeckPayload(
  level: ContentLevel,
  scope: ResolvedScope,
  title: string,
  description: string
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    examId: scope.examId,
    level,
    title: toTitleCase(title.trim()),
    description: description.trim(),
    status: "Active",
  };
  if (level >= 2 && scope.subjectId) body.subjectId = scope.subjectId;
  if (level >= 3 && scope.unitId) body.unitId = scope.unitId;
  if (level >= 4 && scope.chapterId) body.chapterId = scope.chapterId;
  if (level >= 5 && scope.topicId) body.topicId = scope.topicId;
  if (level >= 6 && scope.subtopicId) body.subtopicId = scope.subtopicId;
  if (level >= 7 && scope.definitionId) body.definitionId = scope.definitionId;
  return body;
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const textareaClass =
  "min-h-[72px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function LevelWiseDirectDetailsPageFlashcard(
  props: LevelWiseDirectDetailsPageProps
) {
  const { level } = props;
  const levelName = LEVEL_NAMES[level] ?? "Content";

  const [resolvedScope, setResolvedScope] = React.useState<ResolvedScope>(() =>
    initialScope(props)
  );
  const [decks, setDecks] = React.useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedDecks, setExpandedDecks] = React.useState<Set<string>>(new Set());
  const [deckCardsCache, setDeckCardsCache] = React.useState<Record<string, FlashcardCard[]>>({});
  const [loadingCardsDeckId, setLoadingCardsDeckId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setResolvedScope(initialScope(props));
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
          }
        }
        if (scope.subtopicId && !scope.topicId) {
          const res = await fetch(`/api/subtopics/${scope.subtopicId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.topicId = d.topicId ?? null;
          }
        }
        if (scope.topicId && !scope.chapterId) {
          const res = await fetch(`/api/topics/${scope.topicId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.chapterId = d.chapterId ?? null;
          }
        }
        if (scope.chapterId && !scope.unitId) {
          const res = await fetch(`/api/chapters/${scope.chapterId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.unitId = d.unitId ?? null;
          }
        }
        if (scope.unitId && !scope.subjectId) {
          const res = await fetch(`/api/units/${scope.unitId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.subjectId = d.subjectId ?? null;
          }
        }
        if (scope.subjectId && !scope.examId) {
          const res = await fetch(`/api/subjects/${scope.subjectId}`);
          if (cancelled) return;
          if (res.ok) {
            const d = await res.json();
            scope.examId = d.examId ?? null;
          }
        }
        if (!cancelled) {
          setResolvedScope((s) => ({
            examId: scope.examId ?? s.examId,
            subjectId: scope.subjectId ?? s.subjectId,
            unitId: scope.unitId ?? s.unitId,
            chapterId: scope.chapterId ?? s.chapterId,
            topicId: scope.topicId ?? s.topicId,
            subtopicId: scope.subtopicId ?? s.subtopicId,
            definitionId: scope.definitionId ?? s.definitionId,
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

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [deckTitle, setDeckTitle] = React.useState("");
  const [deckDescription, setDeckDescription] = React.useState("");
  const [cardSlots, setCardSlots] = React.useState<{ front: string; back: string }[]>([
    { front: "", back: "" },
  ]);

  const [addCardOpenDeckId, setAddCardOpenDeckId] = React.useState<string | null>(null);
  const [newCardSlots, setNewCardSlots] = React.useState<{ front: string; back: string }[]>([
    { front: "", back: "" },
  ]);
  const [savingCardsDeckId, setSavingCardsDeckId] = React.useState<string | null>(null);

  const [editingCardId, setEditingCardId] = React.useState<string | null>(null);
  const [editCardForm, setEditCardForm] = React.useState({ front: "", back: "" });
  const [savingEditCardId, setSavingEditCardId] = React.useState<string | null>(null);

  const query = buildFlashcardQueryParams(level, resolvedScope);
  const hasScope =
    resolvedScope.examId ||
    resolvedScope.subjectId ||
    resolvedScope.unitId ||
    resolvedScope.chapterId ||
    resolvedScope.topicId ||
    resolvedScope.subtopicId ||
    resolvedScope.definitionId;

  React.useEffect(() => {
    if (!hasScope) {
      setDecks([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/level-wise-flashcards?${query}`)
      .then((res) => (!cancelled && res.ok ? res.json() : { decks: [] }))
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data.decks) ? data.decks : [];
          setDecks(list);
        }
      })
      .catch(() => {
        if (!cancelled) setDecks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, hasScope]);

  const ensureDeckCards = React.useCallback((deckId: string) => {
    if (deckCardsCache[deckId] !== undefined) return;
    setLoadingCardsDeckId(deckId);
    fetch(`/api/level-wise-flashcards/${deckId}/cards`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDeckCardsCache((prev) => ({ ...prev, [deckId]: list }));
      })
      .catch(() => setDeckCardsCache((prev) => ({ ...prev, [deckId]: [] })))
      .finally(() => setLoadingCardsDeckId(null));
  }, [deckCardsCache]);

  const toggleDeckExpanded = React.useCallback((deckId: string, open: boolean) => {
    setExpandedDecks((prev) => {
      const next = new Set(prev);
      if (open) next.add(deckId);
      else next.delete(deckId);
      return next;
    });
  }, []);

  const createDeckAndCards = async () => {
    const title = deckTitle.trim();
    if (!title) {
      toast.error("Deck title is required");
      return;
    }
    if (!resolvedScope.examId) {
      toast.error("Exam could not be resolved. Create from Exam or Subject page.");
      return;
    }
    const slotsToCreate = cardSlots.filter(
      (s) => (s.front ?? "").trim() || (s.back ?? "").trim()
    );
    setCreateSaving(true);
    try {
      const body = buildCreateDeckPayload(level, resolvedScope, title, deckDescription);
      const deckRes = await fetch("/api/level-wise-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!deckRes.ok) {
        const err = await deckRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to create deck");
      }
      const deck = await deckRes.json();
      const deckId = deck.id as string;

      const createdCards: FlashcardCard[] = [];
      for (let i = 0; i < slotsToCreate.length; i++) {
        const s = slotsToCreate[i];
        const front = (s.front ?? "").trim() || "(empty)";
        const back = (s.back ?? "").trim() || "(empty)";
        const cardRes = await fetch(`/api/level-wise-flashcards/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        });
        if (cardRes.ok) {
          const card = await cardRes.json();
          createdCards.push(card);
        }
      }

      setDeckCardsCache((prev) => ({ ...prev, [deckId]: createdCards }));
      setDecks((prev) =>
        [...prev, { ...deck, orderNumber: deck.orderNumber ?? prev.length }].sort(
          (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
        )
      );
      setCreateOpen(false);
      setDeckTitle("");
      setDeckDescription("");
      setCardSlots([{ front: "", back: "" }]);
      setExpandedDecks((prev) => new Set(prev).add(deckId));
      toast.success(
        slotsToCreate.length > 0
          ? `Deck created with ${slotsToCreate.length} card(s)`
          : "Deck created. Add cards by expanding it below."
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreateSaving(false);
    }
  };

  const addCardSlot = () => {
    setCardSlots((prev) => [...prev, { front: "", back: "" }]);
  };

  const removeCardSlot = (index: number) => {
    setCardSlots((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const openAddCards = (deckId: string) => {
    setAddCardOpenDeckId(deckId);
    setNewCardSlots([{ front: "", back: "" }]);
  };

  const addNewCardSlots = () => {
    setNewCardSlots((prev) => [...prev, { front: "", back: "" }]);
  };

  const saveNewCards = async (deckId: string) => {
    const toCreate = newCardSlots.filter(
      (s) => (s.front ?? "").trim() || (s.back ?? "").trim()
    );
    if (toCreate.length === 0) {
      toast.error("Add at least one card (front or back)");
      return;
    }
    setSavingCardsDeckId(deckId);
    try {
      const current = deckCardsCache[deckId] ?? [];
      const added: FlashcardCard[] = [];
      for (const s of toCreate) {
        const front = (s.front ?? "").trim() || "(empty)";
        const back = (s.back ?? "").trim() || "(empty)";
        const res = await fetch(`/api/level-wise-flashcards/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        });
        if (res.ok) {
          const card = await res.json();
          added.push(card);
        }
      }
      const newList = [...current, ...added].sort((a, b) => a.orderNumber - b.orderNumber);
      setDeckCardsCache((prev) => ({ ...prev, [deckId]: newList }));
      setAddCardOpenDeckId(null);
      setNewCardSlots([{ front: "", back: "" }]);
      toast.success(`${added.length} card(s) added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add cards");
    } finally {
      setSavingCardsDeckId(null);
    }
  };

  const openEditCard = (card: FlashcardCard) => {
    setEditingCardId(card.id);
    setEditCardForm({ front: card.front ?? "", back: card.back ?? "" });
  };

  const saveEditCard = async (deckId: string) => {
    if (!editingCardId) return;
    const front = (editCardForm.front ?? "").trim() || "(empty)";
    const back = (editCardForm.back ?? "").trim() || "(empty)";
    setSavingEditCardId(editingCardId);
    try {
      const res = await fetch(
        `/api/level-wise-flashcards/${deckId}/cards/${editingCardId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setDeckCardsCache((prev) => ({
        ...prev,
        [deckId]: (prev[deckId] ?? []).map((c) =>
          c.id === editingCardId ? { ...c, ...updated } : c
        ),
      }));
      setEditingCardId(null);
      setEditCardForm({ front: "", back: "" });
      toast.success("Card updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingEditCardId(null);
    }
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    try {
      const res = await fetch(
        `/api/level-wise-flashcards/${deckId}/cards/${cardId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      setDeckCardsCache((prev) => ({
        ...prev,
        [deckId]: (prev[deckId] ?? []).filter((c) => c.id !== cardId),
      }));
      toast.success("Card deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const truncate = (text: string, max: number) =>
    (text ?? "").length <= max ? (text ?? "") : (text ?? "").slice(0, max).trim() + "…";

  return (
    <>
      <Card className="overflow-hidden border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/80 p-6 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <BookOpen className="h-5 w-5 text-primary" />
                Level-Wise Flashcard Decks for this {levelName}
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-muted-foreground">
                Create a deck and add front/back cards here, or open a deck to manage cards in Practice Management.
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
                New deck
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
          ) : (
            <div className="space-y-4">
              {/* Create form must show when createOpen even if decks.length === 0 (was only inside decks.length > 0 branch before) */}
              {createOpen && (
                <Card className="border-2 border-primary/20 bg-muted/10">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base">New deck and cards</CardTitle>
                    <CardDescription className="text-xs">
                      Enter deck title and add at least one card (front/back). You can add more cards after creating.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4 pt-0">
                    <div className="grid gap-2">
                      <Label>Deck title *</Label>
                      <Input
                        className={inputClass}
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        placeholder="e.g. NEET Physics Terms"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description (optional)</Label>
                      <Input
                        className={inputClass}
                        value={deckDescription}
                        onChange={(e) => setDeckDescription(e.target.value)}
                        placeholder="Short description"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Cards</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addCardSlot}>
                          <Plus className="mr-1.5 h-4 w-4" />
                          Add card
                        </Button>
                      </div>
                      {cardSlots.map((slot, idx) => (
                        <Card key={idx} className="border border-border/80 p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <Label className="text-xs">Front</Label>
                              <Textarea
                                className={textareaClass}
                                rows={2}
                                value={slot.front}
                                onChange={(e) =>
                                  setCardSlots((prev) => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], front: e.target.value };
                                    return next;
                                  })
                                }
                                placeholder="Term or question"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Back</Label>
                              <Textarea
                                className={textareaClass}
                                rows={2}
                                value={slot.back}
                                onChange={(e) =>
                                  setCardSlots((prev) => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], back: e.target.value };
                                    return next;
                                  })
                                }
                                placeholder="Definition or answer"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCardSlot(idx)}
                              disabled={cardSlots.length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                      <Button onClick={createDeckAndCards} disabled={createSaving}>
                        {createSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create deck and cards
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreateOpen(false);
                          setDeckTitle("");
                          setDeckDescription("");
                          setCardSlots([{ front: "", back: "" }]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {decks.length === 0 && !createOpen && (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No flashcard deck for this {levelName.toLowerCase()} yet.
                  </p>
                  <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create first deck
                  </Button>
                </div>
              )}

              {/* List of decks */}
              {decks.length > 0 && (
              <div className="space-y-2">
                {[...decks]
                  .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
                  .map((deck) => {
                    const isOpen = expandedDecks.has(deck.id);
                    const cards = deckCardsCache[deck.id] ?? [];
                    const sortedCards = [...cards].sort((a, b) => a.orderNumber - b.orderNumber);
                    const isAddCardOpen = addCardOpenDeckId === deck.id;
                    const newSlots = addCardOpenDeckId === deck.id ? newCardSlots : [];

                    return (
                      <Collapsible
                        key={deck.id}
                        open={isOpen}
                        onOpenChange={(open) => {
                          toggleDeckExpanded(deck.id, open);
                          if (open) ensureDeckCards(deck.id);
                        }}
                      >
                        <Card className="overflow-hidden border-border">
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {isOpen ? (
                                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground">
                                  {toTitleCase(deck.title)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {sortedCards.length} card{sortedCards.length !== 1 ? "s" : ""}
                                  {(deck.visits != null && deck.visits > 0) || (deck.today != null && deck.today > 0)
                                    ? ` · ${deck.visits ?? 0} visit${(deck.visits ?? 0) !== 1 ? "s" : ""}${(deck.today ?? 0) > 0 ? ` (${deck.today} today)` : ""}`
                                    : ""}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link
                                  href={`/practice-management/flashcards/${deck.id}/cards`}
                                  title="Open in Practice Management"
                                >
                                  <BookOpen className="h-4 w-4" />
                                </Link>
                              </Button>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                              {loadingCardsDeckId === deck.id ? (
                                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span className="text-sm">Loading cards…</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
                                    <h4 className="text-sm font-semibold">
                                      Cards ({sortedCards.length})
                                    </h4>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/practice-management/flashcards/${deck.id}/cards`}>
                                          Open in Practice Management
                                        </Link>
                                      </Button>
                                      {!isAddCardOpen ? (
                                        <Button
                                          size="sm"
                                          className="gap-1.5"
                                          onClick={() => openAddCards(deck.id)}
                                        >
                                          <Plus className="h-4 w-4" />
                                          Add card
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>

                                  {/* Inline add cards form */}
                                  {isAddCardOpen && (
                                    <Card className="border-2 border-primary/20 bg-background p-4">
                                      <div className="space-y-3">
                                        {newSlots.map((slot, idx) => (
                                          <div key={idx} className="grid gap-2 sm:grid-cols-2">
                                            <div>
                                              <Label className="text-xs">Front</Label>
                                              <Textarea
                                                className={textareaClass}
                                                rows={2}
                                                value={slot.front}
                                                onChange={(e) => {
                                                  const next = [...newSlots];
                                                  next[idx] = { ...next[idx], front: e.target.value };
                                                  setNewCardSlots(next);
                                                }}
                                                placeholder="Front"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-xs">Back</Label>
                                              <Textarea
                                                className={textareaClass}
                                                rows={2}
                                                value={slot.back}
                                                onChange={(e) => {
                                                  const next = [...newSlots];
                                                  next[idx] = { ...next[idx], back: e.target.value };
                                                  setNewCardSlots(next);
                                                }}
                                                placeholder="Back"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                        <div className="flex flex-wrap gap-2">
                                          <Button type="button" variant="outline" size="sm" onClick={addNewCardSlots}>
                                            <Plus className="mr-1.5 h-4 w-4" />
                                            Add another
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => saveNewCards(deck.id)}
                                            disabled={savingCardsDeckId === deck.id}
                                          >
                                            {savingCardsDeckId === deck.id && (
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Save cards
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setAddCardOpenDeckId(null);
                                              setNewCardSlots([{ front: "", back: "" }]);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  )}

                                  {sortedCards.length === 0 && !isAddCardOpen ? (
                                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                                      No cards yet. Click &quot;Add card&quot; or open in Practice Management to add
                                      cards.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {sortedCards.map((card) => (
                                        <Card key={card.id} className="border border-border/80 overflow-hidden">
                                          {editingCardId === card.id ? (
                                            <CardContent className="p-3 space-y-2">
                                              <Label className="text-xs">Front</Label>
                                              <Textarea
                                                className={textareaClass}
                                                rows={2}
                                                value={editCardForm.front}
                                                onChange={(e) =>
                                                  setEditCardForm((f) => ({ ...f, front: e.target.value }))
                                                }
                                              />
                                              <Label className="text-xs">Back</Label>
                                              <Textarea
                                                className={textareaClass}
                                                rows={2}
                                                value={editCardForm.back}
                                                onChange={(e) =>
                                                  setEditCardForm((f) => ({ ...f, back: e.target.value }))
                                                }
                                              />
                                              <div className="flex gap-2">
                                                <Button
                                                  size="sm"
                                                  onClick={() => saveEditCard(deck.id)}
                                                  disabled={savingEditCardId === card.id}
                                                >
                                                  {savingEditCardId === card.id && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                  )}
                                                  Save
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setEditingCardId(null);
                                                    setEditCardForm({ front: "", back: "" });
                                                  }}
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </CardContent>
                                          ) : (
                                            <CardContent className="p-3">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                  <div>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                      Front:{" "}
                                                    </span>
                                                    {truncate(card.front ?? "", 60)}
                                                  </div>
                                                  <div>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                      Back:{" "}
                                                    </span>
                                                    {truncate(card.back ?? "", 60)}
                                                  </div>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEditCard(card)}
                                                    title="Edit"
                                                  >
                                                    <Pencil className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => deleteCard(deck.id, card.id)}
                                                    title="Delete"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </CardContent>
                                          )}
                                        </Card>
                                      ))}
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
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
