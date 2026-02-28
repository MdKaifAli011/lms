"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Search, Eye, Edit, Trash2, Power, Check, GripVertical, ArrowLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { capitalize } from "@/lib/utils"

const EXAMS_API = "/api/exams"
const SUBJECTS_API = "/api/subjects"
const UNITS_API = "/api/units"
const CHAPTERS_API = "/api/chapters"
const TOPICS_API = "/api/topics"
const SUBTOPICS_API = "/api/subtopics"
const DEFINITIONS_API = "/api/definitions"

type ExamOption = { id: string; name: string; status?: string }
type SubjectOption = { id: string; name: string; examId: string; status?: string; orderNumber?: number }
type UnitOption = { id: string; name: string; subjectId: string; status?: string; orderNumber?: number }
type ChapterOption = { id: string; unitId: string; name: string; orderNumber: number; status: string }
type TopicOption = { id: string; chapterId: string; name: string; orderNumber: number; status: string }
type SubTopicOption = { id: string; topicId: string; name: string; orderNumber: number; status: string }

type Definition = {
  id: string
  subtopicId: string
  name: string
  slug: string
  orderNumber: number
  content: string
  meta: string
  visits: number
  uniqueVisits: number
  today: number
  status: "Active" | "Inactive"
}

function uniqueNamesPerSubTopic(names: string[], existingNames: Set<string>): string[] {
  const seen = new Set(existingNames)
  const result: string[] = []
  for (const n of names) {
    const lower = n.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(n)
  }
  return result
}

