"use client"

import React, { useState, useCallback, useEffect } from "react"
import {
  Folder,
  FolderOpen,
  Plus,
  Minus,
  ChevronsDownUp,
  ChevronsUpDown,
  BookOpen,
  FileText,
  Loader2,
} from "lucide-react"
import { toTitleCase } from "@/lib/titleCase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type SyllabusLevel = "subject" | "unit" | "chapter" | "topic" | "subtopic" | "definition"

export interface SyllabusNode {
  id: string
  name: string
  slug: string
  weightage?: number
  marks?: number
  level: SyllabusLevel
  units?: SyllabusNode[]
  chapters?: SyllabusNode[]
  topics?: SyllabusNode[]
  subtopics?: SyllabusNode[]
  definitions?: SyllabusNode[]
}

interface SyllabusTreeAdminProps {
  subjects: SyllabusNode[]
  savingId: string | null
  onSave: (id: string, level: SyllabusLevel, weightage: number | undefined, marks: number | undefined) => Promise<void>
}

function collectAllIds(subjects: SyllabusNode[]): Set<string> {
  const ids = new Set<string>()
  subjects.forEach((s) => {
    ids.add(`s-${s.id}`)
    s.units?.forEach((u) => {
      ids.add(`u-${u.id}`)
      u.chapters?.forEach((c) => {
        ids.add(`c-${c.id}`)
        c.topics?.forEach((t) => {
          ids.add(`t-${t.id}`)
          t.subtopics?.forEach((st) => {
            ids.add(`st-${st.id}`)
          })
        })
      })
    })
  })
  return ids
}

export function SyllabusTreeAdmin({ subjects, savingId, onSave }: SyllabusTreeAdminProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(subjects.map((s) => `s-${s.id}`)))

  const [localValues, setLocalValues] = useState<Record<string, { weightage: string; marks: string }>>({})

  useEffect(() => {
    const initial: Record<string, { weightage: string; marks: string }> = {}
    function visit(nodes: SyllabusNode[]) {
      nodes.forEach((n) => {
        initial[n.id] = {
          weightage: n.weightage != null ? String(n.weightage) : "",
          marks: n.marks != null ? String(n.marks) : "",
        }
        if (n.units?.length) visit(n.units)
        if (n.chapters?.length) visit(n.chapters)
        if (n.topics?.length) visit(n.topics)
        if (n.subtopics?.length) visit(n.subtopics)
        if (n.definitions?.length) visit(n.definitions)
      })
    }
    visit(subjects)
    setLocalValues(initial)
  }, [subjects])

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const expandAll = useCallback(() => setExpanded(collectAllIds(subjects)), [subjects])
  const collapseAll = useCallback(() => setExpanded(new Set(subjects.map((s) => `s-${s.id}`))), [subjects])

  const updateLocal = useCallback((id: string, field: "weightage" | "marks", value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }, [])

  const handleSave = useCallback(
    async (node: SyllabusNode) => {
      const w = localValues[node.id]?.weightage ?? ""
      const m = localValues[node.id]?.marks ?? ""
      const weightage = w === "" ? undefined : Number(w)
      const marks = m === "" ? undefined : Number(m)
      if (weightage !== undefined && (Number.isNaN(weightage) || weightage < 0)) return
      if (marks !== undefined && (Number.isNaN(marks) || marks < 0)) return
      await onSave(node.id, node.level, weightage, marks)
    },
    [localValues, onSave]
  )

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
          No syllabus items found for this exam. Add subjects from Self Study first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={expandAll}
          className="h-9 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronsDownUp className="h-4 w-4 mr-1.5" />
          Expand all
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={collapseAll}
          className="h-9 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronsUpDown className="h-3.5 w-3.5 mr-1.5" />
          Collapse all
        </Button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <SubjectBlock
            key={subject.id}
            subject={subject}
            expanded={expanded}
            onToggle={toggle}
            localValues={localValues}
            updateLocal={updateLocal}
            onSave={handleSave}
            savingId={savingId}
          />
        ))}
      </div>
    </div>
  )
}

