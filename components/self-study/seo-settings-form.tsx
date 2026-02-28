"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { SeoData } from "./types"

type SeoSettingsFormProps = {
  seo: SeoData
  setSeo: React.Dispatch<React.SetStateAction<SeoData>>
  /** Prefix for input ids to avoid collisions when multiple forms exist (e.g. "exam", "subject") */
  idPrefix?: string
}

const defaultIdPrefix = "seo"

export function SeoSettingsForm({ seo, setSeo, idPrefix = defaultIdPrefix }: SeoSettingsFormProps) {
  const id = (name: string) => `${idPrefix}-${name}`

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={id("meta-title")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Meta Title
        </Label>
        <Input
          id={id("meta-title")}
          placeholder="Enter meta title"
          value={seo.metaTitle}
          onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))}
          className="border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">
          Title shown in Google search results (50–60 characters)
        </p>
      </div>
      <div>
        <Label htmlFor={id("meta-desc")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Meta Description
        </Label>
        <Textarea
          id={id("meta-desc")}
          placeholder="Enter description"
          value={seo.metaDescription}
          onChange={(e) => setSeo((s) => ({ ...s, metaDescription: e.target.value }))}
          rows={4}
          className="resize-none border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">
          Description shown in Google search results (150–160 characters)
        </p>
      </div>
      <div>
        <Label htmlFor={id("meta-keywords")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Meta Keywords
        </Label>
        <Input
          id={id("meta-keywords")}
          placeholder="e.g. exams, study, education"
          value={seo.metaKeywords}
          onChange={(e) => setSeo((s) => ({ ...s, metaKeywords: e.target.value }))}
          className="border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">Comma separated keywords (optional)</p>
      </div>
      <div>
        <Label htmlFor={id("og-title")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Open Graph Title
        </Label>
        <Input
          id={id("og-title")}
          placeholder="Social share title"
          value={seo.ogTitle}
          onChange={(e) => setSeo((s) => ({ ...s, ogTitle: e.target.value }))}
          className="border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">
          Title shown when shared on WhatsApp, Facebook, LinkedIn
        </p>
      </div>
      <div>
        <Label htmlFor={id("og-desc")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Open Graph Description
        </Label>
        <Textarea
          id={id("og-desc")}
          placeholder="Social share description"
          value={seo.ogDescription}
          onChange={(e) => setSeo((s) => ({ ...s, ogDescription: e.target.value }))}
          rows={3}
          className="resize-none border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">Description shown in social media previews</p>
      </div>
      <div>
        <Label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Open Graph Image
        </Label>
        <div
          className="border-border bg-muted/30 flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4"
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add("border-primary/50")
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("border-primary/50")}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove("border-primary/50")
            const f = e.dataTransfer.files[0]
            if (f?.type.startsWith("image/")) {
              setSeo((s) => ({ ...s, ogImageUrl: URL.createObjectURL(f) }))
            }
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Button type="button" variant="outline" size="sm" className="rounded-md" onClick={() => document.getElementById(id("og-image-file"))?.click()}>
              Create New
            </Button>
            <span className="text-muted-foreground">Or</span>
            <Button type="button" variant="ghost" size="sm" className="rounded-md" onClick={() => document.getElementById(id("og-image-file"))?.click()}>
              Choose from existing
            </Button>
            <span className="text-muted-foreground">Or</span>
            <span className="text-muted-foreground text-xs">Drag and drop a file</span>
          </div>
          <input
            id={id("og-image-file")}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setSeo((s) => ({ ...s, ogImageUrl: URL.createObjectURL(f) }))
            }}
          />
          {seo.ogImageUrl && (
            <div className="relative mt-2">
              <img src={seo.ogImageUrl} alt="OG" className="h-20 w-auto rounded object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                onClick={() => setSeo((s) => ({ ...s, ogImageUrl: "" }))}
              >
                ×
              </Button>
            </div>
          )}
          <p className="text-[10px] italic text-muted-foreground">Recommended size: 1200 × 630 pixels</p>
        </div>
      </div>
      <div>
        <Label htmlFor={id("canonical")} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Canonical URL
        </Label>
        <Input
          id={id("canonical")}
          placeholder="https://example.com/page"
          value={seo.canonicalUrl}
          onChange={(e) => setSeo((s) => ({ ...s, canonicalUrl: e.target.value }))}
          className="border-border bg-muted/50 text-sm focus:ring-primary"
        />
        <p className="mt-2 text-[10px] leading-relaxed italic text-muted-foreground">
          Use only if this page is a duplicate of another URL
        </p>
      </div>
      <div className="flex flex-col gap-3 pb-10">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={seo.noIndex}
            onChange={(e) => setSeo((s) => ({ ...s, noIndex: e.target.checked }))}
            className="border-input rounded"
          />
          <span className="text-sm font-medium">No Index</span>
        </label>
        <p className="-mt-1 text-[10px] italic text-muted-foreground">Prevent search engines from indexing this page</p>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={seo.noFollow}
            onChange={(e) => setSeo((s) => ({ ...s, noFollow: e.target.checked }))}
            className="border-input rounded"
          />
          <span className="text-sm font-medium">No Follow</span>
        </label>
        <p className="-mt-1 text-[10px] italic text-muted-foreground">Tell search engines not to follow links on this page</p>
      </div>
    </div>
  )
}
