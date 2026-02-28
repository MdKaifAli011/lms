"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ContentEditorCard } from "@/components/self-study/content-editor-card"
import { ContentSeoLayout } from "@/components/self-study/content-seo-layout"
import { LastModifiedCreatedBar } from "@/components/self-study/last-modified-bar"
import { SeoSettingsForm } from "@/components/self-study/seo-settings-form"
import { DEFAULT_SEO, type SeoData } from "@/components/self-study/types"
import { capitalize } from "@/lib/utils"

const API_BASE = "/api/topics"

type Topic = {
  id: string
  chapterId: string
  name: string
  slug: string
  status?: string
  contentBody?: string
  lastModified?: string
  createdAt?: string
  seo?: SeoData
}

export default function TopicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [topicId, setTopicId] = React.useState<string | null>(null)
  const [topic, setTopic] = React.useState<Topic | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [seo, setSeo] = React.useState<SeoData>(DEFAULT_SEO)
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle")
  const initialContentFromApiRef = React.useRef("")
  const editorReadyRef = React.useRef(false)

  React.useEffect(() => {
    params.then((p) => setTopicId(p.slug))
  }, [params])

  React.useEffect(() => {
    const handleChange = (e: Event) => {
      const ev = e as CustomEvent<{ html: string }>
      if (ev.detail?.html !== undefined) setContent(ev.detail.html)
    }
    window.addEventListener("exam-editor-content-change", handleChange)
    return () => window.removeEventListener("exam-editor-content-change", handleChange)
  }, [])

  React.useEffect(() => {
    const handleReady = () => {
      editorReadyRef.current = true
      const html = initialContentFromApiRef.current || ""
      window.dispatchEvent(
        new CustomEvent("exam-editor-set-initial", { detail: { html } })
      )
    }
    window.addEventListener("exam-editor-ready", handleReady)
    return () => {
      window.removeEventListener("exam-editor-ready", handleReady)
      editorReadyRef.current = false
    }
  }, [])

  React.useEffect(() => {
    if (!topic?.id) return
    const html = typeof topic.contentBody === "string" ? topic.contentBody : ""
    initialContentFromApiRef.current = html
    if (editorReadyRef.current) {
      window.dispatchEvent(
        new CustomEvent("exam-editor-set-initial", { detail: { html } })
      )
    }
  }, [topic?.id, topic?.contentBody])

  React.useEffect(() => {
    if (!topicId) return
    let cancelled = false
    setLoaded(false)
    fetch(`${API_BASE}/${encodeURIComponent(topicId)}`)
      .then((res) => {
        if (cancelled) return
        if (!res.ok) {
          setTopic(null)
          return
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setTopic(data ?? null)
        if (data?.seo && typeof data.seo === "object") {
          setSeo({ ...DEFAULT_SEO, ...data.seo } as SeoData)
        }
        if (typeof data?.contentBody === "string") {
          setContent(data.contentBody)
        }
      })
      .catch(() => {
        if (!cancelled) setTopic(null)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [topicId])

  const saveContentAndSeo = React.useCallback(async () => {
    if (!topic?.id) return
    setSaveStatus("saving")
    try {
      const res = await fetch(`${API_BASE}/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentBody: content,
          seo: {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            metaKeywords: seo.metaKeywords,
            ogTitle: seo.ogTitle,
            ogDescription: seo.ogDescription,
            ogImageUrl: seo.ogImageUrl,
            canonicalUrl: seo.canonicalUrl,
            noIndex: seo.noIndex,
            noFollow: seo.noFollow,
          },
        }),
      })
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
      const updated = (await res.json()) as Topic
      setTopic(updated)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      toast.success("Content and SEO saved successfully")
    } catch (e) {
      setSaveStatus("idle")
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }, [topic?.id, content, seo])

  if (!loaded) {
    return (
      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4">
          <SidebarTrigger className="-ml-1 rounded-lg" />
          <Separator orientation="vertical" className="mr-2 h-5" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study/topics">Topics</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>…</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4">
          <SidebarTrigger className="-ml-1 rounded-lg" />
          <Separator orientation="vertical" className="mr-2 h-5" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study/topics">Topics</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Topic</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Topic not found</CardTitle>
              <CardDescription>No topic matches this link. It may have been removed or the URL is incorrect.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/self-study/topics">Back to Topics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 rounded-lg" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study">Self Study</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/self-study/topics">Topics</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{capitalize(topic.name)}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-md text-xs font-semibold">
            <Link href="/self-study/topics">Back to Topics</Link>
          </Button>
          <button type="button" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <MessageCircle className="h-5 w-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-destructive" aria-hidden />
          </button>
        </div>
      </header>

      <LastModifiedCreatedBar
        lastModified={topic.lastModified}
        createdAt={topic.createdAt}
        onSave={saveContentAndSeo}
        saveStatus={saveStatus}
      />

      <ContentSeoLayout
        content={<ContentEditorCard />}
        seoSidebar={<SeoSettingsForm seo={seo} setSeo={setSeo} idPrefix="topic-seo" />}
      />
    </div>
  )
}
