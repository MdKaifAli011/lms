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

const API_BASE = "/api/subtopics"

type SubTopic = {
  id: string
  topicId: string
  name: string
  slug: string
  status?: string
  contentBody?: string
  lastModified?: string
  createdAt?: string
  seo?: SeoData
}

export default function SubTopicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [subTopicId, setSubTopicId] = React.useState<string | null>(null)
  const [subTopic, setSubTopic] = React.useState<SubTopic | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [seo, setSeo] = React.useState<SeoData>(DEFAULT_SEO)
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle")
  const initialContentFromApiRef = React.useRef("")
  const editorReadyRef = React.useRef(false)

  React.useEffect(() => {
    params.then((p) => setSubTopicId(p.slug))
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
    if (!subTopic?.id) return
    const html = typeof subTopic.contentBody === "string" ? subTopic.contentBody : ""
    initialContentFromApiRef.current = html
    if (editorReadyRef.current) {
      window.dispatchEvent(
        new CustomEvent("exam-editor-set-initial", { detail: { html } })
      )
    }
  }, [subTopic?.id, subTopic?.contentBody])

  React.useEffect(() => {
    if (!subTopicId) return
    let cancelled = false
    setLoaded(false)
    fetch(`${API_BASE}/${encodeURIComponent(subTopicId)}`)
      .then((res) => {
        if (cancelled) return
        if (!res.ok) {
          setSubTopic(null)
          return
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setSubTopic(data ?? null)
        if (data?.seo && typeof data.seo === "object") {
          setSeo({ ...DEFAULT_SEO, ...data.seo } as SeoData)
        }
        if (typeof data?.contentBody === "string") {
          setContent(data.contentBody)
        }
      })
      .catch(() => {
        if (!cancelled) setSubTopic(null)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [subTopicId])

  const saveContentAndSeo = React.useCallback(async () => {
    if (!subTopic?.id) return
    setSaveStatus("saving")
    try {
      const res = await fetch(`${API_BASE}/${subTopic.id}`, {
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
      const updated = (await res.json()) as SubTopic
      setSubTopic(updated)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      toast.success("Content and SEO saved successfully")
    } catch (e) {
      setSaveStatus("idle")
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }, [subTopic?.id, content, seo])

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
              <BreadcrumbItem><BreadcrumbLink href="/self-study/sub-topics">Sub Topics</BreadcrumbLink></BreadcrumbItem>
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

  if (!subTopic) {
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
              <BreadcrumbItem><BreadcrumbLink href="/self-study/sub-topics">Sub Topics</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Sub Topic</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Sub Topic not found</CardTitle>
              <CardDescription>No sub topic matches this link. It may have been removed or the URL is incorrect.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/self-study/sub-topics">Back to Sub Topics</Link>
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
              <BreadcrumbItem><BreadcrumbLink href="/self-study/sub-topics">Sub Topics</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{capitalize(subTopic.name)}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-md text-xs font-semibold">
            <Link href="/self-study/sub-topics">Back to Sub Topics</Link>
          </Button>
          <button type="button" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <MessageCircle className="h-5 w-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-destructive" aria-hidden />
          </button>
        </div>
      </header>

      <LastModifiedCreatedBar
        lastModified={subTopic.lastModified}
        createdAt={subTopic.createdAt}
        onSave={saveContentAndSeo}
        saveStatus={saveStatus}
      />

      <ContentSeoLayout
        content={<ContentEditorCard />}
        seoSidebar={<SeoSettingsForm seo={seo} setSeo={setSeo} idPrefix="subtopic-seo" />}
      />
    </div>
  )
}
