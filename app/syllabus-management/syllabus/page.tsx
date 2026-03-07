"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SyllabusTreeAdmin, type SyllabusLevel, type SyllabusNode } from "@/components/syllabus/SyllabusTreeAdmin"
import { toTitleCase } from "@/lib/titleCase"

const LEVEL_API: Record<SyllabusLevel, string> = {
  subject: "subjects",
  unit: "units",
  chapter: "chapters",
  topic: "topics",
  subtopic: "subtopics",
  definition: "definitions",
}

interface Exam {
  id: string
  name: string
}

export default function SyllabusManagementPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [examId, setExamId] = useState<string>("")
  const [loadingExams, setLoadingExams] = useState(true)
  const [loadingHierarchy, setLoadingHierarchy] = useState(false)
  const [hierarchy, setHierarchy] = useState<{ exam: { id: string; name: string }; subjects: SyllabusNode[] } | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExams() {
      try {
        setLoadingExams(true)
        const res = await fetch("/api/exams?contextapi=1")
        if (!res.ok) throw new Error("Failed to fetch exams")
        const data = await res.json()
        setExams(Array.isArray(data) ? data : [])
      } catch {
        toast.error("Failed to load exams")
      } finally {
        setLoadingExams(false)
      }
    }
    fetchExams()
  }, [])

  useEffect(() => {
    if (!examId) {
      setHierarchy(null)
      return
    }
    async function fetchHierarchy() {
      try {
        setLoadingHierarchy(true)
        const res = await fetch(`/api/syllabus-hierarchy?examId=${encodeURIComponent(examId)}`)
        if (!res.ok) throw new Error("Failed to fetch syllabus")
        const data = await res.json()
        setHierarchy({ exam: data.exam, subjects: data.subjects ?? [] })
      } catch {
        toast.error("Failed to load syllabus hierarchy")
        setHierarchy(null)
      } finally {
        setLoadingHierarchy(false)
      }
    }
    fetchHierarchy()
  }, [examId])

  const handleSave = useCallback(
    async (id: string, level: SyllabusLevel, weightage: number | undefined, marks: number | undefined) => {
      if (weightage !== undefined && (Number.isNaN(weightage) || weightage < 0)) {
        toast.error("Weightage must be a non-negative number")
        return
      }
      if (marks !== undefined && (Number.isNaN(marks) || marks < 0)) {
        toast.error("Marks must be a non-negative number")
        return
      }
      setSavingId(id)
      try {
        const apiSegment = LEVEL_API[level]
        const res = await fetch(`/api/${apiSegment}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weightage, marks }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error ?? "Update failed")
        }
        toast.success("Updated weightage & marks")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update")
      } finally {
        setSavingId(null)
      }
    },
    []
  )

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/syllabus-management">Syllabus Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Syllabus</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Syllabus Management</h1>
            <p className="text-muted-foreground mt-1">
              Set weightage and marks for each level of the syllabus (subject, unit, chapter, topic, subtopic, definition).
            </p>
          </div>
          <div className="shrink-0 space-y-1.5">
            <Label className="text-sm">Exam</Label>
            <Select
              value={examId}
              onValueChange={setExamId}
              disabled={loadingExams}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={loadingExams ? "Loading…" : "Select exam"} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {toTitleCase(e.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {examId && (
          <Card>
            <CardHeader>
              <CardTitle>
                {toTitleCase(hierarchy?.exam?.name) || "Syllabus"} — Weightage & Marks
              </CardTitle>
              <CardDescription>
                Edit weightage and marks for each item and click Update to save.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHierarchy ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SyllabusTreeAdmin
                  subjects={hierarchy?.subjects ?? []}
                  savingId={savingId}
                  onSave={handleSave}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
