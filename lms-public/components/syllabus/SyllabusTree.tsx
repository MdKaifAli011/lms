"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  Folder,
  FolderOpen,
  Plus,
  Minus,
  ChevronsDownUp,
  ChevronsUpDown,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/titleCase";
import { Button } from "@/components/ui/button";
import type {
  SyllabusSubject,
  SyllabusUnit,
  SyllabusChapter,
  SyllabusTopic,
  SyllabusSubtopic,
  SyllabusDefinition,
} from "@/lib/buildHierarchy";

/** Weight & marks display: no background, clean text only. */
function WeightMarks({ weightage, marks, className }: { weightage?: number; marks?: number; className?: string }) {
  const label = `Weight: ${weightage != null ? `${weightage}%` : "—"}, Marks: ${marks != null ? marks : "—"}`;
  return (
    <span
      className={cn("shrink-0 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap", className)}
      title={label}
    >
      {label}
    </span>
  );
}

interface SyllabusTreeProps {
  examSlug: string;
  examName: string;
  subjects: SyllabusSubject[];
}

export function SyllabusTree({ examSlug, examName, subjects }: SyllabusTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(subjects.map((s) => `s-${s.id}`)));

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const ids = new Set<string>();
    subjects.forEach((s) => {
      ids.add(`s-${s.id}`);
      s.units.forEach((u) => {
        ids.add(`u-${u.id}`);
        u.chapters.forEach((c) => {
          ids.add(`c-${c.id}`);
          c.topics.forEach((t) => {
            ids.add(`t-${t.id}`);
            t.subtopics.forEach((st) => ids.add(`st-${st.id}`));
          });
        });
      });
    });
    setExpanded(ids);
  }, [subjects]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set(subjects.map((s) => `s-${s.id}`)));
  }, [subjects]);

  if (subjects.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 dark:bg-muted/20 p-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Syllabus coming soon</h3>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The full syllabus for {examName} is being prepared. Check back later or explore by subject from the exam page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={expandAll} className="h-9 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          <ChevronsDownUp className="h-4 w-4 mr-1.5" />
          Expand all
        </Button>
        <Button variant="ghost" size="sm" onClick={collapseAll} className="h-9 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          <ChevronsUpDown className="h-3.5 w-3.5 mr-1.5" />
          Collapse all
        </Button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <SubjectBlock
            key={subject.id}
            examSlug={examSlug}
            subject={subject}
            expanded={expanded}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}