/* ----- Subject: card block, folder icon, inputs + Update ----- */
function SubjectBlock({
  subject,
  expanded,
  onToggle,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  subject: SyllabusNode
  expanded: Set<string>
  onToggle: (id: string) => void
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  const id = `s-${subject.id}`
  const isExpanded = expanded.has(id)
  const hasChildren = (subject.units?.length ?? 0) > 0

  return (
    <div className="rounded-xl border border-border bg-muted/30 dark:bg-muted/20 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4 bg-background/50 dark:bg-background/30 flex-wrap">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
          {isExpanded ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
        </div>
        <span className="min-w-0 flex-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {toTitleCase(subject.name)}
        </span>
        <RowInputs
          nodeId={subject.id}
          localValues={localValues}
          updateLocal={updateLocal}
          onSave={() => onSave(subject)}
          saving={savingId === subject.id}
        />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="border-t border-border/60 bg-background/40 dark:bg-background/20">
          <div className="pl-6 sm:pl-7 pr-4 sm:pr-5 py-3.5 space-y-1">
            {subject.units!.map((unit) => (
              <UnitRow
                key={unit.id}
                unit={unit}
                expanded={expanded}
                onToggle={onToggle}
                localValues={localValues}
                updateLocal={updateLocal}
                onSave={onSave}
                savingId={savingId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RowInputs({
  nodeId,
  localValues,
  updateLocal,
  onSave,
  saving,
}: {
  nodeId: string
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <Input
        type="number"
        min={0}
        step={0.1}
        placeholder="Weight %"
        className="h-8 w-20 text-xs"
        value={localValues[nodeId]?.weightage ?? ""}
        onChange={(e) => updateLocal(nodeId, "weightage", e.target.value)}
      />
      <Input
        type="number"
        min={0}
        step={1}
        placeholder="Marks"
        className="h-8 w-16 text-xs"
        value={localValues[nodeId]?.marks ?? ""}
        onChange={(e) => updateLocal(nodeId, "marks", e.target.value)}
      />
      <Button size="sm" variant="secondary" className="h-8 px-2" onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
      </Button>
    </div>
  )
}

function UnitRow({
  unit,
  expanded,
  onToggle,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  unit: SyllabusNode
  expanded: Set<string>
  onToggle: (id: string) => void
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  const id = `u-${unit.id}`
  const isExpanded = expanded.has(id)
  const hasChildren = (unit.chapters?.length ?? 0) > 0

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2 flex-wrap">
        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <span className="min-w-0 flex-1 font-medium text-base text-slate-700 dark:text-slate-200">
          {toTitleCase(unit.name)}
        </span>
        <RowInputs
          nodeId={unit.id}
          localValues={localValues}
          updateLocal={updateLocal}
          onSave={() => onSave(unit)}
          saving={savingId === unit.id}
        />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/50 space-y-0.5">
          {unit.chapters!.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              expanded={expanded}
              onToggle={onToggle}
              localValues={localValues}
              updateLocal={updateLocal}
              onSave={onSave}
              savingId={savingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ChapterRow({
  chapter,
  expanded,
  onToggle,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  chapter: SyllabusNode
  expanded: Set<string>
  onToggle: (id: string) => void
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  const id = `c-${chapter.id}`
  const isExpanded = expanded.has(id)
  const hasChildren = (chapter.topics?.length ?? 0) > 0

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2 flex-wrap">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <span className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200">{toTitleCase(chapter.name)}</span>
        <RowInputs
          nodeId={chapter.id}
          localValues={localValues}
          updateLocal={updateLocal}
          onSave={() => onSave(chapter)}
          saving={savingId === chapter.id}
        />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/40 space-y-0.5">
          {chapter.topics!.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              expanded={expanded}
              onToggle={onToggle}
              localValues={localValues}
              updateLocal={updateLocal}
              onSave={onSave}
              savingId={savingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TopicRow({
  topic,
  expanded,
  onToggle,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  topic: SyllabusNode
  expanded: Set<string>
  onToggle: (id: string) => void
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  const id = `t-${topic.id}`
  const isExpanded = expanded.has(id)
  const hasChildren = (topic.subtopics?.length ?? 0) > 0

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2 flex-wrap">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <span className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200">{toTitleCase(topic.name)}</span>
        <RowInputs
          nodeId={topic.id}
          localValues={localValues}
          updateLocal={updateLocal}
          onSave={() => onSave(topic)}
          saving={savingId === topic.id}
        />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/40 space-y-0.5">
          {topic.subtopics!.map((subtopic) => (
            <SubtopicRow
              key={subtopic.id}
              subtopic={subtopic}
              expanded={expanded}
              onToggle={onToggle}
              localValues={localValues}
              updateLocal={updateLocal}
              onSave={onSave}
              savingId={savingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SubtopicRow({
  subtopic,
  expanded,
  onToggle,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  subtopic: SyllabusNode
  expanded: Set<string>
  onToggle: (id: string) => void
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  const id = `st-${subtopic.id}`
  const isExpanded = expanded.has(id)
  const hasChildren = (subtopic.definitions?.length ?? 0) > 0

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2 sm:gap-3 py-2 flex-wrap">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
        <span className="min-w-0 flex-1 text-base text-slate-700 dark:text-slate-200">{toTitleCase(subtopic.name)}</span>
        <RowInputs
          nodeId={subtopic.id}
          localValues={localValues}
          updateLocal={updateLocal}
          onSave={() => onSave(subtopic)}
          saving={savingId === subtopic.id}
        />
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-0.5 border-l border-border/30 space-y-0.5">
          {subtopic.definitions!.map((def) => (
            <DefinitionRow
              key={def.id}
              definition={def}
              localValues={localValues}
              updateLocal={updateLocal}
              onSave={onSave}
              savingId={savingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DefinitionRow({
  definition,
  localValues,
  updateLocal,
  onSave,
  savingId,
}: {
  definition: SyllabusNode
  localValues: Record<string, { weightage: string; marks: string }>
  updateLocal: (id: string, field: "weightage" | "marks", value: string) => void
  onSave: (node: SyllabusNode) => Promise<void>
  savingId: string | null
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 pr-2 flex-wrap">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
        <FileText className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-base text-slate-600 dark:text-slate-300">{toTitleCase(definition.name)}</span>
      <RowInputs
        nodeId={definition.id}
        localValues={localValues}
        updateLocal={updateLocal}
        onSave={() => onSave(definition)}
        saving={savingId === definition.id}
      />
    </div>
  )
}
