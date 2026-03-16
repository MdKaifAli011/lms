"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/titleCase";
import type { HierarchySubject } from "@/lib/buildHierarchy";

type HierarchyLevel = "subject" | "unit" | "chapter" | "topic";

const LEVEL_COLORS: Record<
  HierarchyLevel,
  {
    text: string;
    textActive: string;
    bg: string;
    bgHover: string;
    border: string;
    dot: string;
  }
> = {
  subject: {
    text: "text-blue-700 dark:text-blue-300",
    textActive: "text-blue-900 dark:text-blue-100",
    bg: "bg-blue-50/80 dark:bg-blue-950/30",
    bgHover: "hover:bg-blue-50 dark:hover:bg-blue-950/50",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
  unit: {
    text: "text-blue-700 dark:text-blue-300",
    textActive: "text-blue-900 dark:text-blue-100",
    bg: "bg-blue-50/80 dark:bg-blue-950/30",
    bgHover: "hover:bg-blue-50 dark:hover:bg-blue-950/50",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
  chapter: {
    text: "text-amber-700 dark:text-amber-300",
    textActive: "text-amber-900 dark:text-amber-100",
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    bgHover: "hover:bg-amber-50 dark:hover:bg-amber-950/50",
    border: "border-amber-300 dark:border-amber-700",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
  topic: {
    text: "text-violet-700 dark:text-violet-300",
    textActive: "text-violet-900 dark:text-violet-100",
    bg: "bg-violet-50/80 dark:bg-violet-950/30",
    bgHover: "hover:bg-violet-50 dark:hover:bg-violet-950/50",
    border: "border-violet-300 dark:border-violet-700",
    dot: "bg-violet-600 dark:bg-violet-400",
  },
};

interface HierarchySidebarProps {
  examSlug: string;
  subjects: HierarchySubject[];
  isOpen?: boolean;
  onClose?: () => void;
  /** When true (desktop), sidebar is in-flow and sticky so page scroll reveals footer after main content. */
  sticky?: boolean;
}

function getLabel(node: { name?: string; title?: string }): string {
  const raw = node.name ?? (node as { title?: string }).title ?? "";
  return toTitleCase(raw);
}

export function HierarchySidebar({
  examSlug,
  subjects,
  isOpen = true,
  onClose,
  sticky = false,
}: HierarchySidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set());
  const defaultExpandedRef = useRef(false);

  /** When user chose Quiz or Flashcards from right sidebar, left menu links go to .../quiz or .../flashcards. */
  const isQuizPage = useMemo(() => {
    const parts = pathname?.split("/").filter(Boolean) ?? [];
    return parts[parts.length - 1] === "quiz";
  }, [pathname]);
  const isFlashcardsPage = useMemo(() => {
    const parts = pathname?.split("/").filter(Boolean) ?? [];
    return parts[parts.length - 1] === "flashcards";
  }, [pathname]);

  const quizSuffix = isQuizPage
    ? "/quiz"
    : isFlashcardsPage
      ? "/flashcards"
      : "";

  /** Active segment from path; strip /quiz and /flashcards so content/quiz/flashcards for same level all highlight. */
  const active = useMemo(() => {
    const pathStripped =
      pathname?.replace(/\/quiz\/?$/, "").replace(/\/flashcards\/?$/, "") ?? "";
    const parts = pathStripped.split("/").filter(Boolean);
    const i = parts.indexOf("exam");
    return {
      subject: parts[i + 2],
      unit: parts[i + 3],
      chapter: parts[i + 4],
      topic: parts[i + 5],
    };
  }, [pathname]);

  const orderedSubjects = useMemo(() => {
    if (!active.subject) return subjects;
    const idx = subjects.findIndex(
      (s) => s.slug === active.subject || s.id === active.subject,
    );
    if (idx === -1) return subjects;
    return [subjects[idx], ...subjects.filter((_, i) => i !== idx)];
  }, [subjects, active.subject]);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (isMobile && onClose) onClose();
    }
  }, [pathname, isMobile, onClose]);

  useEffect(() => {
    if (active.subject || defaultExpandedRef.current || !subjects?.length)
      return;
    const s = subjects[0];
    const next = new Set<string>();
    if (s?.id) next.add(`subject-${s.id}`);
    if (s?.units?.[0]?.id) next.add(`unit-${s.units[0].id}`);
    setManualExpanded(next);
    defaultExpandedRef.current = true;
  }, [subjects, active.subject]);

  const toggle = (id: string) => {
    setManualExpanded((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const expanded = (id: string, auto: boolean) =>
    auto || manualExpanded.has(id);

  const visibleSubjects = useMemo(() => {
    if (!searchQuery) return orderedSubjects;
    const q = searchQuery.toLowerCase();
    return orderedSubjects.filter((s) =>
      [
        s.name,
        ...(s.units?.flatMap((u) => [
          u.name,
          ...(u.chapters?.flatMap((c) => [
            c.name,
            ...(c.topics?.map((t) => t.name) ?? []),
          ]) ?? []),
        ]) ?? []),
      ].some((x) => x?.toLowerCase().includes(q)),
    );
  }, [orderedSubjects, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[45] backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "overflow-y-auto border-r bg-background/95 backdrop-blur-sm border-border scrollbar-hide w-80 shrink-0",
          isMobile
            ? "fixed left-0 top-[80px] sm:top-[92px] h-[calc(100vh-80px)] sm:h-[calc(100vh-92px)] z-50"
            : sticky
              ? "sticky top-[80px] sm:top-[92px] h-[calc(100vh-80px)] sm:h-[calc(100vh-92px)] z-30 self-start"
              : "fixed left-0 top-[80px] sm:top-[92px] h-[calc(100vh-80px)] sm:h-[calc(100vh-92px)] z-30",
        )}
      >
        <div className="px-4 py-5 space-y-5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syllabus..."
              className="h-10 pl-9 pr-9 text-sm bg-muted/50 border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <nav className="space-y-2" aria-label="Syllabus navigation">
            {visibleSubjects.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              visibleSubjects.map((subject) => {
                const subjectSlug = subject.slug || subject.id;
                const subjectActive = subjectSlug === active.subject;
                const subjectId = `subject-${subject.id}`;
                return (
                  <div key={subject.id} className="space-y-2">
                    <BranchRow
                      level="subject"
                      href={`/exam/${examSlug}/${subjectSlug}${quizSuffix}`}
                      label={getLabel(subject)}
                      active={subjectActive}
                      expanded={expanded(subjectId, subjectActive)}
                      onToggle={
                        subject.units?.length
                          ? () => toggle(subjectId)
                          : undefined
                      }
                      hasLeadingCircle={false}
                    />
                    {expanded(subjectId, subjectActive) &&
                    subject.units?.length ? (
                      <div className="relative ml-3 pl-4 border-l-2 border-dashed border-border/60 space-y-2 mt-2">
                        {subject.units.map((unit) => {
                          const unitSlug = unit.slug || unit.id;
                          const unitActive = unitSlug === active.unit;
                          const unitId = `unit-${unit.id}`;
                          return (
                            <div key={unit.id} className="space-y-2">
                              <BranchRow
                                level="unit"
                                href={`/exam/${examSlug}/${subjectSlug}/${unitSlug}${quizSuffix}`}
                                label={getLabel(unit)}
                                active={unitActive}
                                expanded={expanded(unitId, unitActive)}
                                onToggle={
                                  unit.chapters?.length
                                    ? () => toggle(unitId)
                                    : undefined
                                }
                                hasLeadingCircle
                              />
                              {expanded(unitId, unitActive) &&
                              unit.chapters?.length ? (
                                <div className="relative ml-3 pl-4 border-l-2 border-dashed border-border/60 space-y-2 mt-2">
                                  {unit.chapters.map((chapter) => {
                                    const chapterSlug =
                                      chapter.slug || chapter.id;
                                    const chapterActive =
                                      chapterSlug === active.chapter;
                                    const chapterId = `chapter-${chapter.id}`;
                                    return (
                                      <div
                                        key={chapter.id}
                                        className="space-y-2"
                                      >
                                        <BranchRow
                                          level="chapter"
                                          href={`/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}${quizSuffix}`}
                                          label={getLabel(chapter)}
                                          active={chapterActive}
                                          expanded={expanded(
                                            chapterId,
                                            chapterActive,
                                          )}
                                          onToggle={
                                            chapter.topics?.length
                                              ? () => toggle(chapterId)
                                              : undefined
                                          }
                                          hasLeadingCircle
                                        />
                                        {expanded(chapterId, chapterActive) &&
                                        chapter.topics?.length ? (
                                          <div className="relative ml-3 pl-4 border-l-2 border-dashed border-border/60 space-y-1 mt-2">
                                            {chapter.topics.map(
                                              (topic, topicIdx) => {
                                                const topicSlug =
                                                  topic.slug || topic.id;
                                                const topicActive =
                                                  topicSlug === active.topic;
                                                const isLast =
                                                  topicIdx ===
                                                  chapter.topics!.length - 1;
                                                return (
                                                  <TopicRow
                                                    key={topic.id}
                                                    href={`/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}${quizSuffix}`}
                                                    label={toTitleCase(
                                                      topic.name,
                                                    )}
                                                    active={topicActive}
                                                    isLast={isLast}
                                                  />
                                                );
                                              },
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}

function BranchRow({
  level,
  href,
  label,
  active,
  expanded,
  onToggle,
  hasLeadingCircle,
}: {
  level: HierarchyLevel;
  href: string;
  label: string;
  active: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  hasLeadingCircle: boolean;
}) {
  const colors = LEVEL_COLORS[level];
  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 py-2.5 px-3 rounded-lg transition-all duration-200",
        level === "subject" && "font-semibold text-base",
        (level === "unit" || level === "chapter") && "font-medium text-sm",
        hasLeadingCircle && "-ml-4",
        active && colors.bg,
        !active && colors.bgHover,
        active && "ring-1 ring-border/50",
      )}
    >
      {hasLeadingCircle && (
        <span
          className={cn(
            "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 select-none pointer-events-none",
            colors.border,
            active ? cn(colors.dot, "border-transparent") : "bg-background",
          )}
          aria-hidden
        >
          {active && (
            <Check className="h-2.5 w-2.5 text-white dark:text-gray-900 stroke-3" />
          )}
        </span>
      )}
      <Link
        href={href}
        title={label}
        className={cn(
          "flex-1 min-w-0 truncate transition-all duration-200",
          active ? colors.textActive : colors.text,
          !active && "group-hover:translate-x-0.5",
        )}
      >
        {label}
      </Link>
      {onToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 bg-primary/10 hover:bg-primary/20 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      )}
    </div>
  );
}

function TopicRow({
  href,
  label,
  active,
  isLast,
}: {
  href: string;
  label: string;
  active: boolean;
  isLast: boolean;
}) {
  const colors = LEVEL_COLORS.topic;
  return (
    <div
      className={cn(
        "relative flex items-center py-2 min-h-[40px] -ml-4 pl-3",
        isLast && "pb-3",
      )}
    >
      <div
        className="absolute left-0 top-1/2 w-3.5 h-0 -translate-y-1/2 shrink-0 border-t border-dashed border-border/60"
        aria-hidden
      />
      <span
        className={cn(
          "relative z-1 shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 select-none pointer-events-none",
          colors.border,
          active ? cn(colors.dot, "border-transparent") : "bg-background",
        )}
        aria-hidden
      >
        {active && (
          <Check className="h-2 w-2 text-white dark:text-gray-900 stroke-3" />
        )}
      </span>
      <Link
        href={href}
        title={label}
        className={cn(
          "flex-1 min-w-0 py-2 pl-3 pr-2.5 rounded-md transition-all duration-200 truncate text-sm font-normal",
          active ? colors.textActive : colors.text,
          active ? colors.bg : colors.bgHover,
          !active && "hover:translate-x-0.5",
        )}
      >
        <span className="relative">
          {label}
          {active && (
            <span
              className={cn(
                "absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full",
                colors.dot,
              )}
              aria-hidden
            />
          )}
        </span>
      </Link>
    </div>
  );
}