export default function DefinitionsPage() {
  const [exams, setExams] = React.useState<ExamOption[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [units, setUnits] = React.useState<UnitOption[]>([])
  const [chapters, setChapters] = React.useState<ChapterOption[]>([])
  const [topics, setTopics] = React.useState<TopicOption[]>([])
  const [subTopics, setSubTopics] = React.useState<SubTopicOption[]>([])
  const [definitions, setDefinitions] = React.useState<Definition[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [examFilter, setExamFilter] = React.useState<string>("all")
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all")
  const [unitFilter, setUnitFilter] = React.useState<string>("all")
  const [chapterFilter, setChapterFilter] = React.useState<string>("all")
  const [topicFilter, setTopicFilter] = React.useState<string>("all")
  const [subTopicFilter, setSubTopicFilter] = React.useState<string>("all")
  const [metaFilter, setMetaFilter] = React.useState<"all" | "filled" | "not-filled">("all")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = React.useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null)
  const [addDefinitionRows, setAddDefinitionRows] = React.useState<{ subtopicId: string | null; definitionNames: string }[]>([
    { subtopicId: null, definitionNames: "" },
  ])

  const [editingDefinition, setEditingDefinition] = React.useState<Definition | null>(null)
  const [definitionToDelete, setDefinitionToDelete] = React.useState<Definition | null>(null)

  const [isReorderingEnabled, setIsReorderingEnabled] = React.useState(false)
  const [draggedDefinition, setDraggedDefinition] = React.useState<Definition | null>(null)
  const [dragOverDefinition, setDragOverDefinition] = React.useState<Definition | null>(null)

  const [quickCreateSelectedSubTopicIds, setQuickCreateSelectedSubTopicIds] = React.useState<string[]>([])
  const [quickCreateDefinitionsBySubTopicId, setQuickCreateDefinitionsBySubTopicId] = React.useState<Record<string, string>>({})

  const fetchExams = React.useCallback(async () => {
    try {
      const res = await fetch(`${EXAMS_API}?contextapi=1`)
      if (!res.ok) throw new Error("Failed to load exams")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.exams ?? [])
      setExams(list.map((e: { id: string; name: string; status?: string }) => ({ id: e.id, name: e.name, status: e.status })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load exams") }
  }, [])
  const fetchSubjects = React.useCallback(async () => {
    try {
      const res = await fetch(SUBJECTS_API)
      if (!res.ok) throw new Error("Failed to load subjects")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.subjects ?? [])
      setSubjects(list.map((s: { id: string; name: string; examId: string; status?: string; orderNumber?: number }) => ({ id: s.id, name: s.name, examId: s.examId, status: s.status, orderNumber: s.orderNumber })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load subjects") }
  }, [])
  const fetchUnits = React.useCallback(async () => {
    try {
      const res = await fetch(UNITS_API)
      if (!res.ok) throw new Error("Failed to load units")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.units ?? [])
      setUnits(list.map((u: { id: string; name: string; subjectId: string; status?: string; orderNumber?: number }) => ({ id: u.id, name: u.name, subjectId: u.subjectId, status: u.status, orderNumber: u.orderNumber })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load units") }
  }, [])
  const fetchChapters = React.useCallback(async () => {
    try {
      const res = await fetch(CHAPTERS_API)
      if (!res.ok) throw new Error("Failed to load chapters")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.chapters ?? [])
      setChapters(list.map((c: { id: string; unitId: string; name: string; orderNumber: number; status?: string }) => ({ id: c.id, unitId: c.unitId, name: c.name, orderNumber: c.orderNumber ?? 0, status: c.status ?? "Active" })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load chapters") }
  }, [])
  const fetchTopics = React.useCallback(async () => {
    try {
      const res = await fetch(`${TOPICS_API}?contextapi=1`)
      if (!res.ok) throw new Error("Failed to load topics")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.topics ?? [])
      setTopics(list.map((t: { id: string; chapterId: string; name: string; order?: number; status?: string }) => ({ id: t.id, chapterId: t.chapterId, name: t.name, orderNumber: t.order ?? 0, status: t.status ?? "Active" })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load topics") }
  }, [])
  const fetchSubTopics = React.useCallback(async () => {
    try {
      const res = await fetch(`${SUBTOPICS_API}?contextapi=1`)
      if (!res.ok) throw new Error("Failed to load subtopics")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.subtopics ?? [])
      setSubTopics(list.map((st: { id: string; topicId: string; name: string; order?: number; status?: string }) => ({ id: st.id, topicId: st.topicId, name: st.name, orderNumber: st.order ?? 0, status: st.status ?? "Active" })))
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load subtopics") }
  }, [])
  const fetchDefinitions = React.useCallback(async () => {
    try {
      const res = await fetch(DEFINITIONS_API)
      if (!res.ok) throw new Error("Failed to load definitions")
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.definitions ?? [])
      setDefinitions(list)
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load definitions") }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchExams(), fetchSubjects(), fetchUnits(), fetchChapters(), fetchTopics(), fetchSubTopics(), fetchDefinitions()])
    setLoading(false)
  }, [fetchExams, fetchSubjects, fetchUnits, fetchChapters, fetchTopics, fetchSubTopics, fetchDefinitions])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const availableExams = React.useMemo(() => exams.filter((e) => e.status !== "Inactive"), [exams])
  const subjectsForSelectedExam = React.useMemo(() => subjects.filter((s) => s.examId === selectedExamId && s.status !== "Inactive"), [subjects, selectedExamId])
  const unitsForSelectedSubject = React.useMemo(() => units.filter((u) => u.subjectId === selectedSubjectId && u.status !== "Inactive"), [units, selectedSubjectId])
  const chaptersForSelectedUnit = React.useMemo(() => chapters.filter((c) => c.unitId === selectedUnitId && c.status !== "Inactive").sort((a, b) => a.orderNumber - b.orderNumber), [chapters, selectedUnitId])
  const topicsForSelectedChapter = React.useMemo(() => topics.filter((t) => t.chapterId === selectedChapterId && t.status !== "Inactive").sort((a, b) => a.orderNumber - b.orderNumber), [topics, selectedChapterId])
  const subTopicsForSelectedTopic = React.useMemo(() => subTopics.filter((st) => st.topicId === selectedTopicId && st.status !== "Inactive").sort((a, b) => a.orderNumber - b.orderNumber), [subTopics, selectedTopicId])

  const subjectsForExamFilter = React.useMemo(() => (examFilter === "all" ? [] : subjects.filter((s) => String(s.examId) === examFilter)), [subjects, examFilter])
  const unitsForSubjectFilter = React.useMemo(() => (subjectFilter === "all" ? [] : units.filter((u) => String(u.subjectId) === subjectFilter)), [units, subjectFilter])
  const chaptersForUnitFilter = React.useMemo(() => (unitFilter === "all" ? [] : chapters.filter((c) => String(c.unitId) === unitFilter).sort((a, b) => a.orderNumber - b.orderNumber)), [chapters, unitFilter])
  const topicsForChapterFilter = React.useMemo(() => (chapterFilter === "all" ? [] : topics.filter((t) => String(t.chapterId) === chapterFilter).sort((a, b) => a.orderNumber - b.orderNumber)), [topics, chapterFilter])
  const subTopicsForTopicFilter = React.useMemo(() => (topicFilter === "all" ? [] : subTopics.filter((st) => String(st.topicId) === topicFilter).sort((a, b) => a.orderNumber - b.orderNumber)), [subTopics, topicFilter])

  const quickCreateAvailableSubTopics = React.useMemo(() => {
    return subTopics.filter((st) => {
      const topic = topics.find((t) => t.id === st.topicId)
      if (!topic) return false
      const chapter = chapters.find((c) => c.id === topic.chapterId)
      if (!chapter) return false
      const unit = units.find((u) => u.id === chapter.unitId)
      if (!unit) return false
      const subject = subjects.find((s) => s.id === unit.subjectId)
      return subject && availableExams.some((e) => e.id === subject.examId) && st.status !== "Inactive"
    })
  }, [subTopics, topics, chapters, units, subjects, availableExams])

  const getExamName = (examId: string) => capitalize(exams.find((e) => e.id === examId)?.name ?? "-")
  const getSubjectName = (subjectId: string) => capitalize(subjects.find((s) => s.id === subjectId)?.name ?? "-")
  const getUnitName = (unitId: string) => capitalize(units.find((u) => u.id === unitId)?.name ?? "-")
  const getChapterName = (chapterId: string) => capitalize(chapters.find((c) => c.id === chapterId)?.name ?? "-")
  const getTopicName = (topicId: string) => capitalize(topics.find((t) => t.id === topicId)?.name ?? "-")
  const getSubTopicName = (subTopicId: string) => capitalize(subTopics.find((st) => st.id === subTopicId)?.name ?? "-")

  const quickCreateSelectedSubTopicsSorted = React.useMemo(() => {
    return quickCreateAvailableSubTopics
      .filter((st) => quickCreateSelectedSubTopicIds.includes(st.id))
      .sort((a, b) => {
        const tA = topics.find((t) => t.id === a.topicId)
        const tB = topics.find((t) => t.id === b.topicId)
        if (!tA || !tB) return 0
        const cA = chapters.find((c) => c.id === tA.chapterId)
        const cB = chapters.find((c) => c.id === tB.chapterId)
        if (!cA || !cB) return 0
        const uA = units.find((u) => u.id === cA.unitId)
        const uB = units.find((u) => u.id === cB.unitId)
        if (!uA || !uB) return 0
        const sA = subjects.find((s) => s.id === uA.subjectId)
        const sB = subjects.find((s) => s.id === uB.subjectId)
        if (!sA || !sB) return 0
        if (getExamName(sA.examId) !== getExamName(sB.examId)) return getExamName(sA.examId).localeCompare(getExamName(sB.examId))
        if (sA.name !== sB.name) return sA.name.localeCompare(sB.name)
        if (uA.name !== uB.name) return uA.name.localeCompare(uB.name)
        if (cA.name !== cB.name) return cA.name.localeCompare(cB.name)
        if (tA.name !== tB.name) return tA.name.localeCompare(tB.name)
        return a.orderNumber - b.orderNumber
      })
  }, [quickCreateAvailableSubTopics, quickCreateSelectedSubTopicIds, topics, chapters, units, subjects])

  const quickCreateTopicsGrouped = React.useMemo(() => {
    const byTopic = new Map<string, { topicId: string; label: string; subTopicIds: string[] }>()
    quickCreateAvailableSubTopics.forEach((st) => {
      const topic = topics.find((t) => t.id === st.topicId)
      if (!topic) return
      const chapter = chapters.find((c) => c.id === topic.chapterId)
      const unit = chapter ? units.find((u) => u.id === chapter.unitId) : null
      const subject = unit ? subjects.find((s) => s.id === unit.subjectId) : null
      if (!subject) return
      if (!byTopic.has(st.topicId)) {
        byTopic.set(st.topicId, {
          topicId: st.topicId,
          label: `${getExamName(subject.examId)} > ${capitalize(subject.name)} > ${capitalize(unit!.name)} > ${capitalize(chapter!.name)} > ${capitalize(topic.name)}`,
          subTopicIds: [],
        })
      }
      byTopic.get(st.topicId)!.subTopicIds.push(st.id)
    })
    return Array.from(byTopic.values())
  }, [quickCreateAvailableSubTopics, topics, chapters, units, subjects])

  React.useEffect(() => {
    if (!selectedTopicId) return
    setAddDefinitionRows([{ subtopicId: null, definitionNames: "" }])
  }, [selectedTopicId])

  const updateAddRow = (index: number, field: "subtopicId" | "definitionNames", value: string | null) => {
    setAddDefinitionRows((prev) => {
      const next = [...prev]
      if (field === "subtopicId") next[index] = { ...next[index], subtopicId: value }
      else next[index] = { ...next[index], definitionNames: value ?? "" }
      return next
    })
  }
  const removeAddRow = (index: number) => setAddDefinitionRows((prev) => prev.filter((_, i) => i !== index))
  const addAnotherSubTopicRow = () => setAddDefinitionRows((prev) => [...prev, { subtopicId: null, definitionNames: "" }])

  const handleAddDefinitions = async () => {
    const toCreate: { subtopicId: string; name: string }[] = []
    addDefinitionRows.forEach((row) => {
      if (!row.subtopicId) return
      const rawNames = row.definitionNames.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      const existing = new Set(definitions.filter((d) => d.subtopicId === row.subtopicId).map((d) => d.name.toLowerCase()))
      const names = uniqueNamesPerSubTopic(rawNames, existing)
      names.forEach((name) => toCreate.push({ subtopicId: row.subtopicId!, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    let duplicate = 0
    for (const { subtopicId, name } of toCreate) {
      try {
        const res = await fetch(DEFINITIONS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, subtopicId }),
        })
        if (res.status === 409) {
          duplicate++
          toast.warning(`"${name}" already exists in this subtopic`)
          continue
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to create definition")
          continue
        }
        created++
      } catch {
        toast.error("Failed to create definition")
      }
    }
    if (created) {
      await fetchDefinitions()
      toast.success(`${created} definition(s) created`)
    }
    if (duplicate && !created) toast.warning(`${duplicate} skipped (already exist in this subtopic)`)
    setIsAddDialogOpen(false)
    setSelectedExamId(null)
    setSelectedSubjectId(null)
    setSelectedUnitId(null)
    setSelectedChapterId(null)
    setSelectedTopicId(null)
    setAddDefinitionRows([{ subtopicId: null, definitionNames: "" }])
  }

  const toggleQuickCreateSubTopic = (id: string) => setQuickCreateSelectedSubTopicIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleQuickCreateSelectAll = () => setQuickCreateSelectedSubTopicIds((prev) => (prev.length === quickCreateAvailableSubTopics.length ? [] : quickCreateAvailableSubTopics.map((st) => st.id)))
  const toggleQuickCreateByTopic = (topicId: string) => {
    const group = quickCreateTopicsGrouped.find((g) => g.topicId === topicId)
    if (!group) return
    setQuickCreateSelectedSubTopicIds((prev) => {
      const allSelected = group.subTopicIds.every((id) => prev.includes(id))
      if (allSelected) return prev.filter((id) => !group.subTopicIds.includes(id))
      const added = new Set(prev)
      group.subTopicIds.forEach((id) => added.add(id))
      return Array.from(added)
    })
  }
  const resetQuickCreate = () => {
    setQuickCreateSelectedSubTopicIds([])
    setQuickCreateDefinitionsBySubTopicId({})
  }

  const handleBulkCreateDefinitions = async () => {
    if (quickCreateSelectedSubTopicIds.length === 0) return
    const toCreate: { subtopicId: string; name: string }[] = []
    quickCreateSelectedSubTopicsSorted.forEach((st) => {
      const raw = (quickCreateDefinitionsBySubTopicId[st.id] || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      const existing = new Set(definitions.filter((d) => d.subtopicId === st.id).map((d) => d.name.toLowerCase()))
      const names = uniqueNamesPerSubTopic(raw, existing)
      names.forEach((name) => toCreate.push({ subtopicId: st.id, name }))
    })
    if (toCreate.length === 0) return
    let created = 0
    for (const { subtopicId, name } of toCreate) {
      try {
        const res = await fetch(DEFINITIONS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, subtopicId }) })
        if (res.status === 409) { toast.warning(`"${name}" already exists in this subtopic`); continue }
        if (!res.ok) { toast.error("Failed to create definition"); continue }
        created++
      } catch { toast.error("Failed to create definition") }
    }
    if (created) { await fetchDefinitions(); toast.success(`${created} definition(s) created`) }
    setIsQuickCreateOpen(false)
    resetQuickCreate()
  }

  const openEditDialog = (d: Definition) => { setEditingDefinition({ ...d }); setIsEditDialogOpen(true) }
  const handleEditDefinition = async () => {
    if (!editingDefinition) return
    try {
      const res = await fetch(`${DEFINITIONS_API}/${editingDefinition.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingDefinition.name, orderNumber: editingDefinition.orderNumber }),
      })
      if (res.status === 409) { toast.warning("A definition with this name already exists in this subtopic"); return }
      if (!res.ok) { toast.error("Failed to update definition"); return }
      await fetchDefinitions()
      toast.success("Definition updated")
      setIsEditDialogOpen(false)
      setEditingDefinition(null)
    } catch { toast.error("Failed to update definition") }
  }
  const handleDeleteDefinition = (d: Definition) => { setDefinitionToDelete(d); setIsDeleteDialogOpen(true) }
  const confirmDeleteDefinition = async () => {
    if (!definitionToDelete) return
    try {
      const res = await fetch(`${DEFINITIONS_API}/${definitionToDelete.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to delete definition"); return }
      await fetchDefinitions()
      toast.success("Definition deleted")
      setIsDeleteDialogOpen(false)
      setDefinitionToDelete(null)
    } catch { toast.error("Failed to delete definition") }
  }
  const handleToggleStatus = async (id: string) => {
    const d = definitions.find((x) => x.id === id)
    if (!d) return
    const nextStatus = d.status === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch(`${DEFINITIONS_API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) })
      if (!res.ok) { toast.error("Failed to update status"); return }
      await fetchDefinitions()
      toast.success(`Status set to ${nextStatus}`)
    } catch { toast.error("Failed to update status") }
  }

  const enableReordering = () => setIsReorderingEnabled(true)
  const disableReordering = () => { setIsReorderingEnabled(false); setDraggedDefinition(null); setDragOverDefinition(null) }
  const saveReorderedDefinitions = async () => {
    if (!draggedDefinition) { setIsReorderingEnabled(false); setDraggedDefinition(null); setDragOverDefinition(null); return }
    const group = definitions.filter((d) => d.subtopicId === draggedDefinition.subtopicId).slice().sort((a, b) => a.orderNumber - b.orderNumber)
    const order = group.map((d, idx) => ({ id: d.id, orderNumber: idx + 1 }))
    try {
      const res = await fetch(`${DEFINITIONS_API}/reorder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order }) })
      if (!res.ok) { toast.error("Failed to save order"); return }
      await fetchDefinitions()
      toast.success("Order saved")
    } catch { toast.error("Failed to save order") }
    setIsReorderingEnabled(false)
    setDraggedDefinition(null)
    setDragOverDefinition(null)
  }

  const handleDefinitionDragStart = (e: React.DragEvent, d: Definition) => {
    if (!isReorderingEnabled) return
    setDraggedDefinition(d)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(d.id))
  }
  const handleDefinitionDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move" }
  const handleDefinitionDragEnter = (d: Definition) => setDragOverDefinition(d)
  const handleDefinitionDragLeave = () => setDragOverDefinition(null)
  const handleDefinitionDrop = (e: React.DragEvent, target: Definition) => {
    e.preventDefault()
    if (!isReorderingEnabled || !draggedDefinition || draggedDefinition.id === target.id) return
    if (draggedDefinition.subtopicId !== target.subtopicId) return
    setDefinitions((prev) => {
      const other = prev.filter((d) => d.subtopicId !== target.subtopicId)
      const group = prev.filter((d) => d.subtopicId === target.subtopicId).slice().sort((a, b) => a.orderNumber - b.orderNumber)
      const fromIndex = group.findIndex((d) => d.id === draggedDefinition.id)
      const toIndex = group.findIndex((d) => d.id === target.id)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = group.splice(fromIndex, 1)
      group.splice(toIndex, 0, moved)
      const reordered = group.map((d, idx) => ({ ...d, orderNumber: idx + 1 }))
      return [...other, ...reordered]
    })
    setDraggedDefinition(null)
    setDragOverDefinition(null)
  }

  const filteredDefinitions = React.useMemo(() => {
    return definitions.filter((d) => {
      const st = subTopics.find((s) => s.id === d.subtopicId)
      if (!st) return false
      const topic = topics.find((t) => t.id === st.topicId)
      if (!topic) return false
      const chapter = chapters.find((c) => c.id === topic.chapterId)
      if (!chapter) return false
      const unit = units.find((u) => u.id === chapter.unitId)
      if (!unit) return false
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return false
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExam = examFilter === "all" || String(subject.examId) === examFilter
      const matchesSubject = subjectFilter === "all" || String(unit.subjectId) === subjectFilter
      const matchesUnit = unitFilter === "all" || String(chapter.unitId) === unitFilter
      const matchesChapter = chapterFilter === "all" || String(topic.chapterId) === chapterFilter
      const matchesTopic = topicFilter === "all" || String(st.topicId) === topicFilter
      const matchesSubTopic = subTopicFilter === "all" || String(d.subtopicId) === subTopicFilter
      const matchesMeta = metaFilter === "all" || (metaFilter === "filled" && d.meta !== "-") || (metaFilter === "not-filled" && d.meta === "-")
      return matchesSearch && matchesExam && matchesSubject && matchesUnit && matchesChapter && matchesTopic && matchesSubTopic && matchesMeta
    })
  }, [definitions, subTopics, topics, chapters, units, subjects, searchTerm, examFilter, subjectFilter, unitFilter, chapterFilter, topicFilter, subTopicFilter, metaFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, examFilter, subjectFilter, unitFilter, chapterFilter, topicFilter, subTopicFilter, metaFilter, pageSize])

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]
  const totalPages = Math.max(1, Math.ceil(filteredDefinitions.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedDefinitions = filteredDefinitions.slice(startIndex, startIndex + pageSize)

  const groupedPaged = React.useMemo(() => {
    const map = new Map<string, { examId: string; subjectId: string; unitId: string; chapterId: string; topicId: string; subTopicId: string; definitions: Definition[] }>()
    pagedDefinitions.forEach((d) => {
      const st = subTopics.find((s) => s.id === d.subtopicId)
      if (!st) return
      const topic = topics.find((t) => t.id === st.topicId)
      if (!topic) return
      const chapter = chapters.find((c) => c.id === topic.chapterId)
      if (!chapter) return
      const unit = units.find((u) => u.id === chapter.unitId)
      if (!unit) return
      const subject = subjects.find((s) => s.id === unit.subjectId)
      if (!subject) return
      const key = `st-${d.subtopicId}`
      if (!map.has(key)) {
        map.set(key, { examId: subject.examId, subjectId: unit.subjectId, unitId: chapter.unitId, chapterId: topic.chapterId, topicId: st.topicId, subTopicId: d.subtopicId, definitions: [] })
      }
      map.get(key)!.definitions.push(d)
    })
    map.forEach((v) => { v.definitions.sort((a, b) => a.orderNumber - b.orderNumber) })
    return Array.from(map.values())
  }, [pagedDefinitions, subTopics, topics, chapters, units, subjects])

  const totalDefinitions = definitions.length
  const activeDefinitions = definitions.filter((d) => d.status === "Active").length
  const totalVisits = definitions.reduce((s, d) => s + d.visits, 0)
  const todayVisits = definitions.reduce((s, d) => s + d.today, 0)

  const canAddDefinitions = addDefinitionRows.some((r) => r.subtopicId && r.definitionNames.trim().split(/\r?\n/).some((l) => l.trim()))

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 rounded-lg" />
          <Separator orientation="vertical" className="mr-2 h-5 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Definitions</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Definitions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Add New Definitions</DialogTitle>
                <DialogDescription>
                  Select exam, subject, unit, chapter, and topic. Then select subtopic(s) and enter definition names for each subtopic (one per line). Each definition name must be unique within the same subtopic.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Exam *</Label>
                  <Select value={selectedExamId ?? ""} onValueChange={(v) => { setSelectedExamId(v || null); setSelectedSubjectId(null); setSelectedUnitId(null); setSelectedChapterId(null); setSelectedTopicId(null); }}>
                    <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>{availableExams.map((e) => <SelectItem key={e.id} value={e.id}>{capitalize(e.name)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subject *</Label>
                  <Select value={selectedSubjectId ?? ""} onValueChange={(v) => { setSelectedSubjectId(v || null); setSelectedUnitId(null); setSelectedChapterId(null); setSelectedTopicId(null); }} disabled={!selectedExamId}>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>{subjectsForSelectedExam.map((s) => <SelectItem key={s.id} value={s.id}>{capitalize(s.name)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unit *</Label>
                  <Select value={selectedUnitId ?? ""} onValueChange={(v) => { setSelectedUnitId(v || null); setSelectedChapterId(null); setSelectedTopicId(null); }} disabled={!selectedSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                    <SelectContent>{unitsForSelectedSubject.map((u) => <SelectItem key={u.id} value={u.id}>{capitalize(u.name)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Chapter *</Label>
                  <Select value={selectedChapterId ?? ""} onValueChange={(v) => { setSelectedChapterId(v || null); setSelectedTopicId(null); }} disabled={!selectedUnitId}>
                    <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
                    <SelectContent>{chaptersForSelectedUnit.map((c) => <SelectItem key={c.id} value={c.id}>{capitalize(c.name)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Topic *</Label>
                  <Select value={selectedTopicId ?? ""} onValueChange={(v) => setSelectedTopicId(v || null)} disabled={!selectedChapterId}>
                    <SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger>
                    <SelectContent>{topicsForSelectedChapter.map((t) => <SelectItem key={t.id} value={t.id}>{capitalize(t.name)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select SubTopic(s) and Enter Definitions *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAnotherSubTopicRow}>
                      Add Another SubTopic
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select subtopics and enter definitions for each subtopic separately. Each subtopic has its own textarea. Each definition name must be unique within the same subtopic.
                  </p>
                  <div className="max-h-[280px] space-y-4 overflow-y-auto rounded-md border p-3">
                    {addDefinitionRows.map((row, index) => (
                      <div key={index} className="rounded border bg-muted/20 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="shrink-0 text-xs">SubTopic {index + 1} *</Label>
                          <Select value={row.subtopicId ?? ""} onValueChange={(v) => updateAddRow(index, "subtopicId", v || null)} disabled={!selectedTopicId}>
                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select SubTopic" /></SelectTrigger>
                            <SelectContent>{subTopicsForSelectedTopic.map((st) => <SelectItem key={st.id} value={st.id}>{capitalize(st.name)}</SelectItem>)}</SelectContent>
                          </Select>
                          {addDefinitionRows.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => removeAddRow(index)}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                        <Textarea placeholder={"Definition 1\nDefinition 2\n..."} value={row.definitionNames} onChange={(e) => updateAddRow(index, "definitionNames", e.target.value)} className="min-h-[80px] text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDefinitions} disabled={!canAddDefinitions}>Add Definitions</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setIsQuickCreateOpen(true)}>Quick Create</Button>
        </div>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">Loading definitions…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 px-6 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => loadData()}>Retry</Button>
          </div>
        ) : isQuickCreateOpen ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <Button variant="ghost" size="sm" className="-ml-2 shrink-0" onClick={() => { setIsQuickCreateOpen(false); resetQuickCreate(); }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
              </Button>
              <CardTitle className="text-xl">Quick Create Definitions</CardTitle>
              <CardDescription>Select one or more subtopics and enter definition names for each subtopic (one per line). Duplicate names within a subtopic are skipped.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Sub Topics *</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button variant="link" size="sm" className="h-auto px-0 text-muted-foreground" type="button" onClick={toggleQuickCreateSelectAll}>
                        {quickCreateSelectedSubTopicIds.length === quickCreateAvailableSubTopics.length ? "Clear all" : "Select all"}
                      </Button>
                      {quickCreateTopicsGrouped.length > 1 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          {quickCreateTopicsGrouped.map(({ topicId, label, subTopicIds }) => {
                            const allIn = subTopicIds.every((id) => quickCreateSelectedSubTopicIds.includes(id))
                            return (
                              <Button key={topicId} type="button" variant={allIn ? "secondary" : "outline"} size="sm" className="h-8 rounded-full px-3 text-xs font-medium" onClick={() => toggleQuickCreateByTopic(topicId)}>
                                {allIn ? "✓ " : ""}{label}
                              </Button>
                            )
                          })}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Click a topic to select or clear all its subtopics at once.</p>
                  <div className="rounded-md border bg-background">
                    <div className="max-h-56 overflow-auto p-2">
                      {quickCreateAvailableSubTopics.map((st) => {
                        const topic = topics.find((t) => t.id === st.topicId)
                        const chapter = topic ? chapters.find((c) => c.id === topic.chapterId) : null
                        const unit = chapter ? units.find((u) => u.id === chapter.unitId) : null
                        const subject = unit ? subjects.find((s) => s.id === unit.subjectId) : null
                        const label = subject && unit && chapter && topic ? `${getExamName(subject.examId)} > ${capitalize(subject.name)} > ${capitalize(unit.name)} > ${capitalize(chapter.name)} > ${capitalize(topic.name)} > ${capitalize(st.name)}` : capitalize(st.name)
                        const checked = quickCreateSelectedSubTopicIds.includes(st.id)
                        return (
                          <label key={st.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                            <input type="checkbox" checked={checked} onChange={() => toggleQuickCreateSubTopic(st.id)} className="h-4 w-4" />
                            <span className="text-sm">{label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">{quickCreateSelectedSubTopicIds.length} subtopic{quickCreateSelectedSubTopicIds.length === 1 ? "" : "s"} selected</div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Definition Names *</Label>
                  {quickCreateSelectedSubTopicsSorted.length === 0 ? (
                    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">Select at least one subtopic to start adding definitions.</div>
                  ) : (
                    <div className="grid gap-4">
                      {quickCreateSelectedSubTopicsSorted.map((st) => {
                        const topic = topics.find((t) => t.id === st.topicId)
                        const chapter = topic ? chapters.find((c) => c.id === topic.chapterId) : null
                        const unit = chapter ? units.find((u) => u.id === chapter.unitId) : null
                        const subject = unit ? subjects.find((s) => s.id === unit.subjectId) : null
                        const label = subject && unit && chapter && topic ? `${getExamName(subject.examId)} > ${capitalize(subject.name)} > ${capitalize(unit.name)} > ${capitalize(chapter.name)} > ${capitalize(topic.name)} > ${capitalize(st.name)}` : capitalize(st.name)
                        return (
                          <div key={st.id} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium">{label} <span className="text-destructive">*</span></div>
                              <div className="text-xs text-muted-foreground">One definition per line (unique per subtopic)</div>
                            </div>
                            <Textarea value={quickCreateDefinitionsBySubTopicId[st.id] ?? ""} onChange={(e) => setQuickCreateDefinitionsBySubTopicId((prev) => ({ ...prev, [st.id]: e.target.value }))} placeholder={"Definition 1\nDefinition 2\n..."} className="min-h-[110px]" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" type="button" onClick={() => { setIsQuickCreateOpen(false); resetQuickCreate(); }}>Cancel</Button>
                <Button type="button" onClick={handleBulkCreateDefinitions} disabled={quickCreateSelectedSubTopicIds.length === 0 || quickCreateSelectedSubTopicsSorted.every((st) => !(quickCreateDefinitionsBySubTopicId[st.id] || "").trim())}>Create Definitions</Button>
              </div>
            </CardContent>
          </Card>
       ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Definitions</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-blue-500"></div></div>
                </CardHeader>
                <CardContent className="pt-0 pb-4"><div className="text-xl font-bold leading-none">{totalDefinitions}</div><p className="text-[11px] text-muted-foreground mt-0.5">All definitions in system</p></CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Active Definitions</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-green-500"></div></div>
                </CardHeader>
                <CardContent className="pt-0 pb-4"><div className="text-xl font-bold leading-none">{activeDefinitions}</div><p className="text-[11px] text-muted-foreground mt-0.5">Currently active</p></CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Total Visits</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-purple-500"></div></div>
                </CardHeader>
                <CardContent className="pt-0 pb-4"><div className="text-xl font-bold leading-none">{totalVisits}</div><p className="text-[11px] text-muted-foreground mt-0.5">All time visits</p></CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                  <CardTitle className="text-[13px] font-medium">Today&apos;s Visits</CardTitle>
                  <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-orange-500"></div></div>
                </CardHeader>
                <CardContent className="pt-0 pb-4"><div className="text-xl font-bold leading-none">{todayVisits}</div><p className="text-[11px] text-muted-foreground mt-0.5">Visits today</p></CardContent>
              </Card>
            </div>

            <Card className="min-w-0 shrink-0 border-border/80 shadow-sm">
              <CardHeader className="space-y-6 pb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl font-semibold tracking-tight">Definition Management</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Manage and organize your definitions, create new definitions, and track definition performance across your educational platform.</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isReorderingEnabled ? <Button variant="outline" size="sm" className="h-9 px-3" onClick={enableReordering}><GripVertical className="mr-2 h-4 w-4" />Reorder position</Button> : <><Button variant="outline" size="sm" className="h-9 px-3" onClick={disableReordering}>Cancel</Button><Button size="sm" className="h-9 px-3" onClick={saveReorderedDefinitions}>Save Order</Button></>}
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex flex-col gap-3 md:flex-row flex-wrap">
                  <div className="relative max-w-sm flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search definitions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 pl-10 rounded-lg" />
                  </div>
                  <Select value={examFilter} onValueChange={(v) => { setExamFilter(v); setSubjectFilter("all"); setUnitFilter("all"); setChapterFilter("all"); setTopicFilter("all"); setSubTopicFilter("all"); }}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Exams</SelectItem>{availableExams.map((e) => <SelectItem key={e.id} value={e.id}>{capitalize(e.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setUnitFilter("all"); setChapterFilter("all"); setTopicFilter("all"); setSubTopicFilter("all"); }} disabled={examFilter === "all"}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder={examFilter === "all" ? "Select exam first" : "Select Subject"} /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjectsForExamFilter.map((s) => <SelectItem key={s.id} value={s.id}>{capitalize(s.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={unitFilter} onValueChange={(v) => { setUnitFilter(v); setChapterFilter("all"); setTopicFilter("all"); setSubTopicFilter("all"); }} disabled={subjectFilter === "all"}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder={subjectFilter === "all" ? "Select subject first" : "Select Unit"} /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Units</SelectItem>{unitsForSubjectFilter.map((u) => <SelectItem key={u.id} value={u.id}>{capitalize(u.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={chapterFilter} onValueChange={(v) => { setChapterFilter(v); setTopicFilter("all"); setSubTopicFilter("all"); }} disabled={unitFilter === "all"}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder={unitFilter === "all" ? "Select unit first" : "Select Chapter"} /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Chapters</SelectItem>{chaptersForUnitFilter.map((c) => <SelectItem key={c.id} value={c.id}>{capitalize(c.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={topicFilter} onValueChange={(v) => { setTopicFilter(v); setSubTopicFilter("all"); }} disabled={chapterFilter === "all"}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder={chapterFilter === "all" ? "Select chapter first" : "Select Topic"} /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Topics</SelectItem>{topicsForChapterFilter.map((t) => <SelectItem key={t.id} value={t.id}>{capitalize(t.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={subTopicFilter} onValueChange={setSubTopicFilter} disabled={topicFilter === "all"}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder={topicFilter === "all" ? "Select topic first" : "Select SubTopic"} /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Sub Topics</SelectItem>{subTopicsForTopicFilter.map((st) => <SelectItem key={st.id} value={st.id}>{capitalize(st.name)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={metaFilter} onValueChange={(v: "all" | "filled" | "not-filled") => setMetaFilter(v)}>
                    <SelectTrigger className="h-10 w-[180px] rounded-lg"><SelectValue placeholder="Meta Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Items</SelectItem><SelectItem value="filled">Meta Filled</SelectItem><SelectItem value="not-filled">Meta Not Filled</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 overflow-hidden">
                <div className="space-y-5">
                  {groupedPaged.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"><GripVertical className="h-6 w-6 text-muted-foreground" /></div>
                      <p className="text-sm font-medium text-foreground">No definitions yet</p>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Add definitions via Add New Definitions or Quick Create for multiple subtopics at once.</p>
                    </div>
                  ) : (
                    groupedPaged.map(({ examId, subjectId, unitId, chapterId, topicId, subTopicId, definitions: groupDefs }) => (
                      <Card key={`${examId}-${subjectId}-${unitId}-${chapterId}-${topicId}-${subTopicId}`} className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getExamName(examId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getSubjectName(subjectId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getUnitName(unitId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getChapterName(chapterId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getTopicName(topicId)}</Badge>
                            <span className="text-muted-foreground">/</span>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{getSubTopicName(subTopicId)}</Badge>
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{groupDefs.length} definition{groupDefs.length === 1 ? "" : "s"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="w-full overflow-x-auto">
                            <Table className="table-fixed min-w-[780px] w-full sm:min-w-[980px]">
                              <TableHeader>
                                <TableRow className="border-b border-border/80 hover:bg-transparent">
                                  <TableHead className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[88px]">Order</TableHead>
                                  <TableHead className="min-w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:min-w-[200px]">Definition Name</TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[140px]">Content</TableHead>
                                  <TableHead className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta</TableHead>
                                  <TableHead className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visits</TableHead>
                                  <TableHead className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</TableHead>
                                  <TableHead className="w-[140px] shrink-0 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-[190px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {groupDefs.map((d) => (
                                  <TableRow key={d.id} className={`transition-colors ${d.status === "Inactive" ? "opacity-60" : "hover:bg-muted/40"} ${dragOverDefinition?.id === d.id ? "border-2 border-primary/30 bg-primary/5" : ""} ${isReorderingEnabled ? "cursor-move" : "cursor-default"}`} draggable={isReorderingEnabled} onDragStart={(e) => handleDefinitionDragStart(e, d)} onDragOver={handleDefinitionDragOver} onDragEnter={() => handleDefinitionDragEnter(d)} onDragLeave={handleDefinitionDragLeave} onDrop={(e) => handleDefinitionDrop(e, d)}>
                                    <TableCell className="py-3 pr-3"><div className={isReorderingEnabled ? "flex cursor-grab items-center justify-center gap-2 text-muted-foreground" : "flex items-center justify-center"} title={isReorderingEnabled ? "Drag to reorder" : undefined}>{isReorderingEnabled && <GripVertical className="h-4 w-4" />}<span className="min-w-6 text-center font-medium text-foreground">{d.orderNumber}</span></div></TableCell>
                                    <TableCell>
                                        <Link
                                        href={`/self-study/definitions/${d.id}`}
                                        className={
                                          d.status === "Inactive"
                                            ? "line-through text-muted-foreground hover:underline hover:text-primary"
                                            : "hover:underline hover:text-primary"
                                        }
                                      >
                                        {capitalize(d.name)}
                                      </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{d.content !== "-" ? d.content : "unavailable"}</TableCell>
                                    <TableCell>{d.meta !== "-" ? <Check className="inline h-4 w-4 text-green-500" /> : "-"}</TableCell>
                                    <TableCell>{d.visits > 0 ? <div><div className="font-medium">{d.visits}</div><div className="text-xs text-muted-foreground">({d.uniqueVisits} unique)</div></div> : "-"}</TableCell>
                                    <TableCell>{d.today > 0 ? d.today : "-"}</TableCell>
                                    <TableCell className="text-right pr-2">
                                      <div className="flex items-center justify-end gap-1">
                                        <Link href={`/self-study/definitions/${d.id}`}><Button variant="ghost" size="sm" className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600" title="View"><Eye className="h-4 w-4" /></Button></Link>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-amber-500 hover:bg-amber-50 hover:text-amber-600" title="Edit" onClick={() => openEditDialog(d)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className={`h-8 w-8 ${d.status === "Active" ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`} title={d.status === "Active" ? "Turn Off" : "Turn On"} onClick={() => handleToggleStatus(d.id)}><Power className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={() => handleDeleteDefinition(d)}><Trash2 className="h-4 w-4" /></Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}><SelectTrigger className="h-9 w-[110px] rounded-lg"><SelectValue /></SelectTrigger><SelectContent>{PAGE_SIZE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select>
                      <span>{filteredDefinitions.length === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredDefinitions.length)} of ${filteredDefinitions.length}`}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-3" disabled={safePage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>
                      <Button variant="outline" size="sm" className="h-9 px-3" disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Definition</DialogTitle><DialogDescription>Update definition details.</DialogDescription></DialogHeader>
          {editingDefinition && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="edit-definition-name">Definition Name *</Label><Input id="edit-definition-name" value={editingDefinition.name} onChange={(e) => setEditingDefinition((prev) => (prev ? { ...prev, name: e.target.value } : null))} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-definition-order">Order Number</Label><Input id="edit-definition-order" type="number" value={editingDefinition.orderNumber} onChange={(e) => setEditingDefinition((prev) => (prev ? { ...prev, orderNumber: parseInt(e.target.value, 10) || 0 } : null))} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEditDefinition}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle><DialogDescription>Are you sure you want to delete the definition &quot;{definitionToDelete?.name}&quot;? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeleteDefinition}>Delete Definition</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