/* ----- Subject: card block, yellow folder, plus/minus on right ----- */
function SubjectBlock({
  examSlug,
  subject,
  expanded,
  onToggle,
}: {
  examSlug: string;
  subject: SyllabusSubject;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const id = `s-${subject.id}`;
  const isExpanded = expanded.has(id);
  const hasChildren = subject.units.length > 0;
  const href = `/exam/${examSlug}/${subject.slug || subject.id}`;

  return (
    <div className="rounded-xl border border-border bg-muted/30 dark:bg-muted/20 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4 bg-background/50 dark:bg-background/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-500 text-white shadow-sm">
          {isExpanded ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
        </div>
        <Link href={href} className="min-w-0 flex-1 text-lg font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:underline transition-colors">
          {toTitleCase(subject.name)}
        </Link>
        <WeightMarks weightage={subject.weightage} marks={subject.marks} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="border-t border-border/60 bg-background/40 dark:bg-background/20">
          <div className="pl-6 sm:pl-7 pr-4 sm:pr-5 py-3.5 space-y-1">
            {subject.units.map((unit) => (
              <UnitRow
                key={unit.id}
                examSlug={examSlug}
                subjectSlug={subject.slug || subject.id}
                unit={unit}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----- Unit: blue dot, plus/minus on right, indented ----- */
function UnitRow({
  examSlug,
  subjectSlug,
  unit,
  expanded,
  onToggle,
}: {
  examSlug: string;
  subjectSlug: string;
  unit: SyllabusUnit;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const id = `u-${unit.id}`;
  const isExpanded = expanded.has(id);
  const hasChildren = unit.chapters.length > 0;
  const href = `/exam/${examSlug}/${subjectSlug}/${unit.slug || unit.id}`;

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <Link href={href} className="min-w-0 flex-1 font-medium text-base text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:underline transition-colors">
          {toTitleCase(unit.name)}
        </Link>
        <WeightMarks weightage={unit.weightage} marks={unit.marks} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/50 space-y-0.5">
          {unit.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              examSlug={examSlug}
              subjectSlug={subjectSlug}
              unitSlug={unit.slug || unit.id}
              chapter={chapter}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Chapter: blue dot, plus/minus on right ----- */
function ChapterRow({
  examSlug,
  subjectSlug,
  unitSlug,
  chapter,
  expanded,
  onToggle,
}: {
  examSlug: string;
  subjectSlug: string;
  unitSlug: string;
  chapter: SyllabusChapter;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const id = `c-${chapter.id}`;
  const isExpanded = expanded.has(id);
  const hasChildren = chapter.topics.length > 0;
  const href = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapter.slug || chapter.id}`;

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <Link href={href} className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:underline transition-colors">
          {toTitleCase(chapter.name)}
        </Link>
        <WeightMarks weightage={chapter.weightage} marks={chapter.marks} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/40 space-y-0.5">
          {chapter.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              examSlug={examSlug}
              subjectSlug={subjectSlug}
              unitSlug={unitSlug}
              chapterSlug={chapter.slug || chapter.id}
              topic={topic}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Topic: blue dot, plus/minus on right ----- */
function TopicRow({
  examSlug,
  subjectSlug,
  unitSlug,
  chapterSlug,
  topic,
  expanded,
  onToggle,
}: {
  examSlug: string;
  subjectSlug: string;
  unitSlug: string;
  chapterSlug: string;
  topic: SyllabusTopic;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const id = `t-${topic.id}`;
  const isExpanded = expanded.has(id);
  const hasChildren = topic.subtopics.length > 0;
  const href = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topic.slug || topic.id}`;

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <Link href={href} className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:underline transition-colors">
          {toTitleCase(topic.name)}
        </Link>
        <WeightMarks weightage={topic.weightage} marks={topic.marks} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/40 space-y-0.5">
          {topic.subtopics.map((subtopic) => (
            <SubtopicRow
              key={subtopic.id}
              examSlug={examSlug}
              subjectSlug={subjectSlug}
              unitSlug={unitSlug}
              chapterSlug={chapterSlug}
              topicSlug={topic.slug || topic.id}
              subtopic={subtopic}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Subtopic: blue dot, plus/minus on right ----- */
function SubtopicRow({
  examSlug,
  subjectSlug,
  unitSlug,
  chapterSlug,
  topicSlug,
  subtopic,
  expanded,
  onToggle,
}: {
  examSlug: string;
  subjectSlug: string;
  unitSlug: string;
  chapterSlug: string;
  topicSlug: string;
  subtopic: SyllabusSubtopic;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const id = `st-${subtopic.id}`;
  const isExpanded = expanded.has(id);
  const hasChildren = subtopic.definitions.length > 0;
  const href = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopic.slug || subtopic.id}`;

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <Link href={href} className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:underline transition-colors">
          {toTitleCase(subtopic.name)}
        </Link>
        <WeightMarks weightage={subtopic.weightage} marks={subtopic.marks} />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/30 space-y-0.5">
          {subtopic.definitions.map((def) => (
            <DefinitionRow
              key={def.id}
              examSlug={examSlug}
              subjectSlug={subjectSlug}
              unitSlug={unitSlug}
              chapterSlug={chapterSlug}
              topicSlug={topicSlug}
              subtopicSlug={subtopic.slug || subtopic.id}
              definition={def}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Definition: icon + title (leaf). "Learn" / completion can be added later when student progress exists. ----- */
function DefinitionRow({
  examSlug,
  subjectSlug,
  unitSlug,
  chapterSlug,
  topicSlug,
  subtopicSlug,
  definition,
}: {
  examSlug: string;
  subjectSlug: string;
  unitSlug: string;
  chapterSlug: string;
  topicSlug: string;
  subtopicSlug: string;
  definition: SyllabusDefinition;
}) {
  const href = `/exam/${examSlug}/${subjectSlug}/${unitSlug}/${chapterSlug}/${topicSlug}/${subtopicSlug}/${definition.slug || definition.id}`;

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 pr-2">
      <Link
        href={href}
        className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" aria-hidden>
          <FileText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 text-base text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{toTitleCase(definition.name)}</span>
      </Link>
      <WeightMarks weightage={definition.weightage} marks={definition.marks} />
    </div>
  );
}
